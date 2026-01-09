/**
 * Revised Geneva Score (Simplified)
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { calculateGenevaScore } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

const config: FormulaCalculatorConfig = {
    id: 'geneva-score',
    title: 'Revised Geneva Score (Simplified)',
    description: 'Estimates the pre-test probability of pulmonary embolism (PE).',
    infoAlert:
        '<strong>Note:</strong> This is the Simplified (Modified) Revised Geneva Score. Each criterion is worth 1 point (except heart rate scoring).',

    sections: [
        {
            title: 'Clinical Assessment',
            icon: '📋',
            fields: [
                {
                    type: 'radio',
                    id: 'geneva-age',
                    label: 'Age > 65 years (+1)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'geneva-prev-dvt',
                    label: 'Previous DVT or PE (+1)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'geneva-surgery',
                    label: 'Surgery or fracture within 1 month (+1)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'geneva-malignancy',
                    label: 'Active malignancy (+1)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                }
            ]
        },
        {
            title: 'Clinical Signs',
            icon: '⚕️',
            fields: [
                {
                    type: 'radio',
                    id: 'geneva-limb-pain',
                    label: 'Unilateral lower limb pain (+1)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'geneva-hemoptysis',
                    label: 'Hemoptysis (+1)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                },
                {
                    type: 'radio',
                    id: 'geneva-palpation',
                    label: 'Pain on deep vein palpation AND unilateral edema (+1)',
                    options: [
                        { value: '0', label: 'No', checked: true },
                        { value: '1', label: 'Yes' }
                    ]
                }
            ]
        },
        {
            title: 'Vital Signs',
            icon: '🩺',
            fields: [
                {
                    type: 'number',
                    id: 'geneva-hr',
                    label: 'Heart Rate',
                    unit: 'bpm',
                    placeholder: 'Enter heart rate',
                    helpText: '75-94 bpm (+1), ≥ 95 bpm (+2)',
                    validationType: 'heartRate'
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'FORMULA',
        calculationNote: 'Addition of the selected points:',
        scoringCriteria: [
            { criteria: 'Age > 65 years', points: '+1' },
            { criteria: 'Previous DVT or PE', points: '+1' },
            { criteria: 'Surgery or fracture within 1 month', points: '+1' },
            { criteria: 'Active malignancy', points: '+1' },
            { criteria: 'Unilateral lower limb pain', points: '+1' },
            { criteria: 'Hemoptysis', points: '+1' },
            { criteria: 'Pain on deep vein palpation AND unilateral edema', points: '+1' },
            { criteria: 'Heart Rate 75-94 bpm', points: '+1' },
            { criteria: 'Heart Rate ≥ 95 bpm', points: '+2' }
        ],
        interpretations: [
            {
                score: '0-1',
                category: 'Low Risk',
                interpretation: 'PE unlikely (8%)',
                severity: 'success'
            },
            {
                score: '2-4',
                category: 'Intermediate Risk',
                interpretation: 'PE possible (28%)',
                severity: 'warning'
            },
            {
                score: '≥5',
                category: 'High Risk',
                interpretation: 'PE likely (74%)',
                severity: 'danger'
            }
        ]
    },

    calculate: calculateGenevaScore,

    customResultRenderer: (results) => {
        let html = '';
        results.forEach(item => {
            if (item.label === 'Recommendation' && item.alertPayload) {
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
                if (input.type === 'radio') {
                    // Find radio with that value
                    const radio = container.querySelector(`input[name="${id}"][value="${value}"]`) as HTMLInputElement;
                    if (radio) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    input.value = value;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } else {
                // Try finding radio group
                const radio = container.querySelector(`input[id="${id}"][value="${value}"]`) as HTMLInputElement;
                if (radio) { // unified-formula-calculator uses ID for radio group name?
                    // Config uses id='geneva-age'.
                    // Unified calculator:
                    // Group name = input.id (Step 559 lines 212: `name: input.id`).
                    // Radios don't have IDs individually usually, but name attribute.
                    // The loop checks `input[name="${id}"]`.
                    // Let's fix loop to use name selector.
                    const targetRadio = container.querySelector(`input[name="${id}"][value="${value}"]`) as HTMLInputElement;
                    if (targetRadio) {
                        targetRadio.checked = true;
                        targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }
        };

        // Auto-populate Age Logic
        const age = fhirDataService.getPatientAge();
        if (age !== null) {
            if (age > 65) {
                setValue('geneva-age', '1');
            } else {
                setValue('geneva-age', '0');
            }
        }

        if (client && fhirDataService.isReady()) {
            // Heart Rate
            try {
                const hrResult = await fhirDataService.getObservation(LOINC_CODES.HEART_RATE, {
                    trackStaleness: true,
                    stalenessLabel: 'Heart Rate'
                });
                if (hrResult.value !== null) {
                    const hrInput = container.querySelector('#geneva-hr') as HTMLInputElement;
                    if (hrInput) {
                        hrInput.value = Math.round(hrResult.value).toString();
                        hrInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            } catch (e) {
                console.warn('Error fetching Heart Rate', e);
            }

            // Check for previous DVT/PE
            fhirDataService
                .hasCondition(['128053003', '59282003'])
                .then(hasDVTPE => {
                    if (hasDVTPE) {
                        setValue('geneva-prev-dvt', '1');
                    }
                })
                .catch(e => console.warn('Error checking DVT/PE history:', e));

            // Check for malignancy
            fhirDataService
                .hasCondition(['363346000', '86049000'])
                .then(hasMalignancy => {
                    if (hasMalignancy) {
                        setValue('geneva-malignancy', '1');
                    }
                })
                .catch(e => console.warn('Error checking malignancy:', e));
        }

        // Wait slightly for async checks to complete or just initial calculate
        setTimeout(calculate, 200);
    }
};

export const genevaScore = createUnifiedFormulaCalculator(config);
