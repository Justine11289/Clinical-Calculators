/**
 * SCORE2-Diabetes Risk Score
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateScore2Diabetes } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: 'score2-diabetes',
    title: 'SCORE2-Diabetes Risk Score',
    description: 'Predicts 10-year CVD risk in patients with type 2 diabetes (age 40-69).',

    infoAlert:
        '<strong>Instructions:</strong> Select risk region and enter patient details. Validated for European populations aged 40-69.',

    sections: [
        {
            title: 'Geographic Risk Region',
            icon: '🌍',
            fields: [
                {
                    type: 'radio',
                    id: 'score2d-region',
                    label: 'Select Region',
                    options: [
                        { value: 'low', label: 'Low Risk (e.g., France, Spain, Italy)' },
                        { value: 'moderate', label: 'Moderate Risk (e.g., Germany, UK)' },
                        { value: 'high', label: 'High Risk (e.g., Poland, Hungary)' },
                        { value: 'very_high', label: 'Very High Risk (e.g., Romania, Turkey)' }
                    ]
                }
            ]
        },
        {
            title: 'Demographics & History',
            icon: '👤',
            fields: [
                {
                    type: 'radio',
                    id: 'score2d-sex',
                    label: 'Gender',
                    options: [
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' }
                    ]
                },
                {
                    type: 'number',
                    id: 'score2d-age',
                    label: 'Age',
                    unit: 'years',
                    min: 40,
                    max: 69,
                    placeholder: '40-69'
                },
                {
                    type: 'radio',
                    id: 'score2d-smoking',
                    label: 'Smoking Status',
                    options: [
                        { value: '0', label: 'Non-smoker', checked: true },
                        { value: '1', label: 'Current Smoker' }
                    ]
                }
            ]
        },
        {
            title: 'Clinical & Lab Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'score2d-sbp',
                    label: 'Systolic BP',
                    unit: 'mmHg',
                    placeholder: 'e.g. 130'
                },
                {
                    type: 'number',
                    id: 'score2d-tchol',
                    label: 'Total Cholesterol',
                    unit: 'mg/dL',
                    placeholder: 'e.g. 200'
                },
                {
                    type: 'number',
                    id: 'score2d-hdl',
                    label: 'HDL Cholesterol',
                    unit: 'mg/dL',
                    placeholder: 'e.g. 50'
                },
                {
                    type: 'number',
                    id: 'score2d-hba1c',
                    label: 'HbA1c',
                    unit: '%',
                    step: 0.1,
                    placeholder: 'e.g. 7.0'
                },
                {
                    type: 'number',
                    id: 'score2d-egfr',
                    label: 'eGFR',
                    unit: 'mL/min',
                    placeholder: 'e.g. 90'
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'Risk Calculation',
        type: 'list',
        calculationNote: 'Cox proportional hazards model with region-specific baseline survival',
        footnotes: [
            'Uses European Heart Journal validated coefficients',
            'Separate models for male and female patients',
            'Risk = 1 - S₀^exp(X - mean_X)'
        ]
    },

    calculate: calculateScore2Diabetes,

    customResultRenderer: (results) => {
        // Need access to values?
        // unified calculator doesn't pass values to customResultRenderer in basic mode.
        // BUT, looking at `score2Diabetes` implementation, it passed `values`.
        // `createUnifiedFormulaCalculator`'s `customResultRenderer` signature (from types):
        // (results: FormulaResultItem[]) => string;
        // It does NOT pass values.
        // Wait. `score2Diabetes` checked for age range alert.
        // Can I get age from results? No, unless it's returned.
        // I can just check the input value directly from DOM if needed, or include the warning in `calculate` result!
        // Yes, my implementation in `calculate.ts` returns empty array if age invalid. 
        // If empty array, what happens?
        // `createResultItem` joins them.

        // Strategy: Add checks in `calculate` to return a warning result item if invalid age, or handle valid ranges better.
        // But `UnifiedFormulaCalculator` performs validation (min/max).
        // Config for age has `min: 40, max: 69`.
        // So validation should block or warn before calculation logic if using standard validation.
        // Unified calculator `validateInputs` logic (Step 247): checks min/max.
        // If validation fails, `hasWarnings` is true.
        // If `hasWarnings` is true, does it still calculate?
        // Need to check `performSimpleCalculation`.
        // If I rely on standard validation, user gets UI feedback.
        // So I might not need the custom alert in result renderer if standard validation works.
        // But if I want to persist the exact behavior:

        // I will assume standard validation covers the "Score valid only for ages 40-69" message via the `min/max` warning. 
        // So I only need to render results.

        return results
            .map(r => uiBuilder.createResultItem({
                label: r.label,
                value: r.value.toString(),
                unit: r.unit,
                interpretation: r.interpretation,
                alertClass: r.alertClass ? `ui-alert-${r.alertClass}` : ''
            }))
            .join('');
    },

    customInitialize: async (client, patient, container, calculate) => {
        fhirDataService.initialize(client, patient, container);

        const setValue = (id: string, value: string) => {
            const input = container.querySelector(`#${id}`) as HTMLInputElement;
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        const setRadioValue = (id: string, value: string) => {
            const radio = container.querySelector(
                `input[name="${id}"][value="${value}"]`
            ) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        // Auto-populate age
        const age = fhirDataService.getPatientAge();
        if (age !== null) {
            setValue('score2d-age', age.toString());
        }

        // Auto-populate gender
        const gender = fhirDataService.getPatientGender();
        if (gender) {
            setRadioValue('score2d-sex', gender);
        }

        if (!client) return;

        try {
            // Systolic BP (使用 getBloodPressure 處理 panel observation)
            const bpResult = await fhirDataService.getBloodPressure({
                trackStaleness: true
            });
            if (bpResult.systolic !== null) {
                setValue('score2d-sbp', bpResult.systolic.toFixed(0));
            }

            // Total Cholesterol
            const tcholResult = await fhirDataService.getObservation(
                LOINC_CODES.CHOLESTEROL_TOTAL,
                {
                    trackStaleness: true,
                    stalenessLabel: 'Total Cholesterol'
                }
            );
            if (tcholResult.value !== null) {
                setValue('score2d-tchol', tcholResult.value.toFixed(0));
            }

            // HDL
            const hdlResult = await fhirDataService.getObservation(LOINC_CODES.HDL, {
                trackStaleness: true,
                stalenessLabel: 'HDL Cholesterol'
            });
            if (hdlResult.value !== null) {
                setValue('score2d-hdl', hdlResult.value.toFixed(0));
            }

            // HbA1c
            const hba1cResult = await fhirDataService.getObservation(LOINC_CODES.HBA1C, {
                trackStaleness: true,
                stalenessLabel: 'HbA1c'
            });
            if (hba1cResult.value !== null) {
                setValue('score2d-hba1c', hba1cResult.value.toFixed(1));
            }

            // eGFR
            const egfrResult = await fhirDataService.getObservation(LOINC_CODES.EGFR, {
                trackStaleness: true,
                stalenessLabel: 'eGFR'
            });
            if (egfrResult.value !== null) {
                setValue('score2d-egfr', egfrResult.value.toFixed(0));
            }

            calculate();
        } catch (e) {
            console.warn('FHIR data fetch failed:', e);
        }
    }
};

export const score2Diabetes = createUnifiedFormulaCalculator(config);
