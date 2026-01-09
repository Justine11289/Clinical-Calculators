import { LOINC_CODES } from '../../fhir-codes.js';
import { uiBuilder } from '../../ui-builder.js';
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator.js';
import { ttkgCalculation } from './calculation.js';

export const ttkg = createUnifiedFormulaCalculator({
    id: 'ttkg',
    title: 'Transtubular Potassium Gradient (TTKG)',
    description: 'May help in assessment of hyperkalemia or hypokalemia.',
    infoAlert: `
        <h4>Clinical Interpretation</h4>
        <ul>
            <li><strong>Hypokalemia (K < 3.5):</strong>
                <ul>
                    <li>TTKG < 3: Non-renal loss (GI, etc.)</li>
                    <li>TTKG > 3: Renal loss</li>
                </ul>
            </li>
            <li><strong>Hyperkalemia (K > 5.2):</strong>
                <ul>
                    <li>TTKG > 10: Normal renal response</li>
                    <li>TTKG < 7: Hypoaldosteronism or resistance</li>
                </ul>
            </li>
        </ul>
    `,
    sections: [
        {
            title: 'Lab Values',
            icon: '🧪',
            fields: [
                {
                    type: 'number',
                    id: 'ttkg-urine-k',
                    label: 'Urine Potassium',
                    placeholder: 'e.g. 40',
                    unitToggle: {
                        type: 'electrolyte',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'urinePotassium',
                    loincCode: LOINC_CODES.URINE_POTASSIUM,
                    standardUnit: 'mEq/L',
                    required: true
                },
                {
                    type: 'number',
                    id: 'ttkg-serum-k',
                    label: 'Serum Potassium',
                    placeholder: 'Norm: 3.5 - 5.2',
                    unitToggle: {
                        type: 'electrolyte',
                        units: ['mEq/L', 'mmol/L'],
                        default: 'mEq/L'
                    },
                    validationType: 'potassium',
                    loincCode: LOINC_CODES.POTASSIUM,
                    standardUnit: 'mEq/L',
                    required: true
                },
                {
                    type: 'number',
                    id: 'ttkg-urine-osmo',
                    label: 'Urine Osmolality',
                    unit: 'mOsm/kg',
                    placeholder: 'Norm: 500 - 800',
                    validationType: 'osmolality',
                    loincCode: '2697-2',
                    required: true
                },
                {
                    type: 'number',
                    id: 'ttkg-serum-osmo',
                    label: 'Serum Osmolality',
                    unit: 'mOsm/kg',
                    placeholder: 'Norm: 275 - 295',
                    validationType: 'osmolality',
                    loincCode: '2695-6',
                    required: true
                }
            ]
        }
    ],
    formulas: [
        {
            label: 'TTKG',
            formula: '<span class="formula-fraction"><span class="numerator">Urine K × Serum Osmolality</span><span class="denominator">Serum K × Urine Osmolality</span></span>',
            notes: 'Valid only when Urine Osmolality > Serum Osmolality.'
        }
    ],
    calculate: ttkgCalculation,
    customResultRenderer: (results) => {
        const res = results[0];
        if (!res) return '';

        const alertClass = res.alertClass || 'info';

        return `
            ${uiBuilder.createResultItem({
            label: res.label,
            value: res.value,
            unit: res.unit,
            interpretation: res.interpretation,
            alertClass: res.alertClass ? `ui-alert-${res.alertClass}` : ''
        })}
        `;
    }
});
