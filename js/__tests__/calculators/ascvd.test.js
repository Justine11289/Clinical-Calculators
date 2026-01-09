import { ascvdCalculation } from '../../calculators/ascvd/calculation.js';
import { ValidationError } from '../../errorHandler.js';
describe('ASCVD Risk Calculator', () => {
    test('Should return High Risk immediately for Known ASCVD', () => {
        const result = ascvdCalculation({
            'known-ascvd': true
        });
        expect(result).not.toBeNull();
        expect(result).toHaveLength(2);
        expect(result[0].value).toBe('High Risk');
        expect(result[0].alertClass).toBe('danger');
    });
    test('Should throw ValidationError if required fields are missing', () => {
        expect(() => {
            ascvdCalculation({
                'known-ascvd': false,
                'ascvd-age': 55
                // Missing others
            });
        }).toThrow(ValidationError);
    });
    test('Should throw ValidationError if age is out of range', () => {
        expect(() => {
            ascvdCalculation({
                'known-ascvd': false,
                'ascvd-age': 30, // Too young
                'ascvd-tc': 200,
                'ascvd-hdl': 50,
                'ascvd-sbp': 120
            });
        }).toThrow(/Valid for ages 40-79/);
    });
    test('Should calculate standard risk for White Male', () => {
        // Case: 55yo White Male, TC 210, HDL 50, SBP 140, On Tx, No DM, Smoker
        const inputs = {
            'known-ascvd': false,
            'ascvd-age': 55,
            'ascvd-gender': 'male',
            'ascvd-race': 'white',
            'ascvd-tc': 210,
            'ascvd-hdl': 50,
            'ascvd-sbp': 140,
            'ascvd-htn': 'yes',
            'ascvd-dm': 'no',
            'ascvd-smoker': 'yes'
        };
        const result = ascvdCalculation(inputs);
        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);
        const risk = parseFloat(String(result[0].value));
        expect(risk).toBeGreaterThan(0);
        expect(risk).toBeLessThan(100);
    });
    test('Should calculate standard risk for African American Female', () => {
        // Updated inputs for measurable risk
        const inputs = {
            'known-ascvd': false,
            'ascvd-age': 70,
            'ascvd-gender': 'female',
            'ascvd-race': 'aa',
            'ascvd-tc': 240,
            'ascvd-hdl': 40,
            'ascvd-sbp': 160,
            'ascvd-htn': 'yes',
            'ascvd-dm': 'yes',
            'ascvd-smoker': 'yes'
        };
        const result = ascvdCalculation(inputs);
        expect(result).not.toBeNull();
        const risk = parseFloat(String(result[0].value));
        expect(risk).toBeGreaterThan(0.5); // Ensure it's substantial
        expect(risk).toBeLessThan(100);
    });
});
