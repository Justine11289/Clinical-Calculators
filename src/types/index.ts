/**
 * 計算器類型定義統一導出
 *
 * 使用方式：
 * import type { CalculatorModule, ScoringCalculatorConfig } from '../types';
 * 或
 * import type { CalculatorModule, ScoringCalculatorConfig } from '../types/index.js';
 */

// ==========================================
// 基礎類型
// ==========================================
export type {
    // 通用類型
    AlertSeverity,
    InputType,
    CalculationMode,

    // 計算器模組
    CalculatorModule,

    // FHIR 類型
    FHIRClientType,
    PatientType,
    FieldDataRequirement,
    FHIRAutoPopulateConfig,

    // 風險等級
    BaseRiskLevel,
    RiskLevel,

    // 單位配置
    UnitToggleConfig,

    // 計算結果
    BaseCalculationResult,
    ScoreCalculationResult,
    ValueCalculationResult,

    // 公式區塊
    FormulaReferenceItem,
    ScoringCriteriaItem,
    InterpretationItem,
    FormulaSectionConfig,

    // 基礎配置
    BaseCalculatorConfig
} from './calculator-base.js';

// ==========================================
// 評分計算器類型
// ==========================================
export type {
    // 輸入類型
    ScoringInputType,

    // 選項配置
    ScoringOption,
    RadioChoice,

    // 區塊配置
    ScoringSection,

    // Yes/No 模式
    YesNoQuestion,
    YesNoModeConfig,

    // 風險等級
    ScoringRiskLevel,

    // FHIR 配置
    ScoringFHIRDataRequirements,

    // 主要配置
    ScoringCalculatorConfig,

    // 向後兼容別名
    RadioOption,
    RadioSection,
    RadioScoreCalculatorConfig,
    ScoreCalculatorConfig,
    YesNoCalculatorConfig
} from './calculator-scoring.js';

// ==========================================
// 公式計算器類型
// ==========================================
export type {
    // 輸入配置
    NumberInputConfig,
    RadioOptionItem,
    RadioInputConfig,
    SelectOptionItem,
    SelectInputConfig,
    CheckboxInputConfig,
    InputConfig,

    // 區塊配置
    InputSectionConfig,

    // 計算結果
    FormulaResultItem,
    ComplexCalculationResult,

    // 計算函數
    GetValueFn,
    GetStdValueFn,
    GetRadioValueFn,
    GetCheckboxValueFn,
    SimpleCalculateFn,
    ComplexCalculateFn,

    // 主要配置
    FormulaCalculatorConfig,

    // 向後兼容別名
    FormulaNumberInputConfig,
    FormulaRadioInputConfig,
    FormulaSelectInputConfig,
    FormulaInputConfig,
    FormulaConfig,
    InputFieldConfig,
    RadioFieldConfig,
    InputSection,
    ComplexFormulaCalculatorConfig,
    CalculationResult
} from './calculator-formula.js';

// ==========================================
// 專用計算器類型
// ==========================================
export type {
    // 換算計算器
    DrugOption,
    ConversionMatrix,
    ConversionTableConfig,
    ConversionResult,
    ConversionCalculatorConfig,

    // 動態列表計算器
    DynamicListItemOption,
    DynamicListRiskLevel,
    DynamicListCalculatorConfig,

    // 條件式評分計算器
    ConditionalScoreOption,
    ConditionalScoreCriterion,
    ConditionalScoreCategory,
    ConditionalScoreInterpretation,
    ConditionSelectorConfig,
    ConditionalFHIRAutoPopulate,
    ConditionalScoreCalculatorConfig,

    // 混合輸入計算器
    MixedNumberInputConfig,
    MixedRadioOptionConfig,
    MixedRadioGroupConfig,
    MixedSelectOptionConfig,
    MixedSelectConfig,
    MixedInputItemConfig,
    MixedSectionConfig,
    MixedCalculationResult,
    MixedRiskLevel,
    MixedFHIRDataRequirements,
    MixedInputCalculatorConfig,

    // 向後兼容別名
    ItemOption,
    ScoreOption,
    ScoreCriterion,
    ScoreCategory,
    ScoreInterpretation
} from './calculator-specialized.js';
