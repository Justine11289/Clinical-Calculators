// Centralized management of LOINC and SNOMED CT codes
/**
 * LOINC Codes Registry
 * Standard codes for laboratory and clinical observations
 * Reference: https://loinc.org/
 */
export const LOINC_CODES = {
    // Vital Signs
    SYSTOLIC_BP: '8480-6', // Systolic blood pressure
    DIASTOLIC_BP: '8462-4', // Diastolic blood pressure
    BP_PANEL: '85354-9,55284-4', // Blood pressure panel
    HEART_RATE: '8867-4', // Heart rate
    RESPIRATORY_RATE: '9279-1', // Respiratory rate
    TEMPERATURE: '8310-5,8331-1', // Body temperature (and Oral)
    OXYGEN_SATURATION: '59408-5', // Oxygen saturation (Pulse Ox)
    OXYGEN_SATURATION_ARTERIAL: '2708-6', // Oxygen saturation (Arterial)
    // Body Measurements
    HEIGHT: '8302-2', // Body height
    WEIGHT: '29463-7', // Body weight
    BMI: '39156-5', // Body mass index
    HEAD_CIRCUMFERENCE: '8287-5', // Head circumference
    // Laboratory - Hematology
    HEMOGLOBIN: '718-7', // Hemoglobin
    HEMATOCRIT: '4544-3', // Hematocrit
    WBC: '6690-2', // White blood cells
    PLATELETS: '777-3', // Platelets (automated count)
    PLATELETS_ALT: '26515-7', // Platelets (in blood)
    EOSINOPHILS: '26478-8', // Eosinophils
    // Laboratory - Chemistry
    SODIUM: '2951-2', // Sodium
    POTASSIUM: '2823-3', // Potassium
    CHLORIDE: '2075-0', // Chloride
    BICARBONATE: '1963-8', // Bicarbonate (serum)
    CO2: '2028-9', // Carbon dioxide
    BUN: '3094-0', // Blood urea nitrogen
    BUN_ALT: '6299-8', // BUN (alternative code)
    CREATININE: '2160-0', // Creatinine
    GLUCOSE: '2345-7', // Glucose
    CALCIUM: '17861-6', // Calcium
    MAGNESIUM: '2601-3', // Magnesium
    PHOSPHATE: '2777-1', // Phosphate
    ALBUMIN: '1751-7', // Albumin
    // Laboratory - Liver Function
    BILIRUBIN_TOTAL: '1975-2', // Bilirubin total
    BILIRUBIN_DIRECT: '1968-7', // Bilirubin direct
    AST: '1920-8', // AST (SGOT)
    ALT: '1742-6', // ALT (SGPT)
    ALP: '6768-6', // Alkaline phosphatase
    GGT: '2324-2', // Gamma glutamyl transferase
    ALBUMIN_SERUM: '1751-7', // Albumin serum
    TOTAL_PROTEIN: '2885-2', // Total protein
    INR: '6301-6', // INR
    // Laboratory - Lipid Panel
    CHOLESTEROL_TOTAL: '2093-3', // Cholesterol total
    HDL: '2085-9', // HDL cholesterol
    LDL: '2089-1', // LDL cholesterol
    TRIGLYCERIDES: '2571-8', // Triglycerides
    // Laboratory - Renal Function
    EGFR: '33914-3', // eGFR
    URINE_POTASSIUM: '2829-0', // Urine potassium
    SERUM_OSMOLALITY: '2695-6', // Serum osmolality
    URINE_OSMOLALITY: '2697-2', // Urine osmolality
    URINE_SODIUM: '2828-2', // Urine sodium
    URINE_CREATININE: '2161-8', // Urine creatinine
    // Laboratory - Inflammatory Markers
    CRP: '1988-5', // C-reactive protein
    ESR: '4537-7', // Erythrocyte sedimentation rate
    PROCALCITONIN: '33959-8', // Procalcitonin
    // Laboratory - Cardiac Markers
    TROPONIN_I: '10839-9', // Troponin I
    TROPONIN_T: '6598-7', // Troponin T
    TROPONIN_T_HIGH: '30239-8', // Troponin T high sensitivity
    TROPONIN_I_HIGH: '15056-5', // Troponin I high sensitivity
    TROPONIN_ALT: '32195-5', // Troponin (alternative)
    BNP: '30934-4', // BNP
    NT_PRO_BNP: '33762-6', // NT-proBNP
    // Laboratory - Coagulation
    PT: '5902-2', // Prothrombin time
    PTT: '14979-9', // Partial thromboplastin time
    INR_COAG: '34714-6', // INR from coagulation panel
    FIBRINOGEN: '3255-7', // Fibrinogen
    D_DIMER: '48065-7', // D-dimer
    // Laboratory - Arterial Blood Gas
    PH: '2744-1', // pH
    PCO2: '2019-8', // pCO2
    PO2: '2703-7', // pO2
    PaO2_FiO2: '50984-4', // PaO2/FiO2 ratio
    HCO3: '1960-4', // Bicarbonate
    BASE_EXCESS: '1925-7', // Base excess
    LACTATE: '2524-7', // Lactate
    FIO2: '3150-0', // Inhaled oxygen concentration
    // Cardiac Measurements
    QT_INTERVAL: '8633-1', // QT interval (raw)
    // Laboratory - Other
    HBA1C: '4548-4', // Hemoglobin A1c
    TSH: '3016-3', // Thyroid stimulating hormone
    FREE_T4: '3053-6', // Free T4
    CORTISOL: '2143-6', // Cortisol
    URIC_ACID: '3084-1', // Uric acid
    AMYLASE: '1798-8', // Amylase
    LIPASE: '3040-3', // Lipase
    LDH: '2532-0', // Lactate dehydrogenase
    CULTURE: '630-4', // Bacteria identified in Unspecified specimen by Culture
    ETHANOL: '49765-1', // Ethanol concentration
    FERRITIN: '2276-4', // Ferritin
    VITAMIN_D: '1989-3', // Vitamin D 25-hydroxy
    // Clinical Assessments
    GCS: '9269-2', // Glasgow Coma Scale
    PAIN_SCORE: '72514-3', // Pain severity
    APGAR_1MIN: '9272-6', // Apgar score 1 minute
    APGAR_5MIN: '9274-2', // Apgar score 5 minute
    SMOKING_STATUS: '72166-2', // Smoking status
    // Other Observations
    UREA: '3094-0', // Urea
    BLOOD_TYPE: '882-1', // Blood type
    RH_FACTOR: '10331-7' // Rh factor
};
/**
 * SNOMED CT Codes Registry
 * Standard codes for clinical conditions and procedures
 * Reference: https://www.snomed.org/
 */
