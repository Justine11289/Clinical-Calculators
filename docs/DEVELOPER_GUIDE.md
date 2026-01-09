# Developer Guide: Creating & Validating Calculators

This guide provides a comprehensive standard for creating new medical calculators in this project. It integrates rules for **SaMD (Software as a Medical Device)** compliance, ensuring strict validation, standardized coding, and consistent UI.

---

## 🚨 Critical Development Rules

1.  **Mandatory Clinical Codes**: Every numeric, diagnosis, or medication input **MUST** have a corresponding standard code (LOINC for labs/vitals, SNOMED for conditions, RxNorm for medications).
    *   *If a code does not exist in `src/fhir-codes.ts`, you MUST add it.*
2.  **Mandatory Validation**: Every numeric input **MUST** have a validation rule (Green/Yellow/Red zones).
    *   *If a rule does not exist in `src/validator.ts`, you MUST add it.*
3.  **No Raw HTML**: Use the provided Factory functions and `uiBuilder`. Do not write custom HTML structures.
4.  **SaMD Verification**: Every new calculator **MUST** have a corresponding test file in `src/__tests__/calculators/` validation against a "Golden Dataset".

---

## 1. Choosing the Right Factory

| Calculator Type | Factory Function | File Location |
| :--- | :--- | :--- |
| **Point-Based Scores** | `createScoringCalculator` | `src/calculators/shared/scoring-calculator.ts` |
| **Formulas / Equations** | `createUnifiedFormulaCalculator` | `src/calculators/shared/unified-formula-calculator.ts` |
| **Unit Conversions** | `createConversionCalculator` | `src/calculators/shared/conversion-calculator.ts` |

---

## 2. Implementation Steps

### Step 1: Create Files
Create a folder in `src/calculators/` (e.g., `my-calc`).
*   `calculation.ts`: Pure function for math logic (for Formula calculators).
*   `index.ts`: Configuration and UI definition.

### Step 2: Define Codes (`src/fhir-codes.ts`)
**Check if codes exist.** If not, find the code (e.g., on [loinc.org](https://loinc.org/search/)) and add it:

```typescript
// src/fhir-codes.ts
export const LOINC_CODES = {
    // ... existing codes
    MY_NEW_LAB: '12345-6', // Add your code here
};
```

### Step 3: Define Validation (`src/validator.ts`)
**Check if a validation type exists.** If not, add a new rule defining safe ranges:

```typescript
// src/validator.ts
export const ValidationRules = {
    // ... existing rules
    myNewType: {
        required: true,
        min: 0,           // Red Low (Blocker)
        max: 100,         // Red High (Blocker)
        warnMin: 10,      // Yellow Low (Warning)
        warnMax: 90,      // Yellow High (Warning)
        message: 'Value must be 0-100',
        warningMessage: 'Value is unusual'
    }
};
```

### Step 4: Implement Logic (`calculation.ts`)
(Only for Formula Calculators)
Write a pure function that takes a dictionary of values and returns standardized results.

```typescript
// src/calculators/my-calc/calculation.ts
import type { SimpleCalculateFn, FormulaResultItem } from '../../types/calculator-formula';

export const calculateMyCalc: SimpleCalculateFn = (values) => {
    const val = Number(values['my-input']);
    if (!val || isNaN(val)) return null;

    return [{
        label: 'Result',
        value: (val * 2).toFixed(1),
        unit: 'units',
        alertClass: 'success'
    }];
};
```

### Step 5: Configure Calculator (`index.ts`)

#### A. Formula Calculator Example
```typescript
import { createUnifiedFormulaCalculator } from '../shared/unified-formula-calculator';
import { LOINC_CODES } from '../../fhir-codes';
import { calculateMyCalc } from './calculation';

export const myCalc = createUnifiedFormulaCalculator({
    id: 'my-calc',
    title: 'My Calculator',
    sections: [{
        title: 'Input Section',
        fields: [{
            type: 'number',
            id: 'my-input',
            label: 'Input Label',
            // CRITICAL: Link Codes and Validation
            loincCode: LOINC_CODES.MY_NEW_LAB,
            validationType: 'myNewType', 
            standardUnit: 'mg/dL',
            unitToggle: { type: 'creatinine', units: ['mg/dL', 'mmol/L'], default: 'mg/dL' }
        }]
    }],
    calculate: calculateMyCalc
});
```

#### B. Scoring Calculator Example
```typescript
import { createScoringCalculator } from '../shared/scoring-calculator';

export const myScore = createScoringCalculator({
    id: 'my-score',
    title: 'My Score',
    inputType: 'checkbox', // or 'radio', 'yesno'
    sections: [{
        title: 'Risk Factors',
        options: [
            { id: 'opt1', label: 'Factor 1', value: 1 }
        ]
    }],
    riskLevels: [
        { minScore: 0, maxScore: 1, severity: 'success', label: 'Low Risk' }
    ]
});
```

---

## 3. SaMD Verification & Testing

Every calculator must be verified. Create `src/__tests__/calculators/my-calc.test.ts`.

### Required Test Cases (TC)

*   **TC-001 (Standard)**: Verify standard input calculates correctly.
*   **TC-002 (Classification)**: Verify risk levels (Low/Medium/High) trigger correctly.
*   **TC-003 (Boundary)**: Test values exactly at cut-off points.
*   **TC-004 (Invalid)**: Test zeros, negatives, or missing inputs (should return `null`).
*   **TC-005 (Golden Dataset)**: Test against known-good clinical examples.

### Test Template
```typescript
import { calculateMyCalc } from '../../calculators/my-calc/calculation';

describe('My Calc SaMD Validation', () => {
    test('TC-001: Standard Calculation', () => {
        const result = calculateMyCalc({ 'my-input': 10 });
        expect(result![0].value).toBe('20.0');
    });
});
```

## 4. UI Best Practices

*   **Info Alerts**: Use `infoAlert` config property for clinical notes. Use `uiBuilder.createList` for formatted content.
*   **Formulas**: Use `formulas` or `formulaSection` config to display the math/logic to the user.
*   **Icons**: Use emoji icons in `sections` titles (e.g., '👤', '🧪').

---

## Summary Checklist

- [ ] Does every numeric input have a `loincCode`?
- [ ] Does every numeric input have a `validationType`?
- [ ] Are missing codes added to `fhir-codes.ts`?
- [ ] Are missing validation rules added to `validator.ts`?
- [ ] Is `uiBuilder` / factory used (no raw HTML)?
- [ ] Is there a test file verifying the calculation?
