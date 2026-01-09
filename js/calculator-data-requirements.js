// src/calculator-data-requirements.ts
// Centralized configuration of FHIR data requirements for each calculator
// This enables automatic data prefetching and population
import { LOINC_CODES, SNOMED_CODES } from './fhir-codes.js';
// ============================================================================
// Common Field Configurations
// ============================================================================
/**
 * Common vital signs field configurations
 */
export const VITAL_SIGNS_FIELDS = {
    temperature: (inputId) => ({
        code: LOINC_CODES.TEMPERATURE,
        inputId,
        label: 'Temperature',
        targetUnit: 'C',
        decimals: 1
    }),
    heartRate: (inputId) => ({
        code: LOINC_CODES.HEART_RATE,
        inputId,
        label: 'Heart Rate',
        decimals: 0
    }),
    respiratoryRate: (inputId) => ({
        code: LOINC_CODES.RESPIRATORY_RATE,
        inputId,
        label: 'Respiratory Rate',
        decimals: 0
    }),
    systolicBP: (inputId) => ({
        code: `${LOINC_CODES.SYSTOLIC_BP},${LOINC_CODES.BP_PANEL}`,
        inputId,
        label: 'Systolic BP',
        decimals: 0
    }),
    diastolicBP: (inputId) => ({
        code: `${LOINC_CODES.DIASTOLIC_BP},${LOINC_CODES.BP_PANEL}`,
        inputId,
        label: 'Diastolic BP',
        decimals: 0
    }),
    oxygenSaturation: (inputId) => ({
        code: LOINC_CODES.OXYGEN_SAT,
        inputId,
        label: 'Oxygen Saturation',
        decimals: 0
    })
};
/**
 * Common laboratory field configurations
 */
export const LAB_FIELDS = {
    sodium: (inputId) => ({
        code: LOINC_CODES.SODIUM,
        inputId,
        label: 'Sodium',
        targetUnit: 'mmol/L',
        decimals: 0
    }),
    potassium: (inputId) => ({
        code: LOINC_CODES.POTASSIUM,
        inputId,
        label: 'Potassium',
        targetUnit: 'mmol/L',
        decimals: 1
    }),
    creatinine: (inputId) => ({
        code: LOINC_CODES.CREATININE,
        inputId,
        label: 'Creatinine',
        targetUnit: 'mg/dL',
        decimals: 2
    }),
    bun: (inputId) => ({
        code: LOINC_CODES.BUN,
        inputId,
        label: 'BUN',
        targetUnit: 'mg/dL',
        decimals: 1
    }),
    glucose: (inputId) => ({
        code: LOINC_CODES.GLUCOSE,
        inputId,
        label: 'Glucose',
        targetUnit: 'mg/dL',
        decimals: 0
    }),
    hemoglobin: (inputId) => ({
        code: LOINC_CODES.HEMOGLOBIN,
        inputId,
        label: 'Hemoglobin',
        decimals: 1
    }),
    hematocrit: (inputId) => ({
        code: LOINC_CODES.HEMATOCRIT,
        inputId,
        label: 'Hematocrit',
        decimals: 1
    }),
    wbc: (inputId) => ({
        code: '6764-2', // WBC count
        inputId,
        label: 'WBC Count',
        decimals: 1
    }),
    platelets: (inputId) => ({
        code: LOINC_CODES.PLATELETS,
        inputId,
        label: 'Platelets',
        decimals: 0
    }),
    totalCholesterol: (inputId) => ({
        code: LOINC_CODES.CHOLESTEROL_TOTAL,
        inputId,
        label: 'Total Cholesterol',
        targetUnit: 'mg/dL',
        decimals: 0
    }),
    hdl: (inputId) => ({
        code: LOINC_CODES.HDL,
        inputId,
        label: 'HDL Cholesterol',
        targetUnit: 'mg/dL',
        decimals: 0
    }),
    ldl: (inputId) => ({
        code: LOINC_CODES.LDL,
        inputId,
        label: 'LDL Cholesterol',
        targetUnit: 'mg/dL',
        decimals: 0
    }),
    triglycerides: (inputId) => ({
        code: LOINC_CODES.TRIGLYCERIDES,
        inputId,
        label: 'Triglycerides',
        targetUnit: 'mg/dL',
        decimals: 0
    }),
    albumin: (inputId) => ({
        code: LOINC_CODES.ALBUMIN,
        inputId,
        label: 'Albumin',
        decimals: 1
    }),
    bilirubinTotal: (inputId) => ({
        code: LOINC_CODES.BILIRUBIN_TOTAL,
        inputId,
        label: 'Total Bilirubin',
        decimals: 1
    }),
    ast: (inputId) => ({
        code: LOINC_CODES.AST,
        inputId,
        label: 'AST',
        decimals: 0
    }),
    alt: (inputId) => ({
        code: LOINC_CODES.ALT,
        inputId,
        label: 'ALT',
        decimals: 0
    }),
    inr: (inputId) => ({
        code: LOINC_CODES.INR,
        inputId,
        label: 'INR',
        decimals: 2
    }),
    troponin: (inputId) => ({
        code: LOINC_CODES.TROPONIN_I,
        inputId,
        label: 'Troponin',
        decimals: 3
    }),
    bnp: (inputId) => ({
        code: LOINC_CODES.BNP,
        inputId,
        label: 'BNP',
        decimals: 0
    }),
    ntProBnp: (inputId) => ({
        code: LOINC_CODES.NT_PRO_BNP,
        inputId,
        label: 'NT-proBNP',
        decimals: 0
    })
};
/**
 * ABG/Blood Gas field configurations
 */
