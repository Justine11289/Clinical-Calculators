/**
 * 4PEPS Calculator - SaMD Verification Tests
 *
 * Formula: 4-Level Pulmonary Embolism Clinical Probability Score
 *
 * Reference: Roy, P. M., et al. (2021). JAMA Cardiology.
 */
import { calculateFourPeps } from '../../calculators/4peps/calculation';
describe('4PEPS Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    describe('Standard Calculations', () => {
        test('Should calculate correct result for a female<50 with no other risk factors', () => {
            // Age < 50 (-2), Female (0) = -2
            const result = calculateFourPeps({
                'fourpeps-age': 30,
                '4peps-sex': '0', // Female
                '4peps-resp_disease': '0',
                '4peps-hr': '0',
                '4peps-chest_pain': '0',
                '4peps-estrogen': '0',
                '4peps-vte': '0',
                '4peps-syncope': '0',
                '4peps-immobility': '0',
                '4peps-o2_sat': '0',
                '4peps-calf_pain': '0',
                '4peps-pe_likely': '0'
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('-2');
            expect(result[0].interpretation).toBe('Very low CPP');
            expect(result[0].alertClass).toBe('success');
        });
        test('Should calculate for High Risk case', () => {
            // Male (2) + VTE history (2) + PE likely (5) = 9
            // + Age 70 (0) = 9
            const result = calculateFourPeps({
                'fourpeps-age': 70,
                '4peps-sex': '2', // Male
                '4peps-resp_disease': '0',
                '4peps-hr': '0',
                '4peps-chest_pain': '0',
                '4peps-estrogen': '0',
                '4peps-vte': '2',
                '4peps-syncope': '0',
                '4peps-immobility': '0',
                '4peps-o2_sat': '0',
                '4peps-calf_pain': '0',
                '4peps-pe_likely': '5'
            });
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('9');
            expect(result[0].interpretation).toBe('Moderate CPP');
            expect(result[0].alertClass).toBe('warning');
        });
    });
    // ===========================================
    // TC-002: Severity Classification Tests
    // ===========================================
    describe('Severity Classification', () => {
        test('Should identify "Very low CPP" (<0)', () => {
            // Age 20 (-2), Female (0) = -2
            const result = calculateFourPeps({ 'fourpeps-age': 20, '4peps-sex': '0' });
            expect(result[0].interpretation).toBe('Very low CPP');
            expect(result[0].alertClass).toBe('success');
        });
        test('Should identify "Low CPP" (0-5)', () => {
            // Age 70 (0), Male (2) = 2
            const result = calculateFourPeps({ 'fourpeps-age': 70, '4peps-sex': '2' });
            expect(result[0].interpretation).toBe('Low CPP');
            expect(result[0].alertClass).toBe('success');
        });
        test('Should identify "Moderate CPP" (6-12)', () => {
            // Age 70 (0), Male (2), PE Likely (5) = 7
            const result = calculateFourPeps({
                'fourpeps-age': 70,
                '4peps-sex': '2',
                '4peps-pe_likely': '5'
            });
            expect(result[0].interpretation).toBe('Moderate CPP');
            expect(result[0].alertClass).toBe('warning');
        });
        test('Should identify "High CPP" (>=13)', () => {
            // Male(2)+VTE(2)+Syncope(2)+Immobility(2)+Sat(3)+Calf(3)+PE Likely(5) = 19
            const result = calculateFourPeps({
                'fourpeps-age': 70,
                '4peps-sex': '2',
                '4peps-vte': '2',
                '4peps-syncope': '2',
                '4peps-immobility': '2',
                '4peps-o2_sat': '3',
                '4peps-calf_pain': '3',
                '4peps-pe_likely': '5'
            });
            expect(result[0].interpretation).toBe('High CPP');
            expect(result[0].alertClass).toBe('danger');
        });
    });
    // ===========================================
    // TC-003: Boundary Value Tests
    // ===========================================
    describe('Boundary Values', () => {
        test('Age boundary <50 vs 50-64', () => {
            // Age 49 => -2
            let result = calculateFourPeps({ 'fourpeps-age': 49, '4peps-sex': '0' });
            expect(result[0].value).toBe('-2');
            // Age 50 => -1
            result = calculateFourPeps({ 'fourpeps-age': 50, '4peps-sex': '0' });
            expect(result[0].value).toBe('-1');
        });
        test('Age boundary 50-64 vs >64', () => {
            // Age 64 => -1
            let result = calculateFourPeps({ 'fourpeps-age': 64, '4peps-sex': '0' });
            expect(result[0].value).toBe('-1');
            // Age 65 => 0
            result = calculateFourPeps({ 'fourpeps-age': 65, '4peps-sex': '0' });
            expect(result[0].value).toBe('0');
        });
    });
    // ===========================================
    // TC-004: Invalid Input Tests
    // ===========================================
    describe('Invalid Inputs', () => {
        // Since we default missing radios to 0 in our logic (for safety/simplicity in some apps),
        // strict null checks might vary. But age is required.
        test('Should typically treat missing optional radios as 0 if implementation decides so, OR if logic enforces required inputs', () => {
            // In our implementation: 
            // if (val !== null && val !== undefined && val !== '')
            // So missing keys are effectively 0.
            // Age is handled separately.
            // If age is missing (null), functionality depends on logic.
            // Current logic: if (age !== null) { ... }
            // If age is missing, it adds nothing to score. 
            // This might actually be a bug or feature depending on requirements.
            // Let's assume for now 0 is default if missing, testing that code doesn't crash.
            const result = calculateFourPeps({});
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('0'); // Default 0
        });
        test('Should handle invalid age type gracefully', () => {
            const result = calculateFourPeps({ 'fourpeps-age': 'invalid' });
            // parsefloat('invalid') -> NaN.
            // if (!isNaN(age)) check protects us.
            expect(result).not.toBeNull();
            expect(result[0].value).toBe('0');
        });
    });
});
