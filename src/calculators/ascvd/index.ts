import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { UnitConverter } from '../../unit-converter.js';
import { ValidationRules, validateCalculatorInput } from '../../validator.js';
import { ValidationError } from '../../errorHandler.js';
import type { AlertSeverity } from '../../types/index.js';

// Module-level state to share between calculate and therapy logic
let currentBaselineRisk = 0;
let currentPatientData: any = {};

// Pure function for PCE Calculation
function calculatePCE(patient: any): number {
    const lnAge = Math.log(patient.age);
    const lnTC = Math.log(patient.tc);
    const lnHDL = Math.log(patient.hdl);
    const lnSBP = Math.log(patient.sbp);

    let individualSum = 0;
    let baselineSurvival = 0;
    let meanValue = 0;

    if (patient.isMale) {
        if (patient.race === 'white') {
            individualSum = 12.344 * lnAge +
                11.853 * lnTC -
                2.664 * lnAge * lnTC -
                7.99 * lnHDL +
                1.769 * lnAge * lnHDL +
                (patient.onHtnTx ? 1.797 : 1.764) * lnSBP +
                7.837 * (patient.isSmoker ? 1 : 0) -
                1.795 * lnAge * (patient.isSmoker ? 1 : 0) +
                0.658 * (patient.isDiabetic ? 1 : 0);
            meanValue = 61.18;
            baselineSurvival = 0.9144;
        } else {
            // African American Male
            individualSum = 2.469 * lnAge +
                0.302 * lnTC -
                0.307 * lnHDL +
                (patient.onHtnTx ? 1.916 : 1.809) * lnSBP +
                0.549 * (patient.isSmoker ? 1 : 0) +
                0.645 * (patient.isDiabetic ? 1 : 0);
            meanValue = 19.54;
            baselineSurvival = 0.8954;
        }
    } else {
        // Female
        if (patient.race === 'white') {
            individualSum = -29.799 * lnAge +
                4.884 * lnAge * lnAge +
                13.54 * lnTC -
                3.114 * lnAge * lnTC -
                13.578 * lnHDL +
                3.149 * lnAge * lnHDL +
                (patient.onHtnTx ? 2.019 * lnSBP : 1.957 * lnSBP) +
                7.574 * (patient.isSmoker ? 1 : 0) -
                1.665 * lnAge * (patient.isSmoker ? 1 : 0) +
                0.661 * (patient.isDiabetic ? 1 : 0);
            meanValue = -29.18;
            baselineSurvival = 0.9665;
        } else {
            // African American Female
            individualSum = 17.114 * lnAge +
                0.94 * lnTC -
                18.92 * lnHDL +
                4.475 * lnAge * lnHDL +
                (patient.onHtnTx ? 29.291 : 27.82) * lnSBP -
                6.432 * lnAge * lnSBP +
                0.691 * (patient.isSmoker ? 1 : 0) +
                0.874 * (patient.isDiabetic ? 1 : 0);
            meanValue = 86.61;
            baselineSurvival = 0.9533;
        }
    }
    const risk = (1 - Math.pow(baselineSurvival, Math.exp(individualSum - meanValue))) * 100;
    return Math.max(0, Math.min(100, risk));
}

