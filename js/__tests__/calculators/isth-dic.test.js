/**
 * ISTH DIC Calculator - SaMD Verification Tests
 *
 * Formula: Sum of points from 4 categories.
 */
import { calculateIsthDic } from '../../calculators/isth-dic/calculation';
describe('ISTH DIC Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    // Case 1: Max Score
    // Platelet <50 (+2)
    // D-dimer >5 (+3)
    // PT Prolongation >=6 (+2)
    // Fibrinogen <1 (+1)
    // Total: 8 -> Overt DIC
    test('Max Score Case', () => {
        const result = calculateIsthDic({
            'isth-platelet': '2',
            'isth-fibrin_marker': '3',
            'isth-pt': '2',
            'isth-fibrinogen': '1'
        });
        expect(result).not.toBeNull();
        const score = parseFloat(result[0].value);
        expect(score).toBe(8);
        expect(result[0].interpretation).toBe('Overt DIC');
        expect(result[0].alertClass).toBe('danger');
    });
    // Case 2: Min Score
    // Platelet >=100 (0)
    // D-dimer <0.5 (0)
    // PT Prolongation <3 (0)
    // Fibrinogen >=1 (0)
    // Total: 0 -> Not Overt DIC
    test('Min Score Case', () => {
        const result = calculateIsthDic({
            'isth-platelet': '0',
            'isth-fibrin_marker': '0',
            'isth-pt': '0',
            'isth-fibrinogen': '0'
        });
        expect(result).not.toBeNull();
        const score = parseFloat(result[0].value);
        expect(score).toBe(0);
        expect(result[0].interpretation).toBe('Not Overt DIC');
        expect(result[0].alertClass).toBe('success');
    });
    // Case 3: Borderline Case (Score 5)
    // Platelet 50-100 (+1)
    // D-dimer 0.5-5 (+2)
    // PT 3-6 (+1)
    // Fibrinogen <1 (+1)
    // Total: 5 -> Overt DIC
    test('Borderline Overt DIC Case', () => {
        const result = calculateIsthDic({
            'isth-platelet': '1',
            'isth-fibrin_marker': '2',
            'isth-pt': '1',
            'isth-fibrinogen': '1'
        });
        expect(result).not.toBeNull();
        const score = parseFloat(result[0].value);
        expect(score).toBe(5);
        expect(result[0].interpretation).toBe('Overt DIC');
    });
    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should handle partial inputs (treat missing as 0 or sum what is present)', () => {
        // Only Platelet (+2)
        const result = calculateIsthDic({
            'isth-platelet': '2'
        });
        const score = parseFloat(result[0].value);
        expect(score).toBe(2);
    });
});