export const SNOMED_CODES = {
    // Cardiovascular Conditions
    HYPERTENSION: '38341003',
    CORONARY_ARTERY_DISEASE: '53741008',
    MYOCARDIAL_INFARCTION: '22298006',
    HEART_FAILURE: '84114007',
    ATRIAL_FIBRILLATION: '49436004',
    STROKE: '230690007',
    TIA: '266257000',
    PERIPHERAL_ARTERY_DISEASE: '399957001',
    CARDIOGENIC_SHOCK: '27885002',
    ACUTE_CORONARY_SYNDROME: '394659003',
    // Respiratory Conditions
    COPD: '13645005',
    ASTHMA: '195967001',
    PNEUMONIA: '233604007',
    PULMONARY_EMBOLISM: '59282003',
    RESPIRATORY_FAILURE: '409622000',
    SLEEP_APNEA: '78275009',
    // Metabolic/Endocrine
    DIABETES_MELLITUS: '73211009',
    DIABETES_TYPE_1: '46635009',
    DIABETES_TYPE_2: '44054006',
    HYPERLIPIDEMIA: '55822004',
    OBESITY: '414915002',
    HYPOTHYROIDISM: '40930008',
    HYPERTHYROIDISM: '34486009',
    // Renal Conditions
    CHRONIC_KIDNEY_DISEASE: '709044004',
    ACUTE_KIDNEY_INJURY: '14669001',
    END_STAGE_RENAL_DISEASE: '46177005',
    DIALYSIS_DEPENDENT: '429451001',
    // Liver Conditions
    CIRRHOSIS: '19943007',
    LIVER_FAILURE: '59927004',
    HEPATITIS: '40468003',
    ALCOHOLIC_LIVER_DISEASE: '41309000',
    // Hematological
    ANEMIA: '271737000',
    BLEEDING_DISORDER: '64779008',
    THROMBOCYTOPENIA: '415116008',
    ANTICOAGULATION_THERAPY: '281789004',
    // Neurological
    DEMENTIA: '52448006',
    EPILEPSY: '84757009',
    PARKINSONS_DISEASE: '49049000',
    MULTIPLE_SCLEROSIS: '24700007',
    // Malignancies
    MALIGNANCY: '363346000',
    METASTATIC_CANCER: '94225005',
    LEUKEMIA: '93143009',
    LYMPHOMA: '118600007',
    // Infections
    SEPSIS: '91302008',
    HIV: '86406008',
    TUBERCULOSIS: '56717001',
    COVID_19: '840539006',
    // Substance Use
    SMOKING: '77176002',
    ALCOHOL_ABUSE: '7200002',
    DRUG_ABUSE: '66214007',
    // Procedures
    PACEMAKER: '14106009',
    CABG: '232717009',
    PCI: '415070008',
    VALVE_SURGERY: '119978007',
    TRANSPLANT: '77465005',
    // Risk Factors
    FAMILY_HISTORY_CAD: '266897004',
    PREVIOUS_MI: '399211009',
    PREVIOUS_STROKE: '161505003',
    PREVIOUS_BLEEDING: '131148009'
};
/**
 * Get LOINC code by common name
 * @param {string} name - Common name of the observation
 * @returns {string|null} - LOINC code or null if not found
 */
