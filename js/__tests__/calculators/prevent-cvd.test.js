/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Import the pure calculation functions
import {
    calculateTransformedVariables,
    calculateLinearPredictor,
    calculateRiskPercentage,
    calculatePreventRisk,
    preventCoefficients
} from '../../js/calculators/prevent-cvd/calculation.js';

describe('PREVENT CVD Risk Calculator', () => {
    describe('Coefficients', () => {
        it('should have correct female coefficients', () => {
            const c = preventCoefficients.female;
            expect(c.cage).toBeCloseTo(0.7939, 4);
            expect(c.cnhdl).toBeCloseTo(0.0305, 4);
            expect(c.chdl).toBeCloseTo(-0.1607, 4);
            expect(c.diabetes).toBeCloseTo(0.8668, 4);
            expect(c.smoker).toBeCloseTo(0.5361, 4);
            expect(c.constant).toBeCloseTo(-3.3077, 4);
        });

        it('should have correct male coefficients', () => {
            const c = preventCoefficients.male;
            expect(c.cage).toBeCloseTo(0.7689, 4);
            expect(c.cnhdl).toBeCloseTo(0.0736, 4);
            expect(c.chdl).toBeCloseTo(-0.0954, 4);
            expect(c.diabetes).toBeCloseTo(0.7693, 4);
            expect(c.smoker).toBeCloseTo(0.4387, 4);
            expect(c.constant).toBeCloseTo(-3.0312, 4);
        });
    });

    describe('calculateTransformedVariables', () => {
        it('should correctly transform age (cage)', () => {
            // cage = (age - 55) / 10
            const result = calculateTransformedVariables(55, 5, 1.3, 120, 90);
            expect(result.cage).toBeCloseTo(0, 4); // (55-55)/10 = 0

            const result2 = calculateTransformedVariables(65, 5, 1.3, 120, 90);
            expect(result2.cage).toBeCloseTo(1, 4); // (65-55)/10 = 1

            const result3 = calculateTransformedVariables(45, 5, 1.3, 120, 90);
            expect(result3.cage).toBeCloseTo(-1, 4); // (45-55)/10 = -1
        });

        it('should correctly transform cholesterol (cnhdl)', () => {
            // cnhdl = tc - hdl - 3.5
            const result = calculateTransformedVariables(55, 5, 1.5, 120, 90);
            expect(result.cnhdl).toBeCloseTo(0, 4); // 5 - 1.5 - 3.5 = 0

            const result2 = calculateTransformedVariables(55, 6, 1, 120, 90);
            expect(result2.cnhdl).toBeCloseTo(1.5, 4); // 6 - 1 - 3.5 = 1.5
        });

        it('should correctly transform HDL (chdl)', () => {
            // chdl = (hdl - 1.3) / 0.3
            const result = calculateTransformedVariables(55, 5, 1.3, 120, 90);
            expect(result.chdl).toBeCloseTo(0, 4); // (1.3-1.3)/0.3 = 0

            const result2 = calculateTransformedVariables(55, 5, 1.6, 120, 90);
            expect(result2.chdl).toBeCloseTo(1, 4); // (1.6-1.3)/0.3 = 1
        });

        it('should correctly transform SBP with min/max clamping', () => {
            // csbp = (min(SBP, 110) - 110) / 20
            // csbp2 = (max(SBP, 110) - 130) / 20

            // SBP = 120 (above 110)
            const result = calculateTransformedVariables(55, 5, 1.3, 120, 90);
            expect(result.csbp).toBeCloseTo(0, 4);  // (min(120,110)-110)/20 = (110-110)/20 = 0
            expect(result.csbp2).toBeCloseTo(-0.5, 4); // (max(120,110)-130)/20 = (120-130)/20 = -0.5

            // SBP = 100 (below 110)
            const result2 = calculateTransformedVariables(55, 5, 1.3, 100, 90);
            expect(result2.csbp).toBeCloseTo(-0.5, 4); // (min(100,110)-110)/20 = (100-110)/20 = -0.5
            expect(result2.csbp2).toBeCloseTo(-1, 4);  // (max(100,110)-130)/20 = (110-130)/20 = -1

            // SBP = 140 (above 130)
            const result3 = calculateTransformedVariables(55, 5, 1.3, 140, 90);
            expect(result3.csbp).toBeCloseTo(0, 4);   // (110-110)/20 = 0
            expect(result3.csbp2).toBeCloseTo(0.5, 4); // (140-130)/20 = 0.5
        });

        it('should correctly transform eGFR with min/max clamping', () => {
            // cegfr = (min(eGFR, 60) - 60) / -15
            // cegfr2 = (max(eGFR, 60) - 90) / -15

            // eGFR = 90 (normal kidney function)
            const result = calculateTransformedVariables(55, 5, 1.3, 120, 90);
            expect(result.cegfr).toBeCloseTo(0, 4);  // (min(90,60)-60)/-15 = (60-60)/-15 = 0
            expect(result.cegfr2).toBeCloseTo(0, 4); // (max(90,60)-90)/-15 = (90-90)/-15 = 0

            // eGFR = 45 (CKD stage 3)
            const result2 = calculateTransformedVariables(55, 5, 1.3, 120, 45);
            expect(result2.cegfr).toBeCloseTo(1, 4);  // (45-60)/-15 = 1
            expect(result2.cegfr2).toBeCloseTo(2, 4); // (60-90)/-15 = 2
        });
    });

    describe('calculateRiskPercentage', () => {
        it('should calculate risk using logistic function', () => {
            // Risk % = e^x / (1 + e^x) * 100
            expect(calculateRiskPercentage(0)).toBeCloseTo(50, 1); // e^0/(1+e^0) = 0.5 = 50%
            expect(calculateRiskPercentage(-2)).toBeCloseTo(11.9, 1); // ~12%
            expect(calculateRiskPercentage(2)).toBeCloseTo(88.1, 1); // ~88%
        });

        it('should clamp risk between 0.1 and 99.9', () => {
            expect(calculateRiskPercentage(-10)).toBe(0.1);
            expect(calculateRiskPercentage(10)).toBe(99.9);
        });
    });

    describe('calculatePreventRisk - Clinical Scenarios', () => {
        it('should calculate low risk for healthy young patient', () => {
            // 40-year-old healthy male with optimal values
            const risk = calculatePreventRisk(
                40,           // age
                'male',       // gender
                5.0,          // tc (mmol/L) ~193 mg/dL
                1.5,          // hdl (mmol/L) ~58 mg/dL
                120,          // sbp
                90,           // egfr (normal)
                false,        // diabetes
                false,        // smoker
                false,        // antihtn
                false         // statin
            );
            expect(risk).toBeLessThan(5); // Low risk
        });

        it('should calculate higher risk for diabetic smoker', () => {
            // 55-year-old diabetic male smoker
            const riskDiabeticSmoker = calculatePreventRisk(
                55,
                'male',
                6.0,          // elevated tc
                1.0,          // low hdl
                140,          // elevated sbp
                60,           // borderline egfr
                true,         // diabetes
                true,         // smoker
                false,
                false
            );

            // Same patient without diabetes and smoking
            const riskHealthy = calculatePreventRisk(
                55,
                'male',
                6.0,
                1.0,
                140,
                60,
                false,        // no diabetes
                false,        // non-smoker
                false,
                false
            );

            expect(riskDiabeticSmoker).toBeGreaterThan(riskHealthy);
        });

        it('should show statin use reduces risk', () => {
            const riskWithoutStatin = calculatePreventRisk(
                60, 'female', 6.5, 1.2, 130, 70,
                false, false, false, false
            );

            const riskWithStatin = calculatePreventRisk(
                60, 'female', 6.5, 1.2, 130, 70,
                false, false, false, true  // on statin
            );

            expect(riskWithStatin).toBeLessThan(riskWithoutStatin);
        });

        it('should show antihypertensive use effect on risk', () => {
            // High BP patient
            const riskWithAntihtn = calculatePreventRisk(
                60, 'male', 5.5, 1.3, 150, 80,
                false, false, true, false  // on antihtn
            );

            const riskWithoutAntihtn = calculatePreventRisk(
                60, 'male', 5.5, 1.3, 150, 80,
                false, false, false, false
            );

            // Antihypertensive drugs adjust risk (positive coeff for antihtn but negative interaction)
            // The net effect depends on the SBP level
            expect(riskWithAntihtn).not.toBe(riskWithoutAntihtn);
        });

        it('should calculate higher risk for older patients', () => {
            const riskYoung = calculatePreventRisk(
                40, 'male', 5.0, 1.3, 120, 90,
                false, false, false, false
            );

            const riskOld = calculatePreventRisk(
                70, 'male', 5.0, 1.3, 120, 90,
                false, false, false, false
            );

            expect(riskOld).toBeGreaterThan(riskYoung);
        });

        it('should calculate different risks for male vs female', () => {
            const riskMale = calculatePreventRisk(
                55, 'male', 5.5, 1.3, 130, 80,
                false, false, false, false
            );

            const riskFemale = calculatePreventRisk(
                55, 'female', 5.5, 1.3, 130, 80,
                false, false, false, false
            );

            // Generally males have higher CVD risk at same age
            expect(riskMale).not.toBe(riskFemale);
        });

        it('should calculate higher risk with reduced eGFR', () => {
            const riskNormalEgfr = calculatePreventRisk(
                60, 'male', 5.5, 1.3, 130, 90,  // normal eGFR
                false, false, false, false
            );

            const riskLowEgfr = calculatePreventRisk(
                60, 'male', 5.5, 1.3, 130, 40,  // CKD stage 3b
                false, false, false, false
            );

            expect(riskLowEgfr).toBeGreaterThan(riskNormalEgfr);
        });
    });

    describe('Edge Cases', () => {
        it('should handle minimum age (30)', () => {
            const risk = calculatePreventRisk(
                30, 'male', 5.0, 1.3, 120, 90,
                false, false, false, false
            );
            expect(risk).toBeGreaterThan(0);
            expect(risk).toBeLessThan(100);
        });

        it('should handle maximum age (79)', () => {
            const risk = calculatePreventRisk(
                79, 'male', 5.0, 1.3, 120, 90,
                false, false, false, false
            );
            expect(risk).toBeGreaterThan(0);
            expect(risk).toBeLessThan(100);
        });

        it('should handle very low SBP', () => {
            const risk = calculatePreventRisk(
                55, 'male', 5.0, 1.3, 90, 90,  // hypotension
                false, false, false, false
            );
            expect(risk).toBeGreaterThan(0);
            expect(risk).toBeLessThan(100);
        });

        it('should handle very high SBP', () => {
            const risk = calculatePreventRisk(
                55, 'male', 5.0, 1.3, 180, 90,  // severe hypertension
                false, false, false, false
            );
            expect(risk).toBeGreaterThan(0);
            expect(risk).toBeLessThan(100);
        });
    });
});
