/**
 * GRACE ACS Risk Score
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateGraceAcs } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: 'grace-acs',
    title: 'GRACE ACS Risk Score',
    description:
        'Estimates admission to 6 month mortality for patients with acute coronary syndrome.',

    sections: [
        {
            title: 'Vital Signs & Demographics',
            icon: '🌡️',
            fields: [
                {
                    type: 'number',
                    id: 'grace-age',
                    label: 'Age',
                    placeholder: 'Enter age',
                    unit: 'years',
                    validationType: 'age'
                },
                {
                    type: 'number',
                    id: 'grace-hr',
                    label: 'Heart Rate',
                    placeholder: 'Enter heart rate',
                    unit: 'bpm',
                    validationType: 'heartRate'
                },
                {
                    type: 'number',
                    id: 'grace-sbp',
                    label: 'Systolic BP',
                    placeholder: 'Enter systolic BP',
                    unit: 'mmHg',
                    validationType: 'systolicBP'
                },
                {
                    type: 'number',
                    id: 'grace-creatinine',
                    label: 'Creatinine',
                    step: 0.1,
                    placeholder: 'Enter creatinine',
                    unit: 'mg/dL',
                    unitToggle: {
                        type: 'creatinine',
                        units: ['mg/dL', 'µmol/L'],
                        default: 'mg/dL'
                    }
                }
            ]
        },
        {
            title: 'Clinical Findings',
            icon: '🩺',
            fields: [
                {
                    type: 'radio',
                    id: 'grace-killip',
                    label: 'Killip Class (Heart Failure Classification)',
                    options: [
                        { value: '0', label: 'Class I - No heart failure', checked: true },
                        { value: '20', label: 'Class II - Mild HF (rales, S3)' },
                        { value: '39', label: 'Class III - Pulmonary edema' },
                        { value: '59', label: 'Class IV - Cardiogenic shock' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'grace-cardiac-arrest',
                    label: 'Cardiac Arrest at Admission',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '39', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'grace-st-deviation',
                    label: 'ST Segment Deviation',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '28', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'grace-cardiac-enzymes',
                    label: 'Abnormal Cardiac Enzymes',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '14', label: 'Yes' }
                    ]
                }
            ]
        }
    ],

    resultTitle: 'GRACE ACS Risk Assessment',

    formulaSection: {
        show: true,
        title: 'FACTS & FIGURES',
        calculationNote: 'Score interpretation:',
        scoringCriteria: [
            { criteria: '0-87', points: '0-2%' },
            { criteria: '88-128', points: '3-10%' },
            { criteria: '129-149', points: '10-20%' },
            { criteria: '150-173', points: '20-30%' },
            { criteria: '174-182', points: '40%' },
            { criteria: '183-190', points: '50%' },
            { criteria: '191-199', points: '60%' },
            { criteria: '200-207', points: '70%' },
            { criteria: '208-218', points: '80%' },
            { criteria: '219-284', points: '90%' },
            { criteria: '≥285', points: '99%' }
        ],
        tableHeaders: ['Grace Score Range', 'Mortality Risk']
    },

    calculate: calculateGraceAcs,

    customResultRenderer: (results) => {
        let html = '';
        results.forEach(item => {
            if (item.label === 'Interpretation' && item.alertPayload) {
                html += uiBuilder.createAlert(item.alertPayload);
            } else {
                html += uiBuilder.createResultItem({
                    label: item.label,
                    value: item.value as string,
                    unit: item.unit,
                    interpretation: item.interpretation,
                    alertClass: item.alertClass ? `ui-alert-${item.alertClass}` : ''
                });
            }
        });
        return html;
    },

    customInitialize: async (client, patient, container, calculate) => {
        // Initialize FHIRDataService
        fhirDataService.initialize(client, patient, container);

        const setValue = (id: string, value: string) => {
            const input = container.querySelector(`#${id}`) as HTMLInputElement;
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        if (client) {
            try {
                // Age from patient using FHIRDataService
                const age = fhirDataService.getPatientAge();
                if (age !== null) {
                    setValue('grace-age', age.toString());
                }

                // Fetch all observations in parallel using FHIRDataService
                const [hrResult, bpResult, creatResult] = await Promise.all([
                    fhirDataService
                        .getObservation(LOINC_CODES.HEART_RATE, {
                            trackStaleness: true,
                            stalenessLabel: 'Heart Rate'
                        })
                        .catch(() => ({ value: null })),
                    fhirDataService
                        .getBloodPressure({ trackStaleness: true })
                        .catch(() => ({ systolic: null })),
                    fhirDataService
                        .getObservation(LOINC_CODES.CREATININE, {
                            trackStaleness: true,
                            stalenessLabel: 'Creatinine',
                            targetUnit: 'mg/dL',
                            unitType: 'creatinine'
                        })
                        .catch(() => ({ value: null }))
                ]);

                if (hrResult.value !== null) {
                    setValue('grace-hr', Math.round(hrResult.value).toString());
                }

                if (bpResult.systolic !== null) {
                    setValue('grace-sbp', Math.round(bpResult.systolic).toString());
                }

                if (creatResult.value !== null) {
                    setValue('grace-creatinine', creatResult.value.toFixed(2));
                }
            } catch (e) {
                console.warn('Error fetching FHIR data for GRACE ACS', e);
            }
        }

        calculate();
    }
};

export const graceAcs = createUnifiedFormulaCalculator(config);