export function getLoincCode(name) {
    const upperName = name.toUpperCase().replace(/[- ]/g, '_');
    return LOINC_CODES[upperName] || null;
}
/**
 * Get SNOMED code by condition name
 * @param {string} name - Common name of the condition
 * @returns {string|null} - SNOMED code or null if not found
 */
export function getSnomedCode(name) {
    const upperName = name.toUpperCase().replace(/[- ]/g, '_');
    return SNOMED_CODES[upperName] || null;
}
/**
 * Get descriptive name for a LOINC code
 * @param {string} code - LOINC code
 * @returns {string|null} - Descriptive name or null if not found
 */
export function getLoincName(code) {
    const entry = Object.entries(LOINC_CODES).find(([, value]) => value === code);
    return entry ? entry[0].replace(/_/g, ' ').toLowerCase() : null;
}
/**
 * Get descriptive name for a SNOMED code
 * @param {string} code - SNOMED code
 * @returns {string|null} - Descriptive name or null if not found
 */
export function getSnomedName(code) {
    const entry = Object.entries(SNOMED_CODES).find(([, value]) => value === code);
    return entry ? entry[0].replace(/_/g, ' ').toLowerCase() : null;
}
/**
 * Validate if a code is a valid LOINC code format
 * @param {string} code - Code to validate
 * @returns {boolean} - True if valid LOINC format
 */
export function isValidLoincCode(code) {
    // LOINC codes are typically 4-5 digits followed by a dash and 1 digit
    return /^\d{4,5}-\d$/.test(code);
}
/**
 * Validate if a code is a valid SNOMED CT code format
 * @param {string} code - Code to validate
 * @returns {boolean} - True if valid SNOMED format
 */
export function isValidSnomedCode(code) {
    // SNOMED codes are typically 6-18 digit numbers
    return /^\d{6,18}$/.test(code);
}
/**
 * Get all vital signs LOINC codes
 * @returns {Object} - Object containing vital signs codes
 */
export function getVitalSignsCodes() {
    return {
        systolicBP: LOINC_CODES.SYSTOLIC_BP,
        diastolicBP: LOINC_CODES.DIASTOLIC_BP,
        heartRate: LOINC_CODES.HEART_RATE,
        respiratoryRate: LOINC_CODES.RESPIRATORY_RATE,
        temperature: LOINC_CODES.TEMPERATURE,
        oxygenSaturation: LOINC_CODES.OXYGEN_SATURATION
    };
}
/**
 * Get all laboratory codes by category
 * @param {string} category - Category name (e.g., 'hematology', 'chemistry')
 * @returns {Object} - Object containing codes for that category
 */