// Therapy Impact Details HTML
const therapyImpactHTML = `
<div id="therapy-impact-section" class="therapy-section ui-hidden" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
    ${uiBuilder.createSection({
    title: '🎯 Therapy Impact Analysis',
    content: `
            <div class="alert alert-info">Baseline Risk: <span id="therapy-baseline-risk">--</span>%</div>
            <h5>Select Therapy Options:</h5>
            
            <div class="therapy-group">
                ${uiBuilder.createCheckbox({ id: 'statin-therapy', label: 'Statin Therapy', checked: true })}
                <div class="therapy-details" id="statin-details">
                    ${uiBuilder.createSelect({
        id: 'statin-intensity',
        label: 'Intensity',
        options: [
            { value: 'moderate', label: 'Moderate-Intensity Statin (30-50% LDL reduction)' },
            { value: 'high', label: 'High-Intensity Statin (≥50% LDL reduction)' },
            { value: 'low', label: 'Low-Intensity Statin (<30% LDL reduction)' }
        ]
    })}
                </div>
            </div>
            
            <div class="therapy-group">
                ${uiBuilder.createCheckbox({ id: 'lifestyle-mods', label: 'Lifestyle Modifications' })}
                <div class="therapy-details ui-hidden" id="lifestyle-details">
                    ${uiBuilder.createCheckbox({ id: 'smoking-cessation', label: 'Smoking Cessation' })}
                    ${uiBuilder.createCheckbox({ id: 'bp-control', label: 'BP Control (target <130/80)' })}
                </div>
            </div>
            
            <div class="therapy-group">
                ${uiBuilder.createCheckbox({ id: 'additional-therapy', label: 'Additional Therapies' })}
                <div class="therapy-details ui-hidden" id="additional-details">
                    ${uiBuilder.createSelect({
        id: 'additional-options',
        label: 'Option',
        options: [
            { value: 'ezetimibe', label: 'Ezetimibe (additional 15-20% LDL reduction)' },
            { value: 'pcsk9', label: 'PCSK9 Inhibitor (additional 50-60% LDL reduction)' },
            { value: 'aspirin', label: 'Low-dose Aspirin (if bleeding risk low)' }
        ]
    })}
                </div>
            </div>
            
            <button id="calculate-therapy-impact" class="ui-btn ui-btn-primary ui-btn-block mt-15">📊 Calculate Therapy Impact</button>
            <div id="therapy-results" class="therapy-results ui-hidden"></div>
        `
})}
</div>
`;

// Exported for testing
export const ascvdCalculation = (values: Record<string, any>) => {
    // Reset state
    currentBaselineRisk = 0;
    currentPatientData = {};

    // 1. Check Known ASCVD
    if (values['known-ascvd']) {
        return [{
            label: '10-Year ASCVD Risk',
            value: 'High Risk',
            interpretation: 'Known Clinical ASCVD (History of MI, stroke, PAD)',
            alertClass: 'danger' as AlertSeverity
        }, {
            label: 'Recommendation',
            value: 'Secondary Prevention',
            interpretation: 'High-intensity statin therapy is indicated.',
            alertClass: 'warning' as AlertSeverity
        }];
    }

    // 2. Validate Core Inputs Manually (since we set required: false)
    const requiredFields = ['ascvd-age', 'ascvd-tc', 'ascvd-hdl', 'ascvd-sbp'];
    const missing = requiredFields.filter(f => values[f] === undefined || values[f] === null);

    if (missing.length > 0) {
        throw new ValidationError('Please complete all fields (Age, TC, HDL, SBP).', 'MISSING_DATA');
    }

    const age = values['ascvd-age'];
    const tc = values['ascvd-tc'];
    const hdl = values['ascvd-hdl'];
    const sbp = values['ascvd-sbp'];

    // Validate standard ranges
    if (age < 40 || age > 79) {
        throw new ValidationError(`Valid for ages 40-79. Current age: ${age}.`, 'OUT_OF_RANGE');
    }

    // Prepare Patient Object
    const patient = {
        age,
        tc,
        hdl,
        sbp,
        isMale: values['ascvd-gender'] !== 'female', // default male
        race: values['ascvd-race'] || 'white',
        onHtnTx: values['ascvd-htn'] === 'yes',
        isDiabetic: values['ascvd-dm'] === 'yes',
        isSmoker: values['ascvd-smoker'] === 'yes'
    };

    const risk = calculatePCE(patient);
    currentBaselineRisk = risk;
    currentPatientData = patient;

    // Interpret
    let interpretation = '';
    let alertClass: AlertSeverity = 'info';

    if (risk < 5) {
        interpretation = 'Low Risk (<5%). Emphasize lifestyle modifications.';
        alertClass = 'success';
    } else if (risk < 7.5) {
        interpretation = 'Borderline Risk (5-7.4%). Discuss risk. Consider moderate-intensity statin.';
        alertClass = 'warning';
    } else if (risk < 20) {
        interpretation = 'Intermediate Risk (7.5-19.9%). Initiate moderate-intensity statin.';
        alertClass = 'warning';
    } else {
        interpretation = 'High Risk (≥20%). Initiate high-intensity statin.';
        alertClass = 'danger';
    }

    if (patient.race === 'other') {
        interpretation += '<br><small>Note: Risk for "Other" race may be over- or underestimated.</small>';
    }

    return [{
        label: '10-Year ASCVD Risk',
        value: risk.toFixed(1),
        unit: '%',
        interpretation: interpretation,
        alertClass: alertClass
    }];
};

