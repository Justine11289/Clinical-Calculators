/**
 * Morphine Milligram Equivalents (MME) Calculator
 *
 * 使用 Dynamic List Calculator 工廠函數
 * 計算每日嗎啡毫克等效劑量
 */

import { createDynamicListCalculator } from '../shared/dynamic-list-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

export const mme = createDynamicListCalculator({
    id: 'mme',
    title: 'Morphine Milligram Equivalents (MME) Calculator',
    description: 'Calculates total daily morphine milligram equivalents.',

    itemOptions: [
        { value: 'codeine', label: 'Codeine', factor: 0.15 },
        { value: 'fentanyl', label: 'Fentanyl transdermal (mcg/hr)', factor: 2.4 },
        { value: 'hydrocodone', label: 'Hydrocodone', factor: 1 },
        { value: 'hydromorphone', label: 'Hydromorphone', factor: 4 },
        { value: 'methadone-1-20', label: 'Methadone (1-20mg/day)', factor: 4 },
        { value: 'methadone-21-40', label: 'Methadone (21-40mg/day)', factor: 8 },
        { value: 'methadone-41-60', label: 'Methadone (41-60mg/day)', factor: 10 },
        { value: 'methadone-61-80', label: 'Methadone (61-80mg/day)', factor: 12 },
        { value: 'morphine', label: 'Morphine', factor: 1 },
        { value: 'oxycodone', label: 'Oxycodone', factor: 1.5 },
        { value: 'oxymorphone', label: 'Oxymorphone', factor: 3 }
    ],

    itemLabel: 'Opioid',
    valueLabel: 'Daily Dose',
    valueUnit: 'mg/day (or mcg/hr)',
    resultLabel: 'Total Daily MME',
    resultUnit: 'MME/day',
    addButtonText: 'Add Opioid',

    riskLevels: [
        {
            minValue: 0,
            maxValue: 50,
            label: 'Lower Risk (<50 MME)',
            severity: 'success',
            recommendation: 'Standard precautions.'
        },
        {
            minValue: 50,
            maxValue: 90,
            label: 'Moderate Risk (50-90 MME)',
            severity: 'warning',
            recommendation: 'Reassess evidence of benefits and risks. Consider offering naloxone.'
        },
        {
            minValue: 90,
            maxValue: Infinity,
            label: 'High Risk (≥90 MME)',
            severity: 'danger',
            recommendation:
                'Avoid increasing dosage. Justify decision to titrate >90 MME/day. Consider specialist referral.'
        }
    ],

    additionalInfo: `
        ${uiBuilder.createFormulaSection({
            items: [
                {
                    label: 'MME Calculation',
                    formula: 'Total MME/day = Σ (Daily Dose × Conversion Factor)',
                    notes: 'Each opioid has a specific conversion factor representing its potency relative to morphine.'
                }
            ]
        })}

        ${uiBuilder.createAlert({
            type: 'info',
            message:
                '<h4>📊 Conversion Factors</h4><div class="ui-data-table"><table><thead><tr><th>Opioid</th><th>Factor</th></tr></thead><tbody><tr><td>Morphine, Hydrocodone</td><td>1</td></tr><tr><td>Codeine</td><td>0.15</td></tr><tr><td>Oxycodone</td><td>1.5</td></tr><tr><td>Hydromorphone, Methadone (1-20mg)</td><td>4</td></tr><tr><td>Oxymorphone</td><td>3</td></tr><tr><td>Fentanyl transdermal (mcg/hr)</td><td>2.4</td></tr><tr><td>Methadone (>20mg)</td><td>8-12 (dose dependent)</td></tr></tbody></table></div>'
        })}

        ${uiBuilder.createAlert({
            type: 'warning',
            message:
                '<h4>⚠️ CDC Recommendations</h4><ul class="info-list"><li><strong>≥50 MME/day:</strong> Increased risk. Reassess benefits/risks.</li><li><strong>≥90 MME/day:</strong> Avoid if possible. Consider specialist referral.</li></ul>'
        })}
    `
});