export function getLabCodesByCategory(category) {
    const categories = {
        hematology: {
            hemoglobin: LOINC_CODES.HEMOGLOBIN,
            hematocrit: LOINC_CODES.HEMATOCRIT,
            wbc: LOINC_CODES.WBC,
            platelets: LOINC_CODES.PLATELETS
        },
        chemistry: {
            sodium: LOINC_CODES.SODIUM,
            potassium: LOINC_CODES.POTASSIUM,
            chloride: LOINC_CODES.CHLORIDE,
            co2: LOINC_CODES.CO2,
            bun: LOINC_CODES.BUN,
            creatinine: LOINC_CODES.CREATININE,
            glucose: LOINC_CODES.GLUCOSE
        },
        liver: {
            bilirubinTotal: LOINC_CODES.BILIRUBIN_TOTAL,
            ast: LOINC_CODES.AST,
            alt: LOINC_CODES.ALT,
            alp: LOINC_CODES.ALP,
            albumin: LOINC_CODES.ALBUMIN_SERUM,
            inr: LOINC_CODES.INR
        },
        lipid: {
            totalCholesterol: LOINC_CODES.CHOLESTEROL_TOTAL,
            hdl: LOINC_CODES.HDL,
            ldl: LOINC_CODES.LDL,
            triglycerides: LOINC_CODES.TRIGLYCERIDES
        },
        cardiac: {
            troponinI: LOINC_CODES.TROPONIN_I,
            troponinT: LOINC_CODES.TROPONIN_T,
            bnp: LOINC_CODES.BNP,
            ntProBnp: LOINC_CODES.NT_PRO_BNP
        }
    };
    return categories[category.toLowerCase()] || null;
}
// Export default object with all codes
export default {
    LOINC: LOINC_CODES,
    SNOMED: SNOMED_CODES,
    getLoincCode,
    getSnomedCode,
    getLoincName,
    getSnomedName,
    isValidLoincCode,
    isValidSnomedCode,
    getVitalSignsCodes,
    getLabCodesByCategory,
    getMeasurementType
};
/**
 * Get the measurement type for a LOINC code
 * Used for unit conversion
 * @param {string} code - LOINC code
 * @returns {string} - Measurement type (e.g., 'temperature', 'weight') or 'concentration' default
 */
export function getMeasurementType(code) {
    // Handle comma-separated codes (take first)
    const primaryCode = code.split(',')[0].trim();
    // Map LOINC codes to measurement types
    const codeMap = {
        // Vital Signs
        [LOINC_CODES.TEMPERATURE]: 'temperature', // Body temperature 8310-5
        '8331-1': 'temperature', // Oral temperature
        // Cholesterol/Lipids
        [LOINC_CODES.CHOLESTEROL_TOTAL]: 'cholesterol',
        [LOINC_CODES.HDL]: 'hdl',
        [LOINC_CODES.LDL]: 'ldl',
        [LOINC_CODES.TRIGLYCERIDES]: 'triglycerides',
        // Glucose
        [LOINC_CODES.GLUCOSE]: 'glucose',
        '2339-0': 'glucose', // Fasting glucose
        // Creatinine
        [LOINC_CODES.CREATININE]: 'creatinine',
        '38483-4': 'creatinine', // Creatinine (blood)
        // Calcium
        [LOINC_CODES.CALCIUM]: 'calcium',
        // Albumin
        [LOINC_CODES.ALBUMIN_SERUM]: 'albumin',
        [LOINC_CODES.ALBUMIN]: 'albumin',
        // Bilirubin
        [LOINC_CODES.BILIRUBIN_TOTAL]: 'bilirubin',
        [LOINC_CODES.BILIRUBIN_DIRECT]: 'bilirubin',
        // Hemoglobin
        [LOINC_CODES.HEMOGLOBIN]: 'hemoglobin',
        // BUN
        [LOINC_CODES.BUN]: 'bun',
        [LOINC_CODES.BUN_ALT]: 'bun',
        '6299-2': 'bun', // BUN
        // Electrolytes (Na, K)
        [LOINC_CODES.SODIUM]: 'electrolyte',
        [LOINC_CODES.POTASSIUM]: 'electrolyte',
        // Weight/Height
        [LOINC_CODES.WEIGHT]: 'weight',
        [LOINC_CODES.HEIGHT]: 'height'
    };
    return codeMap[primaryCode] || 'concentration';
}
