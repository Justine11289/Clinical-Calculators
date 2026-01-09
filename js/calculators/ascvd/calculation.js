import { ValidationError } from '../../errorHandler.js';
/**
 * Pooled Cohort Equations (PCE) Calculation
 *
 * Formula source: 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk
 *
 * Uses race- and sex-specific coefficients to estimate 10-year ASCVD risk:
 *   - White Male
 *   - African American Male
 *   - White Female
 *   - African American Female
 *
 * @param patient - PCEPatient object with required demographics and labs
 * @returns 10-year ASCVD risk as percentage (0-100)
 */
export function calculatePCE(patient) {
    const lnAge = Math.log(patient.age);
    const lnTC = Math.log(patient.tc);
    const lnHDL = Math.log(patient.hdl);
    const lnSBP = Math.log(patient.sbp);
    let individualSum = 0;
    let baselineSurvival = 0;
    let meanValue = 0;
    if (patient.isMale) {
        if (patient.race === 'white' || patient.race === 'other') {
            // White Male coefficients
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
        }
        else {
            // African American Male coefficients
            individualSum = 2.469 * lnAge +
                0.302 * lnTC -
                0.307 * lnHDL +
                (patient.onHtnTx ? 1.916 : 1.809) * lnSBP +
                0.549 * (patient.isSmoker ? 1 : 0) +
                0.645 * (patient.isDiabetic ? 1 : 0);
            meanValue = 19.54;
            baselineSurvival = 0.8954;
        }
    }
    else {
        // Female
        if (patient.race === 'white' || patient.race === 'other') {
            // White Female coefficients
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
        }
        else {
            // African American Female coefficients
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
// Module-level state to share between calculate and therapy logic
let currentBaselineRisk = 0;
let currentPatientData = null;
/**
 * Get the current baseline risk (for therapy impact calculations)
 */
export function getCurrentBaselineRisk() {
    return currentBaselineRisk;
}
/**
 * Get the current patient data (for therapy impact calculations)
 */
export function getCurrentPatientData() {
    return currentPatientData;
}
/**
 * ASCVD Risk Calculation Function
 *
 * Estimates 10-year ASCVD risk using Pooled Cohort Equations (PCE)
 * Valid for ages 40-79 years
 *
 * Reference: 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk
 *
 * @param values - Input values from calculator form
 * @returns FormulaResultItem[] with risk assessment
 */
export const ascvdCalculation = (values) => {
    // Reset state
    currentBaselineRisk = 0;
    currentPatientData = null;
    // 1. Check Known ASCVD (secondary prevention)
    if (values['known-ascvd']) {
        const results = [
            {
                label: '10-Year ASCVD Risk',
                value: 'High Risk',
                interpretation: 'Known Clinical ASCVD (History of MI, stroke, PAD)',
                alertClass: 'danger'
            },
            {
                label: 'Recommendation',
                value: 'Secondary Prevention',
                interpretation: 'High-intensity statin therapy is indicated.',
                alertClass: 'warning'
            }
        ];
        return results;
    }
    // 2. Validate Core Inputs
    const requiredFields = ['ascvd-age', 'ascvd-tc', 'ascvd-hdl', 'ascvd-sbp'];
    const missing = requiredFields.filter(f => values[f] === undefined || values[f] === null);
    if (missing.length > 0) {
        throw new ValidationError('Please complete all fields (Age, TC, HDL, SBP).', 'MISSING_DATA');
    }
    const age = Number(values['ascvd-age']);
    const tc = Number(values['ascvd-tc']);
    const hdl = Number(values['ascvd-hdl']);
    const sbp = Number(values['ascvd-sbp']);
    // Validate age range
    if (age < 40 || age > 79) {
        throw new ValidationError(`Valid for ages 40-79. Current age: ${age}.`, 'OUT_OF_RANGE');
    }
    // Prepare Patient Object
    const patient = {
        age,
        tc,
        hdl,
        sbp,
        isMale: values['ascvd-gender'] !== 'female',
        race: values['ascvd-race'] || 'white',
        onHtnTx: values['ascvd-htn'] === 'yes',
        isDiabetic: values['ascvd-dm'] === 'yes',
        isSmoker: values['ascvd-smoker'] === 'yes'
    };
    const risk = calculatePCE(patient);
    currentBaselineRisk = risk;
    currentPatientData = patient;
    // Interpret risk
    let interpretation = '';
    let alertClass = 'info';
    if (risk < 5) {
        interpretation = 'Low Risk (<5%). Emphasize lifestyle modifications.';
        alertClass = 'success';
    }
    else if (risk < 7.5) {
        interpretation = 'Borderline Risk (5-7.4%). Discuss risk. Consider moderate-intensity statin.';
        alertClass = 'warning';
    }
    else if (risk < 20) {
        interpretation = 'Intermediate Risk (7.5-19.9%). Initiate moderate-intensity statin.';
        alertClass = 'warning';
    }
    else {
        interpretation = 'High Risk (??0%). Initiate high-intensity statin.';
        alertClass = 'danger';
    }
    if (patient.race === 'other') {
        interpretation += '<br><small>Note: Risk for "Other" race may be over- or underestimated.</small>';
    }
    const results = [
        {
            label: '10-Year ASCVD Risk',
            value: risk.toFixed(1),
            unit: '%',
            interpretation: interpretation,
            alertClass: alertClass
        }
    ];
    return results;
};
