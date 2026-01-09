/**
 * 6 Minute Walk Distance Calculator - SaMD Verification Tests
 * 
 * Formulas (Enright & Sherrill, 1998):
 *   Men:   6MWD = (7.57 × height_cm) - (5.02 × age) - (1.76 × weight_kg) - 309
 *   Women: 6MWD = (2.11 × height_cm) - (2.29 × weight_kg) - (5.78 × age) + 667
 *   
 *   Lower Limit of Normal (LLN) = Expected Distance - 153 meters
 *   
 *   % of Expected = (Actual Distance / Expected Distance) × 100
 *     - < 80%: Reduced (warning)
 *     - >= 80%: Normal (success)
 * 
 * Reference: 
 * Enright, P L, & Sherrill, D L. (1998). Reference equations for the six-minute walk 
 * in healthy adults. American Journal of Respiratory and Critical Care Medicine, 
 * 158(5 Pt 1), 1384-7.
 */

import { calculate6MWD } from '../../calculators/6mwd/calculation.js';

describe('6 Minute Walk Distance Calculator', () => {
    // ===========================================
    // TC-001: Standard Calculation Tests
    // ===========================================
    
    describe('Standard Calculations', () => {
        test('Should calculate correct 6MWD for Male', () => {
            // Male, 62 years, 175 cm, 88 kg
            // 6MWD = (7.57 × 175) - (5.02 × 62) - (1.76 × 88) - 309
            // 6MWD = 1324.75 - 311.24 - 154.88 - 309 = 549.63 ≈ 550
            // LLN = 550 - 153 = 397
            const result = calculate6MWD({
                'mwd6-age': 62,
                'mwd6-height': 175,
                'mwd6-weight': 88,
                'mwd6-gender': 'male'
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(2);
            
            expect(result![0].label).toBe('Expected Distance');
            expect(parseFloat(result![0].value as string)).toBeCloseTo(550, 0);
            
            expect(result![1].label).toBe('Lower Limit of Normal');
            expect(parseFloat(result![1].value as string)).toBeCloseTo(397, 0);
        });

        test('Should calculate correct 6MWD for Female', () => {
            // Female, 62 years, 165 cm, 70 kg
            // 6MWD = (2.11 × 165) - (2.29 × 70) - (5.78 × 62) + 667
            // 6MWD = 348.15 - 160.3 - 358.36 + 667 = 496.49 ≈ 496
            // LLN = 496 - 153 = 343
            const result = calculate6MWD({
                'mwd6-age': 62,
                'mwd6-height': 165,
                'mwd6-weight': 70,
                'mwd6-gender': 'female'
            });

            expect(result).not.toBeNull();
            expect(parseFloat(result![0].value as string)).toBeCloseTo(496, 0);
            expect(parseFloat(result![1].value as string)).toBeCloseTo(343, 0);
        });

        test('Should calculate % of expected when actual distance provided', () => {
            // Male with expected ~550m, actual 450m
            // % = (450 / 550) × 100 = 81.8%
            const result = calculate6MWD({
                'mwd6-age': 62,
                'mwd6-height': 175,
                'mwd6-weight': 88,
                'mwd6-gender': 'male',
                'mwd6-distance': 450
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(3);
            
            expect(result![2].label).toBe('% of Expected');
            expect(parseFloat(result![2].value as string)).toBeCloseTo(82, 0);
            expect(result![2].alertClass).toBe('success');  // >= 80%
            expect(result![2].interpretation).toBe('Normal');
        });
    });

    // ===========================================
    // TC-002: Age Effect Tests
    // ===========================================
    
    describe('Age Effect', () => {
        test('Should show higher expected distance for younger patients', () => {
            // Same parameters, different ages
            const result40 = calculate6MWD({
                'mwd6-age': 40,
                'mwd6-height': 175,
                'mwd6-weight': 75,
                'mwd6-gender': 'male'
            });

            const result70 = calculate6MWD({
                'mwd6-age': 70,
                'mwd6-height': 175,
                'mwd6-weight': 75,
                'mwd6-gender': 'male'
            });

            expect(result40).not.toBeNull();
            expect(result70).not.toBeNull();
            
            const expected40 = parseFloat(result40![0].value as string);
            const expected70 = parseFloat(result70![0].value as string);
            
            // Each year of age decreases distance by 5.02m (male)
            // 30 years difference = 150.6m difference
            expect(expected40).toBeGreaterThan(expected70);
            expect(expected40 - expected70).toBeCloseTo(150.6, 0);
        });
    });

    // ===========================================
    // TC-003: Severity Classification Tests
    // ===========================================
    
    describe('Severity Classification', () => {
        test('Should identify "Reduced" when < 80% of expected', () => {
            // Male, expected ~600m, actual 400m (67%)
            const result = calculate6MWD({
                'mwd6-age': 50,
                'mwd6-height': 180,
                'mwd6-weight': 75,
                'mwd6-gender': 'male',
                'mwd6-distance': 400
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(3);
            
            const percentage = parseFloat(result![2].value as string);
            expect(percentage).toBeLessThan(80);
            expect(result![2].alertClass).toBe('warning');
            expect(result![2].interpretation).toBe('Reduced');
        });

        test('Should identify "Normal" when >= 80% of expected', () => {
            // Male, 50yo, 180cm, 75kg
            // Expected = 7.57*180 - 5.02*50 - 1.76*75 - 309 = 1362.6 - 251 - 132 - 309 = 670.6
            // Actual 550m -> 550/670.6 = 82%
            const result = calculate6MWD({
                'mwd6-age': 50,
                'mwd6-height': 180,
                'mwd6-weight': 75,
                'mwd6-gender': 'male',
                'mwd6-distance': 550
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(3);
            
            const percentage = parseFloat(result![2].value as string);
            expect(percentage).toBeGreaterThanOrEqual(80);
            expect(result![2].alertClass).toBe('success');
            expect(result![2].interpretation).toBe('Normal');
        });

        test('Should handle boundary near 80%', () => {
            // Male, 50yo, 180cm, 75kg
            // Expected = 670.6, Actual = 536 -> 536/670.6 = 79.9% ≈ 80%
            const result = calculate6MWD({
                'mwd6-age': 50,
                'mwd6-height': 180,
                'mwd6-weight': 75,
                'mwd6-gender': 'male',
                'mwd6-distance': 537  // ~80% of ~671
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(3);
            
            const percentage = parseFloat(result![2].value as string);
            expect(percentage).toBeCloseTo(80, 0);
        });
    });

    // ===========================================
    // TC-004: Optional Distance Input Tests
    // ===========================================
    
    describe('Optional Distance Input', () => {
        test('Should return only 2 results when actual distance not provided', () => {
            const result = calculate6MWD({
                'mwd6-age': 62,
                'mwd6-height': 175,
                'mwd6-weight': 88,
                'mwd6-gender': 'male'
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(2);
            expect(result![0].label).toBe('Expected Distance');
            expect(result![1].label).toBe('Lower Limit of Normal');
        });

        test('Should return 3 results when actual distance is provided', () => {
            const result = calculate6MWD({
                'mwd6-age': 62,
                'mwd6-height': 175,
                'mwd6-weight': 88,
                'mwd6-gender': 'male',
                'mwd6-distance': 450
            });

            expect(result).not.toBeNull();
            expect(result).toHaveLength(3);
            expect(result![2].label).toBe('% of Expected');
        });
    });

    // ===========================================
    // TC-005: Invalid Input Tests
    // ===========================================
    
    describe('Invalid Inputs', () => {
        test('Should return null for zero age', () => {
            const result = calculate6MWD({
                'mwd6-age': 0,
                'mwd6-height': 175,
                'mwd6-weight': 88,
                'mwd6-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for zero height', () => {
            const result = calculate6MWD({
                'mwd6-age': 62,
                'mwd6-height': 0,
                'mwd6-weight': 88,
                'mwd6-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for zero weight', () => {
            const result = calculate6MWD({
                'mwd6-age': 62,
                'mwd6-height': 175,
                'mwd6-weight': 0,
                'mwd6-gender': 'male'
            });

            expect(result).toBeNull();
        });

        test('Should return null for missing inputs', () => {
            const result = calculate6MWD({
                'mwd6-age': 62
            });

            expect(result).toBeNull();
        });
    });

    // ===========================================
    // TC-006: Golden Dataset Verification
    // ===========================================
    
    describe('Golden Dataset', () => {
        // Manually calculated using formulas:
        // Male: 7.57 * height - 5.02 * age - 1.76 * weight - 309
        // Female: 2.11 * height - 2.29 * weight - 5.78 * age + 667
        // LLN = Expected - 153
        const goldenDataset = [
            // age, height, weight, gender, expectedDistance, LLN
            // 40yo male, 180cm, 75kg: 7.57*180 - 5.02*40 - 1.76*75 - 309 = 720.8
            { age: 40, h: 180, w: 75, g: 'male', expected: 721, lln: 568 },
            // 60yo male, 170cm, 80kg: 7.57*170 - 5.02*60 - 1.76*80 - 309 = 535.5
            { age: 60, h: 170, w: 80, g: 'male', expected: 536, lln: 383 },
            // 40yo female, 165cm, 60kg: 2.11*165 - 2.29*60 - 5.78*40 + 667 = 647.05
            { age: 40, h: 165, w: 60, g: 'female', expected: 647, lln: 494 },
            // 60yo female, 160cm, 70kg: 2.11*160 - 2.29*70 - 5.78*60 + 667 = 496.5
            { age: 60, h: 160, w: 70, g: 'female', expected: 497, lln: 344 },
            // 80yo male, 165cm, 70kg: 7.57*165 - 5.02*80 - 1.76*70 - 309 = 414.75
            { age: 80, h: 165, w: 70, g: 'male', expected: 415, lln: 262 },
        ];

        goldenDataset.forEach((data, index) => {
            test(`Golden Dataset Case ${index + 1}: ${data.age}yo ${data.g}, ${data.h}cm, ${data.w}kg`, () => {
                const result = calculate6MWD({
                    'mwd6-age': data.age,
                    'mwd6-height': data.h,
                    'mwd6-weight': data.w,
                    'mwd6-gender': data.g
                });

                expect(result).not.toBeNull();
                expect(parseFloat(result![0].value as string)).toBeCloseTo(data.expected, 0);
                expect(parseFloat(result![1].value as string)).toBeCloseTo(data.lln, 0);
            });
        });
    });

    // ===========================================
    // TC-007: Gender-Specific Formula Verification
    // ===========================================
    
    describe('Gender-Specific Formulas', () => {
        test('Male formula should use coefficients 7.57, -5.02, -1.76, -309', () => {
            // Manual calculation: 7.57 * 170 - 5.02 * 50 - 1.76 * 70 - 309
            // = 1286.9 - 251 - 123.2 - 309 = 603.7
            const result = calculate6MWD({
                'mwd6-age': 50,
                'mwd6-height': 170,
                'mwd6-weight': 70,
                'mwd6-gender': 'male'
            });

            expect(result).not.toBeNull();
            const expected = 7.57 * 170 - 5.02 * 50 - 1.76 * 70 - 309;
            expect(parseFloat(result![0].value as string)).toBeCloseTo(expected, 0);
        });

        test('Female formula should use coefficients 2.11, -2.29, -5.78, +667', () => {
            // Manual calculation: 2.11 * 170 - 2.29 * 70 - 5.78 * 50 + 667
            // = 358.7 - 160.3 - 289 + 667 = 576.4
            const result = calculate6MWD({
                'mwd6-age': 50,
                'mwd6-height': 170,
                'mwd6-weight': 70,
                'mwd6-gender': 'female'
            });

            expect(result).not.toBeNull();
            const expected = 2.11 * 170 - 2.29 * 70 - 5.78 * 50 + 667;
            expect(parseFloat(result![0].value as string)).toBeCloseTo(expected, 0);
        });
    });
});

