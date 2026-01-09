/**
 * Allowable Blood Loss (ABL) Calculator - SaMD Verification Tests
 * 
 * Formulas:
 *   EBV (Estimated Blood Volume) = Weight (kg) × Blood Volume Factor (mL/kg)
 *   Hgb_avg = (Hgb_initial + Hgb_final) / 2
 *   ABL = EBV × (Hgb_initial - Hgb_final) / Hgb_avg
 * 
 * Blood Volume Factors:
 *   - Adult man: 75 mL/kg
 *   - Adult woman: 65 mL/kg
 *   - Infant: 80 mL/kg
 *   - Neonate: 85 mL/kg
 *   - Premature neonate: 96 mL/kg
 * 
 * Constraints:
 *   - Hgb_initial must be > Hgb_final (target)
 * 
 * Reference: Standard perioperative blood loss management calculations
 */

import { calculateABL } from '../../calculators/abl/calculation.js';

describe('Allowable Blood Loss (ABL) Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    
    describe('Standard Calculations', () => {
        test('Should calculate correct ABL for Adult Male', () => {
            // 70 kg adult male (75 mL/kg)
            // Initial Hgb: 14 g/dL, Target Hgb: 7 g/dL
            // EBV = 70 × 75 = 5250 mL
            // Hgb_avg = (14 + 7) / 2 = 10.5 g/dL
            // ABL = 5250 × (14 - 7) / 10.5 = 5250 × 7 / 10.5 = 3500 mL
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 14,
                'abl-hgb-final': 7,
                'abl-age-category': 75  // Adult male
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(3);
            
            expect(result![0].label).toBe('Maximum Allowable Blood Loss');
            expect(result![0].value).toBe('3500');
            expect(result![0].unit).toBe('mL');
            
            expect(result![1].label).toBe('Estimated Blood Volume (EBV)');
            expect(result![1].value).toBe('5250');
            
            expect(result![2].label).toBe('Average Hemoglobin');
            expect(result![2].value).toBe('10.5');
        });

        test('Should calculate correct ABL for Adult Female', () => {
            // 60 kg adult female (65 mL/kg)
            // Initial Hgb: 12 g/dL, Target Hgb: 8 g/dL
            // EBV = 60 × 65 = 3900 mL
            // Hgb_avg = (12 + 8) / 2 = 10 g/dL
            // ABL = 3900 × (12 - 8) / 10 = 3900 × 4 / 10 = 1560 mL
            const result = calculateABL({
                'abl-weight': 60,
                'abl-hgb-initial': 12,
                'abl-hgb-final': 8,
                'abl-age-category': 65  // Adult female
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('1560');
            expect(result![1].value).toBe('3900');
            expect(result![2].value).toBe('10.0');
        });

        test('Should calculate correct ABL for Infant', () => {
            // 10 kg infant (80 mL/kg)
            // Initial Hgb: 11 g/dL, Target Hgb: 9 g/dL
            // EBV = 10 × 80 = 800 mL
            // Hgb_avg = (11 + 9) / 2 = 10 g/dL
            // ABL = 800 × (11 - 9) / 10 = 800 × 2 / 10 = 160 mL
            const result = calculateABL({
                'abl-weight': 10,
                'abl-hgb-initial': 11,
                'abl-hgb-final': 9,
                'abl-age-category': 80  // Infant
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('160');
            expect(result![1].value).toBe('800');
        });

        test('Should calculate correct ABL for Neonate', () => {
            // 3.5 kg neonate (85 mL/kg)
            // Initial Hgb: 16 g/dL, Target Hgb: 12 g/dL
            // EBV = 3.5 × 85 = 297.5 mL
            // Hgb_avg = (16 + 12) / 2 = 14 g/dL
            // ABL = 297.5 × (16 - 12) / 14 = 297.5 × 4 / 14 = 85 mL
            const result = calculateABL({
                'abl-weight': 3.5,
                'abl-hgb-initial': 16,
                'abl-hgb-final': 12,
                'abl-age-category': 85  // Neonate
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('85');
            expect(result![1].value).toBe('298');  // Rounded from 297.5
        });

        test('Should calculate correct ABL for Premature Neonate', () => {
            // 1.5 kg premature neonate (96 mL/kg)
            // Initial Hgb: 14 g/dL, Target Hgb: 10 g/dL
            // EBV = 1.5 × 96 = 144 mL
            // Hgb_avg = (14 + 10) / 2 = 12 g/dL
            // ABL = 144 × (14 - 10) / 12 = 144 × 4 / 12 = 48 mL
            const result = calculateABL({
                'abl-weight': 1.5,
                'abl-hgb-initial': 14,
                'abl-hgb-final': 10,
                'abl-age-category': 96  // Premature neonate
            });

            expect(result).not.toBeNull();
            expect(result![0].value).toBe('48');
            expect(result![1].value).toBe('144');
        });
    });

    // ===========================================
    // TC-002: Blood Volume Factor Tests
    // ===========================================
    
    describe('Blood Volume Factors', () => {
        const testWeight = 50;
        const testHgbInitial = 14;
        const testHgbFinal = 10;
        const hgbAvg = (testHgbInitial + testHgbFinal) / 2;  // 12

        const bloodVolumeFactors = [
            { factor: 75, label: 'Adult man', expectedEBV: 3750 },
            { factor: 65, label: 'Adult woman', expectedEBV: 3250 },
            { factor: 80, label: 'Infant', expectedEBV: 4000 },
            { factor: 85, label: 'Neonate', expectedEBV: 4250 },
            { factor: 96, label: 'Premature neonate', expectedEBV: 4800 },
        ];

        bloodVolumeFactors.forEach(({ factor, label, expectedEBV }) => {
            test(`Should use ${factor} mL/kg for ${label}`, () => {
                const result = calculateABL({
                    'abl-weight': testWeight,
                    'abl-hgb-initial': testHgbInitial,
                    'abl-hgb-final': testHgbFinal,
                    'abl-age-category': factor
                });

                expect(result).not.toBeNull();
                expect(result![1].value).toBe(expectedEBV.toString());
                
                // Verify ABL calculation
                const expectedABL = Math.round(expectedEBV * (testHgbInitial - testHgbFinal) / hgbAvg);
                expect(result![0].value).toBe(expectedABL.toString());
            });
        });
    });

    // ===========================================
    // TC-003: Hemoglobin Constraint Tests
    // ===========================================
    
    describe('Hemoglobin Constraints', () => {
        test('Should return null when initial Hgb equals final Hgb', () => {
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 10,
                'abl-hgb-final': 10,
                'abl-age-category': 75
            });

            expect(result).toBeNull();
        });

        test('Should return null when initial Hgb is less than final Hgb', () => {
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 8,
                'abl-hgb-final': 10,
                'abl-age-category': 75
            });

            expect(result).toBeNull();
        });

        test('Should work when initial Hgb is just above final Hgb', () => {
            // Hgb_initial = 10, Hgb_final = 9.9
            // This should work
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 10,
                'abl-hgb-final': 9.9,
                'abl-age-category': 75
            });

            expect(result).not.toBeNull();
            expect(parseFloat(result![0].value as string)).toBeGreaterThan(0);
        });
    });

    // ===========================================
    // TC-004: Boundary Value Tests
    // ===========================================
    
    describe('Boundary Values', () => {
        test('Should handle minimum valid weight', () => {
            const result = calculateABL({
                'abl-weight': 0.5,
                'abl-hgb-initial': 14,
                'abl-hgb-final': 10,
                'abl-age-category': 96
            });

            expect(result).not.toBeNull();
            expect(parseFloat(result![0].value as string)).toBeGreaterThan(0);
        });

        test('Should handle large weight', () => {
            // 150 kg patient
            const result = calculateABL({
                'abl-weight': 150,
                'abl-hgb-initial': 14,
                'abl-hgb-final': 7,
                'abl-age-category': 75
            });

            expect(result).not.toBeNull();
            // EBV = 150 * 75 = 11250 mL
            expect(result![1].value).toBe('11250');
        });

        test('Should handle small Hgb difference', () => {
            // Initial: 10, Final: 9 (difference of 1)
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 10,
                'abl-hgb-final': 9,
                'abl-age-category': 75
            });

            expect(result).not.toBeNull();
            // EBV = 5250, Hgb_avg = 9.5, ABL = 5250 * 1 / 9.5 = 553
            expect(parseFloat(result![0].value as string)).toBeCloseTo(553, 0);
        });

        test('Should handle large Hgb difference', () => {
            // Initial: 18, Final: 7 (difference of 11)
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 18,
                'abl-hgb-final': 7,
                'abl-age-category': 75
            });

            expect(result).not.toBeNull();
            // EBV = 5250, Hgb_avg = 12.5, ABL = 5250 * 11 / 12.5 = 4620
            expect(parseFloat(result![0].value as string)).toBeCloseTo(4620, 0);
        });
    });

    // ===========================================
    // TC-005: Invalid Input Tests
    // ===========================================
    
    describe('Invalid Inputs', () => {
        test('Should return null for zero weight', () => {
            const result = calculateABL({
                'abl-weight': 0,
                'abl-hgb-initial': 14,
                'abl-hgb-final': 7,
                'abl-age-category': 75
            });

            expect(result).toBeNull();
        });

        test('Should return null for zero initial Hgb', () => {
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 0,
                'abl-hgb-final': 7,
                'abl-age-category': 75
            });

            expect(result).toBeNull();
        });

        test('Should return null for zero final Hgb', () => {
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 14,
                'abl-hgb-final': 0,
                'abl-age-category': 75
            });

            expect(result).toBeNull();
        });

        test('Should return null for zero blood volume factor', () => {
            const result = calculateABL({
                'abl-weight': 70,
                'abl-hgb-initial': 14,
                'abl-hgb-final': 7,
                'abl-age-category': 0
            });

            expect(result).toBeNull();
        });

        test('Should return null for missing inputs', () => {
            const result = calculateABL({
                'abl-weight': 70
            });

            expect(result).toBeNull();
        });
    });

    // ===========================================
    // TC-006: Golden Dataset Verification
    // ===========================================
    
    describe('Golden Dataset', () => {
        const goldenDataset = [
            // weight, hgbInit, hgbFinal, factor, expectedABL, expectedEBV
            { w: 70, hi: 14, hf: 7, f: 75, abl: 3500, ebv: 5250 },
            { w: 60, hi: 12, hf: 8, f: 65, abl: 1560, ebv: 3900 },
            { w: 80, hi: 15, hf: 10, f: 75, abl: 2400, ebv: 6000 },
            { w: 5, hi: 15, hf: 10, f: 85, abl: 170, ebv: 425 },
            { w: 2, hi: 14, hf: 12, f: 96, abl: 30, ebv: 192 },
        ];

        goldenDataset.forEach((data, index) => {
            test(`Golden Dataset Case ${index + 1}: ${data.w}kg, Hgb ${data.hi}->${data.hf}, factor ${data.f}`, () => {
                const result = calculateABL({
                    'abl-weight': data.w,
                    'abl-hgb-initial': data.hi,
                    'abl-hgb-final': data.hf,
                    'abl-age-category': data.f
                });

                expect(result).not.toBeNull();
                expect(parseFloat(result![0].value as string)).toBeCloseTo(data.abl, -1);  // Within 10 mL
                expect(parseFloat(result![1].value as string)).toBeCloseTo(data.ebv, 0);
            });
        });
    });

    // ===========================================
    // TC-007: Average Hemoglobin Calculation
    // ===========================================
    
    describe('Average Hemoglobin Calculation', () => {
        test('Should correctly calculate average Hgb', () => {
            const testCases = [
                { hi: 14, hf: 10, expected: 12.0 },
                { hi: 15, hf: 7, expected: 11.0 },
                { hi: 12, hf: 8, expected: 10.0 },
                { hi: 10.5, hf: 7.5, expected: 9.0 },
            ];

            testCases.forEach(({ hi, hf, expected }) => {
                const result = calculateABL({
                    'abl-weight': 70,
                    'abl-hgb-initial': hi,
                    'abl-hgb-final': hf,
                    'abl-age-category': 75
                });

                expect(result).not.toBeNull();
                expect(parseFloat(result![2].value as string)).toBe(expected);
            });
        });
    });
});

