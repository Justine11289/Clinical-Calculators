/**
 * Charlson Comorbidity Index Calculator - SaMD Verification Tests
 *
 * Formula: Sum of age points + comorbidity points.
 * Survival = 100 * 0.983^(e^(score * 0.9))
 */
import { calculateCharlson } from '../../calculators/charlson/calculation';
describe('Charlson Comorbidity Index Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    // Case 1: Minimal Score (Age < 50, No Comorbidities)
    // Points = 0
    // Survival = 100 * 0.983^(e^(0)) = 100 * 0.983^1 = 98.3 -> 98%
    test('Minimal Score Case', () => {
        const result = calculateCharlson({
            'age': '0',
            'mi': '0', 'chf': '0', 'pvd': '0', 'cva': '0', 'dementia': '0',
            'cpd': '0', 'ctd': '0', 'pud': '0', 'liver': '0', 'diabetes': '0',
            'hemiplegia': '0', 'ckd': '0', 'tumor': '0', 'leukemia': '0',
            'lymphoma': '0', 'aids': '0'
        });
        expect(result).not.toBeNull();
        const scoreItem = result.find(r => r.label === 'Charlson Comorbidity Index');
        const score = parseInt(scoreItem.value, 10);
        expect(score).toBe(0);
        const survItem = result.find(r => r.label === 'Estimated 10-year survival');
        expect(survItem.value).toBe('98%');
    });
    // Case 2: High Score
    // Age > 80 (+4)
    // Metastatic Tumor (+6)
    // AIDS (+6)
    // Total = 16
    // Survival = ... very low.
    test('High Score Case', () => {
        const result = calculateCharlson({
            'age': '4',
            'mi': '0', 'chf': '0', 'pvd': '0', 'cva': '0', 'dementia': '0',
            'cpd': '0', 'ctd': '0', 'pud': '0', 'liver': '0', 'diabetes': '0',
            'hemiplegia': '0', 'ckd': '0', 'tumor': '6', 'leukemia': '0',
            'lymphoma': '0', 'aids': '6'
        });
        expect(result).not.toBeNull();
        const scoreItem = result.find(r => r.label === 'Charlson Comorbidity Index');
        const score = parseInt(scoreItem.value, 10);
        expect(score).toBe(16);
        const survItem = result.find(r => r.label === 'Estimated 10-year survival');
        expect(survItem.value).toBe('0%');
    });
    // ===========================================
    // TC-002: Validation
    // ===========================================
    test('Should match known example from literature', () => {
        // Example: Age 60-69 (2), MI (1), Diabetes (1). Total = 4.
        // Survival = 100 * 0.983^(e^(4 * 0.9)) = 100 * 0.983^(e^3.6)
        // e^3.6 = 36.598
        // 0.983^36.598 = 0.53 -> 53%
        const result = calculateCharlson({
            'age': '2',
            'mi': '1', 'chf': '0', 'pvd': '0', 'cva': '0', 'dementia': '0',
            'cpd': '0', 'ctd': '0', 'pud': '0', 'liver': '0', 'diabetes': '1',
            'hemiplegia': '0', 'ckd': '0', 'tumor': '0', 'leukemia': '0',
            'lymphoma': '0', 'aids': '0'
        });
        const scoreItem = result.find(r => r.label === 'Charlson Comorbidity Index');
        expect(scoreItem.value).toBe('4');
        const survItem = result.find(r => r.label === 'Estimated 10-year survival');
        expect(survItem.value).toBe('53%');
    });
});