export const ABG_FIELDS = {
    ph: (inputId) => ({
        code: '11558-4', // Arterial pH
        inputId,
        label: 'Arterial pH',
        decimals: 2
    }),
    pao2: (inputId) => ({
        code: LOINC_CODES.PO2,
        inputId,
        label: 'PaO₂',
        decimals: 0
    }),
    paco2: (inputId) => ({
        code: LOINC_CODES.PCO2,
        inputId,
        label: 'PaCO₂',
        decimals: 0
    }),
    hco3: (inputId) => ({
        code: '1963-8', // Bicarbonate
        inputId,
        label: 'HCO₃',
        decimals: 1
    }),
    lactate: (inputId) => ({
        code: LOINC_CODES.LACTATE,
        inputId,
        label: 'Lactate',
        decimals: 1
    })
};
// ============================================================================
// Calculator-Specific Requirements
// ============================================================================
/**
 * Registry of calculator data requirements
 */
export const CALCULATOR_DATA_REQUIREMENTS = {
    'apache-ii': {
        observations: [
            VITAL_SIGNS_FIELDS.temperature('#apache-ii-temp'),
            { ...VITAL_SIGNS_FIELDS.systolicBP('#apache-ii-map'), label: 'Mean Arterial Pressure' },
            VITAL_SIGNS_FIELDS.heartRate('#apache-ii-hr'),
            VITAL_SIGNS_FIELDS.respiratoryRate('#apache-ii-rr'),
            ABG_FIELDS.ph('#apache-ii-ph'),
            LAB_FIELDS.sodium('#apache-ii-sodium'),
            LAB_FIELDS.potassium('#apache-ii-potassium'),
            LAB_FIELDS.creatinine('#apache-ii-creatinine'),
            LAB_FIELDS.hematocrit('#apache-ii-hct'),
            LAB_FIELDS.wbc('#apache-ii-wbc'),
            { code: '8478-0', inputId: '#apache-ii-gcs', label: 'Glasgow Coma Scale', decimals: 0 }
        ]
    },
    ascvd: {
        observations: [
            VITAL_SIGNS_FIELDS.systolicBP('#ascvd-sbp'),
            LAB_FIELDS.totalCholesterol('#ascvd-tc'),
            LAB_FIELDS.hdl('#ascvd-hdl')
        ]
    },
    'ckd-epi': {
        observations: [LAB_FIELDS.creatinine('#ckd-epi-creatinine')]
    },
    'child-pugh': {
        observations: [
            LAB_FIELDS.bilirubinTotal('#child-pugh-bilirubin'),
            LAB_FIELDS.albumin('#child-pugh-albumin'),
            LAB_FIELDS.inr('#child-pugh-inr')
        ]
    },
    meld: {
        observations: [
            LAB_FIELDS.bilirubinTotal('#meld-bilirubin'),
            LAB_FIELDS.creatinine('#meld-creatinine'),
            LAB_FIELDS.inr('#meld-inr'),
            LAB_FIELDS.sodium('#meld-sodium')
        ]
    },
    'wells-pe': {
        observations: [VITAL_SIGNS_FIELDS.heartRate('#wells-pe-hr')],
        conditions: [SNOMED_CODES.DVT, SNOMED_CODES.PULMONARY_EMBOLISM]
    },
    'heart-score': {
        observations: [LAB_FIELDS.troponin('#heart-score-troponin')],
        conditions: [SNOMED_CODES.CORONARY_ARTERY_DISEASE]
    },
    'grace-acs': {
        observations: [
            VITAL_SIGNS_FIELDS.systolicBP('#grace-sbp'),
            VITAL_SIGNS_FIELDS.heartRate('#grace-hr'),
            LAB_FIELDS.creatinine('#grace-creatinine')
        ]
    },
    'timi-nstemi': {
        observations: [LAB_FIELDS.troponin('#timi-troponin')],
        conditions: [SNOMED_CODES.CORONARY_ARTERY_DISEASE]
    },
    'curb-65': {
        observations: [
            VITAL_SIGNS_FIELDS.respiratoryRate('#curb65-rr'),
            VITAL_SIGNS_FIELDS.systolicBP('#curb65-sbp'),
            VITAL_SIGNS_FIELDS.diastolicBP('#curb65-dbp'),
            LAB_FIELDS.bun('#curb65-bun')
        ]
    },
    sofa: {
        observations: [
            ABG_FIELDS.pao2('#sofa-pao2'),
            LAB_FIELDS.platelets('#sofa-platelets'),
            LAB_FIELDS.bilirubinTotal('#sofa-bilirubin'),
            LAB_FIELDS.creatinine('#sofa-creatinine')
        ]
    },
    qsofa: {
        observations: [
            VITAL_SIGNS_FIELDS.respiratoryRate('#qsofa-rr'),
            VITAL_SIGNS_FIELDS.systolicBP('#qsofa-sbp')
        ]
    },
    'has-bled': {
        observations: [
            LAB_FIELDS.inr('#hasbled-inr'),
            LAB_FIELDS.creatinine('#hasbled-creatinine')
        ],
        conditions: [SNOMED_CODES.HYPERTENSION]
    },
    chadsvasc: {
        observations: [],
        conditions: [SNOMED_CODES.HEART_FAILURE, SNOMED_CODES.HYPERTENSION, SNOMED_CODES.DIABETES]
    },
    'abg-analyzer': {
        observations: [
            ABG_FIELDS.ph('#abg-ph'),
            ABG_FIELDS.paco2('#abg-paco2'),
            ABG_FIELDS.hco3('#abg-hco3'),
            ABG_FIELDS.pao2('#abg-pao2'),
            LAB_FIELDS.sodium('#abg-sodium')
        ]
    },
    'calcium-correction': {
        observations: [
            { code: LOINC_CODES.CALCIUM, inputId: '#calcium', label: 'Calcium', decimals: 1 },
            LAB_FIELDS.albumin('#albumin')
        ]
    },
    fena: {
        observations: [
            {
                code: LOINC_CODES.SODIUM,
                inputId: '#fena-serum-na',
                label: 'Serum Sodium',
                decimals: 0
            },
            { code: '2947-0', inputId: '#fena-urine-na', label: 'Urine Sodium', decimals: 0 },
            LAB_FIELDS.creatinine('#fena-serum-cr'),
            { code: '2161-8', inputId: '#fena-urine-cr', label: 'Urine Creatinine', decimals: 1 }
        ]
    },
    'free-water-deficit': {
        observations: [LAB_FIELDS.sodium('#fwd-sodium')]
    },
    ldl: {
        observations: [
            LAB_FIELDS.totalCholesterol('#ldl-tc'),
            LAB_FIELDS.hdl('#ldl-hdl'),
            LAB_FIELDS.triglycerides('#ldl-tg')
        ]
    },
    'homa-ir': {
        observations: [
            LAB_FIELDS.glucose('#homa-glucose'),
            { code: '20448-7', inputId: '#homa-insulin', label: 'Fasting Insulin', decimals: 1 }
        ]
    },
    'gwtg-hf': {
        observations: [
            VITAL_SIGNS_FIELDS.systolicBP('#gwtg-sbp'),
            LAB_FIELDS.bun('#gwtg-bun'),
            LAB_FIELDS.sodium('#gwtg-sodium'),
            LAB_FIELDS.hemoglobin('#gwtg-hemoglobin')
        ]
    }
};
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Get data requirements for a specific calculator
 */
export function getCalculatorRequirements(calculatorId) {
    return CALCULATOR_DATA_REQUIREMENTS[calculatorId] || null;
}
/**
 * Get all LOINC codes needed by a calculator
 */
export function getCalculatorLoincCodes(calculatorId) {
    const requirements = getCalculatorRequirements(calculatorId);
    if (!requirements) {
        return [];
    }
    return requirements.observations.map(obs => obs.code);
}
/**
 * Get all condition SNOMED codes for a calculator
 */
export function getCalculatorConditionCodes(calculatorId) {
    const requirements = getCalculatorRequirements(calculatorId);
    if (!requirements?.conditions) {
        return [];
    }
    return requirements.conditions;
}
// ============================================================================
// Exports
// ============================================================================
export default {
    CALCULATOR_DATA_REQUIREMENTS,
    VITAL_SIGNS_FIELDS,
    LAB_FIELDS,
    ABG_FIELDS,
    getCalculatorRequirements,
    getCalculatorLoincCodes,
    getCalculatorConditionCodes
};
