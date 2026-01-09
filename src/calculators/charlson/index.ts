/**
 * Charlson Comorbidity Index (CCI) Calculator
 *
 * Migrated to createUnifiedFormulaCalculator
 */

import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { fhirDataService } from '../../fhir-data-service.js';
import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { calculateCharlson } from './calculation.js';
import type { FormulaCalculatorConfig } from '../../types/calculator-formula.js';

interface ConditionMapItem {
    codes: string[];
    value: number;
}

interface ConditionMap {
    [key: string]: ConditionMapItem;
}

const config: FormulaCalculatorConfig = {
    id: 'charlson',
    title: 'Charlson Comorbidity Index (CCI)',
    description: 'Predicts 10-year survival in patients with multiple comorbidities.',
    infoAlert:
        'The Charlson Comorbidity Index predicts 10-year mortality based on age and 17 comorbid conditions. Higher scores indicate more severe comorbidity burden.',

    sections: [
        {
            title: 'Age',
            icon: '🎂',
            fields: [
                {
                    id: 'age',
                    label: 'Age Group',
                    type: 'radio',
                    options: [
                        { value: '0', label: '< 50 years (+0)', checked: true },
                        { value: '1', label: '50-59 years (+1)' },
                        { value: '2', label: '60-69 years (+2)' },
                        { value: '3', label: '70-79 years (+3)' },
                        { value: '4', label: '≥ 80 years (+4)' }
                    ]
                }
            ]
        },
        {
            title: 'Comorbidities',
            icon: '🏥',
            fields: [
                {
                    id: 'mi',
                    label: 'Myocardial infarction',
                    helpText: 'History of definite or probable MI',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'chf',
                    label: 'CHF',
                    helpText: 'Exertional or paroxysmal nocturnal dyspnea',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'pvd',
                    label: 'Peripheral vascular disease',
                    helpText: 'Intermittent claudication, past bypass, gangrene, or aneurysm',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'cva',
                    label: 'CVA or TIA',
                    helpText: 'History of a cerebrovascular accident',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'dementia',
                    label: 'Dementia',
                    helpText: 'Chronic cognitive deficit',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'cpd',
                    label: 'Chronic pulmonary disease',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'ctd',
                    label: 'Connective tissue disease',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'pud',
                    label: 'Peptic ulcer disease',
                    helpText: 'Any history of treatment for ulcer disease',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '1', label: 'Yes (+1)' }
                    ]
                },
                {
                    id: 'liver',
                    label: 'Liver disease',
                    helpText:
                        'Mild = chronic hepatitis. Moderate/Severe = cirrhosis and portal hypertension.',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'None (+0)', checked: true },
                        { value: '1', label: 'Mild (+1)' },
                        { value: '3', label: 'Moderate to severe (+3)' }
                    ]
                },
                {
                    id: 'diabetes',
                    label: 'Diabetes mellitus',
                    helpText: 'End-organ damage includes retinopathy, nephropathy, or neuropathy.',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'None/Diet-controlled (+0)', checked: true },
                        { value: '1', label: 'Uncomplicated (+1)' },
                        { value: '2', label: 'End-organ damage (+2)' }
                    ]
                },
                {
                    id: 'hemiplegia',
                    label: 'Hemiplegia',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                },
                {
                    id: 'ckd',
                    label: 'Moderate to severe CKD',
                    helpText: 'Severe on dialysis, uremia, or creatinine >3 mg/dL',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                },
                {
                    id: 'tumor',
                    label: 'Solid tumor',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'None (+0)', checked: true },
                        { value: '2', label: 'Localized (+2)' },
                        { value: '6', label: 'Metastatic (+6)' }
                    ]
                },
                {
                    id: 'leukemia',
                    label: 'Leukemia',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                },
                {
                    id: 'lymphoma',
                    label: 'Lymphoma',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '2', label: 'Yes (+2)' }
                    ]
                },
                {
                    id: 'aids',
                    label: 'AIDS',
                    helpText: 'Not just HIV positive, but "full-blown" AIDS',
                    type: 'radio',
                    options: [
                        { value: '0', label: 'No (+0)', checked: true },
                        { value: '6', label: 'Yes (+6)' }
                    ]
                }
            ]
        }
    ],

    formulaSection: {
        show: true,
        title: 'Formula',
        calculationNote: 'Addition of the selected points:',
        tableHeaders: ['Variable', 'Definition', 'Points'],
        rows: [
            ['Myocardial infarction', 'History of definite or probable MI', '1'],
            ['Congestive heart failure', 'Exertional or paroxysmal nocturnal dyspnea', '1'],
            ['Peripheral vascular disease', 'Intermittent claudication or past bypass', '1'],
            ['CVA or TIA', 'History of CVA with minor/no residua', '1'],
            ['Dementia', 'Chronic cognitive deficit', '1'],
            ['Chronic pulmonary disease', '—', '1'],
            ['Connective tissue disease', '—', '1'],
            ['Peptic ulcer disease', 'Any history of treatment for ulcer', '1'],
            ['Mild liver disease', 'Chronic hepatitis', '1'],
            ['Uncomplicated diabetes', '—', '1'],
            ['Hemiplegia', '—', '2'],
            ['Moderate to severe CKD', 'Creatinine >3 mg/dL', '2'],
            ['Diabetes with end-organ damage', '—', '2'],
            ['Localized solid tumor', '—', '2'],
            ['Leukemia', '—', '2'],
            ['Lymphoma', '—', '2'],
            ['Moderate to severe liver disease', 'Cirrhosis and portal hypertension', '3'],
            ['Metastatic solid tumor', '—', '6'],
            ['AIDS', 'Full-blown AIDS', '6']
        ],
        footnotes: ['*Not just HIV positive, but "full-blown" AIDS.']
    },

    calculate: calculateCharlson,

    customResultRenderer: (results) => {
        let html = '';
        results.forEach(item => {
            html += uiBuilder.createResultItem({
                label: item.label,
                value: item.value as string,
                unit: item.unit,
                interpretation: item.interpretation,
                alertClass: item.alertClass ? `ui-alert-${item.alertClass}` : ''
            });
        });

        html += `
             <div class="info-section mt-20">
                <h4>📚 References</h4>
                <p>Charlson ME, Pompei P, Ales KL, MacKenzie CR. A new method of classifying prognostic comorbidity in longitudinal studies: development and validation. <em>J Chronic Dis</em>. 1987;40(5):373-383.</p>
            </div>
        `;
        return html;
    },

    customInitialize: async (client, patient, container, calculate) => {
        fhirDataService.initialize(client, patient, container);
        const stalenessTracker = fhirDataService.getStalenessTracker();

        const setValue = (id: string, value: string) => {
            // For radios, we search for input[name="id"][value="value"]
            // In unified structure, id is the group name.
            const radio = container.querySelector(`input[name="${id}"][value="${value}"]`) as HTMLInputElement;
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        if (client && fhirDataService.isReady()) {
            // Auto-populate age
            const age = fhirDataService.getPatientAge();
            if (age !== null) {
                let ageValue = 0;
                if (age >= 80) ageValue = 4;
                else if (age >= 70) ageValue = 3;
                else if (age >= 60) ageValue = 2;
                else if (age >= 50) ageValue = 1;

                setValue('age', ageValue.toString());
            }

            const conditionMap: ConditionMap = {
                mi: { codes: ['I21', 'I22'], value: 1 },
                chf: { codes: ['I50'], value: 1 },
                pvd: { codes: ['I73.9', 'I70'], value: 1 },
                cva: { codes: ['I60', 'I61', 'I62', 'I63', 'I64', 'G45'], value: 1 },
                dementia: { codes: ['F00', 'F01', 'F02', 'F03', 'G30'], value: 1 },
                cpd: { codes: ['J40', 'J41', 'J42', 'J43', 'J44', 'J45', 'J46', 'J47'], value: 1 },
                ctd: { codes: ['M32', 'M34', 'M05', 'M06'], value: 1 },
                pud: { codes: ['K25', 'K26', 'K27', 'K28'], value: 1 },
                hemiplegia: { codes: ['G81'], value: 2 },
                leukemia: { codes: ['C91', 'C92', 'C93', 'C94', 'C95'], value: 2 },
                lymphoma: { codes: ['C81', 'C82', 'C83', 'C84', 'C85'], value: 2 },
                aids: { codes: ['B20', 'B21', 'B22', 'B24'], value: 6 }
            };

            for (const [key, { codes, value }] of Object.entries(conditionMap)) {
                fhirDataService
                    .hasCondition(codes)
                    .then(hasCondition => {
                        if (hasCondition) {
                            setValue(key, value.toString());
                        }
                    })
                    .catch(e => console.warn(`Error fetching ${key} conditions:`, e));
            }

            // Liver disease
            fhirDataService
                .hasCondition(['K70.3', 'K74', 'I85'])
                .then(hasSevere => {
                    if (hasSevere) {
                        setValue('liver', '3');
                    } else {
                        fhirDataService
                            .hasCondition(['K73', 'B18'])
                            .then(hasMild => {
                                if (hasMild) {
                                    setValue('liver', '1');
                                }
                            })
                            .catch(e => console.warn('Error fetching mild liver conditions:', e));
                    }
                })
                .catch(e => console.warn('Error fetching severe liver conditions:', e));

            // Diabetes
            fhirDataService
                .hasCondition([
                    'E10.2', 'E10.3', 'E10.4', 'E10.5',
                    'E11.2', 'E11.3', 'E11.4', 'E11.5'
                ])
                .then(hasEOD => {
                    if (hasEOD) {
                        setValue('diabetes', '2');
                    } else {
                        fhirDataService
                            .hasCondition(['E10', 'E11'])
                            .then(hasUncomplicated => {
                                if (hasUncomplicated) {
                                    setValue('diabetes', '1');
                                }
                            })
                            .catch(e => console.warn('Error fetching uncomplicated diabetes conditions:', e));
                    }
                })
                .catch(e => console.warn('Error fetching diabetes w/ EOD conditions:', e));

            // Solid tumor
            interface FhirCondition {
                code?: {
                    coding?: Array<{
                        code: string;
                        system?: string;
                    }>;
                };
            }

            fhirDataService
                .getConditions(['C00-C75', 'C76-C80'])
                .then(conditions => {
                    if (conditions.length > 0) {
                        const metastaticCodes = ['C77', 'C78', 'C79', 'C80'];
                        const isMetastatic = conditions.some(
                            (c: FhirCondition) =>
                                c.code?.coding?.[0]?.code &&
                                metastaticCodes.includes(c.code.coding[0].code.substring(0, 3))
                        );
                        setValue('tumor', isMetastatic ? '6' : '2');
                    }
                })
                .catch(e => console.warn('Error fetching tumor conditions:', e));

            // CKD
            fhirDataService
                .hasCondition(['N18.3', 'N18.4', 'N18.5', 'Z99.2'])
                .then(hasCKD => {
                    if (hasCKD) {
                        setValue('ckd', '2');
                    }
                })
                .catch(e => console.warn('Error fetching CKD conditions:', e));

            // CKD via Creatinine > 3 mg/dL
            fhirDataService
                .getObservation(LOINC_CODES.CREATININE, {
                    trackStaleness: true,
                    stalenessLabel: 'Creatinine'
                })
                .then(result => {
                    if (result.value !== null && result.value > 3) {
                        setValue('ckd', '2');
                        if (stalenessTracker && result.observation) {
                            stalenessTracker.trackObservation(
                                'input[name="ckd"][value="2"]',
                                result.observation,
                                LOINC_CODES.CREATININE,
                                'Creatinine > 3 mg/dL'
                            );
                        }
                    }
                })
                .catch(e => console.warn('Error fetching creatinine:', e));
        }

        setTimeout(calculate, 200);
    }
};

export const charlson = createUnifiedFormulaCalculator(config);