export const ascvd = createUnifiedFormulaCalculator({
    id: 'ascvd',
    title: 'ASCVD Risk Calculator with Therapy Impact',
    description: 'Determines 10-year risk of hard ASCVD and calculates the impact of various therapies on risk reduction.',
    infoAlert: 'Valid for ages 40-79 years. Uses 2013 ACC/AHA Pooled Cohort Equations.',
    autoPopulateAge: 'ascvd-age',

    inputs: [
        {
            id: 'known-ascvd',
            label: 'Known Clinical ASCVD? (e.g., history of MI, stroke, PAD)',
            type: 'checkbox'
        },
        // Demographics
        {
            id: 'ascvd-age',
            label: 'Age',
            type: 'number',
            unit: 'years (40-79)',
            min: 40,
            max: 79,
            required: false // Handled in calculate
        },
        {
            id: 'ascvd-gender',
            label: 'Gender',
            type: 'radio',
            options: [
                { value: 'male', label: 'Male', checked: true },
                { value: 'female', label: 'Female' }
            ]
        },
        {
            id: 'ascvd-race',
            label: 'Race',
            type: 'radio',
            options: [
                { value: 'white', label: 'White', checked: true },
                { value: 'aa', label: 'African American' },
                { value: 'other', label: 'Other' }
            ]
        },
        // Labs
        {
            id: 'ascvd-tc',
            label: 'Total Cholesterol',
            type: 'number',
            loincCode: LOINC_CODES.CHOLESTEROL_TOTAL,
            unitToggle: { type: 'totalCholesterol', units: ['mg/dL', 'mmol/L'], default: 'mg/dL' },
            validationType: 'totalCholesterol',
            required: false
        },
        {
            id: 'ascvd-hdl',
            label: 'HDL Cholesterol',
            type: 'number',
            loincCode: LOINC_CODES.HDL,
            unitToggle: { type: 'hdl', units: ['mg/dL', 'mmol/L'], default: 'mg/dL' },
            validationType: 'hdl',
            required: false
        },
        {
            id: 'ascvd-sbp',
            label: 'Systolic BP',
            type: 'number',
            unit: 'mmHg',
            loincCode: LOINC_CODES.SYSTOLIC_BP,
            min: 50, max: 300,
            validationType: 'systolicBP',
            required: false
        },
        // Risk Factors
        {
            id: 'ascvd-htn',
            label: 'On Hypertension Treatment?',
            type: 'radio',
            options: [{ value: 'no', label: 'No', checked: true }, { value: 'yes', label: 'Yes' }]
        },
        {
            id: 'ascvd-dm',
            label: 'Diabetes?',
            type: 'radio',
            options: [{ value: 'no', label: 'No', checked: true }, { value: 'yes', label: 'Yes' }]
        },
        {
            id: 'ascvd-smoker',
            label: 'Current Smoker?',
            type: 'radio',
            options: [{ value: 'no', label: 'No', checked: true }, { value: 'yes', label: 'Yes' }]
        }
    ],

    calculate: ascvdCalculation,

    footerHTML: therapyImpactHTML,

    customInitialize: (client, patient, container, calculateFn) => {
        // Toggle inputs on Known ASCVD
        const knownCheckbox = container.querySelector('#known-ascvd') as HTMLInputElement;

        // Handle Therapy Section Logic
        const therapySection = container.querySelector('#therapy-impact-section') as HTMLElement;
        const baselineDisplay = container.querySelector('#therapy-baseline-risk') as HTMLElement;
        const resultsDiv = container.querySelector('#therapy-results') as HTMLElement;
        const calcBtn = container.querySelector('#calculate-therapy-impact');

        // Toggle UI logic for therapy options
        const toggleVisibility = (triggerId: string, targetId: string) => {
            const trigger = container.querySelector(`#${triggerId}`) as HTMLInputElement;
            const target = container.querySelector(`#${targetId}`) as HTMLElement;
            if (trigger && target) {
                trigger.addEventListener('change', () => {
                    target.classList.toggle('ui-hidden', !trigger.checked);
                });
            }
        };

        toggleVisibility('statin-therapy', 'statin-details');
        toggleVisibility('lifestyle-mods', 'lifestyle-details');
        toggleVisibility('additional-therapy', 'additional-details');

        // Use MutationObserver to simulate "onResult" event
        const resultBox = container.querySelector('#ascvd-result');
        if (resultBox) {
            const observer = new MutationObserver(() => {
                if (resultBox.classList.contains('show') && currentBaselineRisk > 0) {
                    if (therapySection) therapySection.classList.remove('ui-hidden');
                    if (baselineDisplay) baselineDisplay.textContent = currentBaselineRisk.toFixed(1);
                } else {
                    if (therapySection) therapySection.classList.add('ui-hidden');
                }
            });
            observer.observe(resultBox, { attributes: true, attributeFilter: ['class'] });
        }

        if (calcBtn) {
            calcBtn.addEventListener('click', () => {
                const resultsEl = container.querySelector('#therapy-results') as HTMLElement;
                if (!resultsEl) return;

                if (currentBaselineRisk <= 0) {
                    resultsEl.innerHTML = uiBuilder.createAlert({
                        type: 'danger',
                        message: 'Calculate baseline risk first.'
                    });
                    resultsEl.classList.remove('ui-hidden');
                    return;
                }

                // Copy patient data
                const modPatient = { ...currentPatientData };
                const interventions: string[] = [];

                // Statin
                const statinInput = container.querySelector('#statin-therapy') as HTMLInputElement;
                if (statinInput?.checked) {
                    const intensity = (container.querySelector('#statin-intensity') as HTMLSelectElement).value;
                    let ldlRed = 0.25; // low
                    if (intensity === 'high') ldlRed = 0.5;
                    if (intensity === 'moderate') ldlRed = 0.4;

                    const estimatedTrig = 150;
                    const currentLDL = modPatient.tc - modPatient.hdl - (estimatedTrig / 5);
                    const treatedLDL = currentLDL * (1 - ldlRed);
                    modPatient.tc = treatedLDL + modPatient.hdl + (estimatedTrig / 5);
                    interventions.push(intensity + '-intensity statin');
                }

                // Lifestyle
                const lifestyleInput = container.querySelector('#lifestyle-mods') as HTMLInputElement;
                if (lifestyleInput?.checked) {
                    const stopSmoke = container.querySelector('#smoking-cessation') as HTMLInputElement;
                    if (stopSmoke?.checked && modPatient.isSmoker) {
                        modPatient.isSmoker = false;
                        interventions.push('Smoking cessation');
                    }
                    const bpControl = container.querySelector('#bp-control') as HTMLInputElement;
                    if (bpControl?.checked && modPatient.sbp > 130) {
                        modPatient.sbp = 130;
                        modPatient.onHtnTx = true;
                        interventions.push('BP Control (<130/80)');
                    }
                }

                // Additional
                const addInput = container.querySelector('#additional-therapy') as HTMLInputElement;
                if (addInput?.checked) {
                    const opt = (container.querySelector('#additional-options') as HTMLSelectElement).value;
                    if (opt === 'ezetimibe' || opt === 'pcsk9') {
                        const red = opt === 'ezetimibe' ? 0.175 : 0.55;
                        const estimatedTrig = 150;
                        const currentLDL = modPatient.tc - modPatient.hdl - (estimatedTrig / 5);
                        const treatedLDL = currentLDL * (1 - red);
                        modPatient.tc = treatedLDL + modPatient.hdl + (estimatedTrig / 5);
                        interventions.push(opt === 'pcsk9' ? 'PCSK9 Inhibitor' : 'Ezetimibe');
                    }
                }

                const newRisk = calculatePCE(modPatient);
                const arr = Math.max(0, currentBaselineRisk - newRisk);
                const nnt = arr > 0 ? Math.round(100 / arr) : 'N/A';

                resultsEl.innerHTML = `
                    <div class="ui-result-item">
                        <div class="ui-result-label">Treated Risk</div>
                        <div class="ui-result-value-container">
                            <span class="ui-result-value" style="color: #2e7d32;">${newRisk.toFixed(1)}</span>
                            <span class="ui-result-unit">%</span>
                        </div>
                        <div class="ui-result-interpretation">ARR: ${arr.toFixed(1)}%</div>
                    </div>
                    <div class="ui-result-item">
                         <div class="ui-result-label">Number Needed to Treat</div>
                         <div class="ui-result-value-container"><span class="ui-result-value">${nnt}</span></div>
                    </div>
                    <div class="mt-10 text-muted small">Interventions: ${interventions.join(', ') || 'None'}</div>
                `;
                resultsEl.classList.remove('ui-hidden');
            });
        }
    }
});
