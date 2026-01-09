import { calculateABG } from '../../calculators/abg-analyzer/calculation';
describe('ABG Analyzer SaMD Verification', () => {
    // Helper to mock the getter functions
    const mockGetters = (values) => {
        const getValue = (id) => values[id];
        const getStdValue = (id) => values[id]; // Assuming inputs are already standard
        const getRadioValue = (id) => values[id];
        const getCheckboxValue = (id) => false;
        return { getValue, getStdValue, getRadioValue, getCheckboxValue };
    };
    describe('TC-001: Standard Calculations', () => {
        test('Should identify Normal Acid-Base Status', () => {
            const { getValue, getStdValue, getRadioValue, getCheckboxValue } = mockGetters({
                ph: 7.40,
                pco2: 40,
                hco3: 24,
                sodium: 140,
                chloride: 100,
                albumin: 4.0 // No AG correction needed
            });
            const result = calculateABG(getValue, getStdValue, getRadioValue, getCheckboxValue);
            expect(result?.interpretation).toBe('Normal Acid-Base Status');
            expect(result?.severity).toBe('success');
            // AG = 140 - (100 + 24) = 16. Corrected AG leads to "Normal Anion Gap (16.0)"? 
            // Wait, normal AG is 10-12 usually. 16 is high?
            // "Normal anion gap is 10-12 mEq/L" says the note.
            // So 16 is definitely high.
            const agItem = result?.additionalResults?.find(i => i.label === 'Anion Gap Assessment');
            expect(agItem?.value).toContain('High Anion Gap (16.0)');
        });
        test('Should identify Respiratory Acidosis', () => {
            const { getValue, getStdValue, getRadioValue, getCheckboxValue } = mockGetters({
                ph: 7.25, // Acidosis
                pco2: 60, // High -> Respiratory
                hco3: 26, // Normalish
                sodium: 140, chloride: 100, albumin: 4
            });
            const result = calculateABG(getValue, getStdValue, getRadioValue, getCheckboxValue);
            expect(result?.interpretation).toBe('Respiratory Acidosis');
            expect(result?.severity).toBe('danger');
        });
    });
    describe('TC-002: Anion Gap & Delta Ratio', () => {
        test('Should calculate High Anion Gap Metabolic Acidosis', () => {
            const { getValue, getStdValue, getRadioValue, getCheckboxValue } = mockGetters({
                ph: 7.20,
                pco2: 30, // Compensatory low
                hco3: 14, // Low -> Metabolic
                sodium: 140,
                chloride: 100,
                albumin: 4.0
            });
            const result = calculateABG(getValue, getStdValue, getRadioValue, getCheckboxValue);
            expect(result?.interpretation).toBe('Metabolic Acidosis'); // Primary
            const agItem = result?.additionalResults?.find(i => i.label === 'Anion Gap Assessment');
            expect(agItem?.value).toContain('High Anion Gap (26.0)');
            const deltaItem = result?.additionalResults?.find(i => i.label === 'Delta Ratio Analysis');
            expect(deltaItem?.value).toContain('Delta Ratio: 1.40');
            expect(deltaItem?.value).toContain('Pure high anion gap metabolic acidosis'); // 0.8 - 2.0
        });
    });
    describe('TC-004: Invalid Inputs', () => {
        test('Should return null validation fail (missing pco2)', () => {
            const { getValue, getStdValue, getRadioValue } = mockGetters({
                ph: 7.40,
                // pco2 missing
                hco3: 24,
            });
            const getStdValNull = (id) => id === 'pco2' ? null : 24;
            const getValueNull = (id) => 7.40;
            const result = calculateABG(getValueNull, getStdValNull, (() => ''), (() => false));
            expect(result).toBeNull();
        });
    });
});
