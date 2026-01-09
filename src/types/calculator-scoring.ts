/**
 * 評分計算器類型定義
 *
 * 適用於 createScoringCalculator 工廠函數
 * 支援 Radio、Checkbox、Yes/No 三種輸入模式
 */

import type {
    AlertSeverity,
    BaseCalculatorConfig,
    BaseRiskLevel,
    FieldDataRequirement,
    FormulaSectionConfig,
    FHIRClientType,
    PatientType
} from './calculator-base.js';

// ==========================================
// 輸入類型
// ==========================================

/** 評分輸入類型 */
export type ScoringInputType = 'radio' | 'checkbox' | 'yesno';

// ==========================================
// 選項配置
// ==========================================

/** 評分選項 (Radio/Checkbox 模式) */
export interface ScoringOption {
    /** 選項 ID (checkbox 模式必須，radio 模式可選) */
    id?: string;
    /** 選項值 */
    value: string | number;
    /** 顯示標籤 */
    label: string;
    /** 是否預設選中 */
    checked?: boolean;
    /** 額外說明 */
    description?: string;
    /** 分數 (checkbox 模式使用) */
    points?: number;
    /** SNOMED 條件代碼（用於 FHIR 自動選擇） */
    conditionCode?: string;
}

/** Radio 選項 (簡化版) */
export interface RadioChoice {
    /** 選項值 */
    value: string;
    /** 顯示標籤 */
    label: string;
    /** 分數 */
    points: number;
    /** 是否預設選中 */
    checked?: boolean;
}

// ==========================================
// 區塊配置
// ==========================================

/** 評分區塊 */
export interface ScoringSection {
    /** 區塊 ID (radio 模式作為 name) */
    id?: string;
    /** 區塊名稱 (radio 模式使用) */
    name?: string;
    /** 區塊標題 */
    title: string;
    /** 圖示 */
    icon?: string;
    /** 副標題/說明 */
    subtitle?: string;
    /** 選項列表 (必填) */
    options: ScoringOption[];
    /** Radio 選項 (替代 options 的簡化格式) */
    choices?: RadioChoice[];
    /** LOINC 代碼（用於 FHIR 自動填充） */
    loincCode?: string;
    /** 數值映射（用於將 FHIR 數值轉換為選項值） */
    valueMapping?: Array<{
        condition: (value: number) => boolean;
        optionValue?: string;
        /** @deprecated 使用 optionValue 代替 */
        radioValue?: string;
    }>;
    /** 觀察值條件（用於 FHIR 自動選「是」）- yesno 模式 */
    observationCriteria?: {
        code: string;
        condition: (value: number) => boolean;
    };
}

// ==========================================
// Yes/No 模式配置
// ==========================================

/** Yes/No 問題 */
export interface YesNoQuestion {
    /** 問題 ID */
    id: string;
    /** 問題標籤 */
    label: string;
    /** 選「是」時的分數 */
    points: number;
    /** 額外說明 */
    description?: string;
    /** SNOMED 條件代碼（用於 FHIR 自動選「是」） */
    conditionCode?: string;
    /** LOINC 觀察值條件 */
    observationCriteria?: {
        code: string;
        condition: (value: number) => boolean;
    };
}

/** Yes/No 模式區塊配置 */
export interface YesNoModeConfig {
    /** 區塊標題 */
    sectionTitle?: string;
    /** 區塊圖示 */
    sectionIcon?: string;
    /** 分數範圍文字 */
    scoreRange?: string;
}

// ==========================================
// 風險等級
// ==========================================

/** 評分風險等級 */
export interface ScoringRiskLevel extends BaseRiskLevel {
    /** 風險描述 */
    risk?: string;
    /** 類別 */
    category?: string;
}

// ==========================================
// FHIR 配置
// ==========================================

/** 評分 FHIR 數據需求 */
export interface ScoringFHIRDataRequirements {
    /** 觀察值需求 */
    observations?: FieldDataRequirement[];
    /** 條件代碼（SNOMED） */
    conditions?: string[];
    /** 藥物代碼（RxNorm） */
    medications?: string[];
    /** 自動選擇配置 */
    autoSelectByValue?: Array<{
        /** 選項名稱/ID */
        optionName: string;
        /** LOINC 代碼 */
        loincCode: string;
        /** 值映射函數 */
        valueMapper: (value: number) => string;
    }>;
    /** 自動填充患者年齡 */
    autoPopulateAge?: {
        inputId?: string;
        questionId?: string;
        condition?: (age: number) => boolean;
    };
    /** 自動填充患者性別 */
    autoPopulateGender?: {
        radioName?: string;
        questionId?: string;
        maleValue: string;
        femaleValue: string;
    };
}

// ==========================================
// 主要配置介面
// ==========================================

/** 評分計算器配置 */
export interface ScoringCalculatorConfig extends BaseCalculatorConfig {
    /**
     * 輸入類型
     * - 'radio': Radio groups (每個區塊單選)
     * - 'checkbox': Checkboxes (可多選)
     * - 'yesno': Yes/No radio pairs (是/否選擇)
     * @default 'radio'
     */
    inputType?: ScoringInputType;

    /** 區塊列表 (radio/checkbox 模式) */
    sections?: ScoringSection[];

    /** 問題列表 (yesno 模式的簡化配置) */
    questions?: YesNoQuestion[];

    /** Yes/No 模式區塊標題 */
    sectionTitle?: string;
    /** Yes/No 模式區塊圖示 */
    sectionIcon?: string;
    /** 分數範圍文字 */
    scoreRange?: string;

    /** 風險等級列表 */
    riskLevels: ScoringRiskLevel[];

    /** 解釋說明 */
    interpretationInfo?: string;
    /** 參考文獻列表 */
    references?: string[];

    /** Formula 區塊配置 */
    formulaSection?: FormulaSectionConfig;

    /**
     * 舊格式公式項目 (向後兼容)
     * @deprecated 請使用 formulaSection 代替
     */
    formulaItems?: Array<{
        title: string;
        formulas?: string[];
        content?: string;
        notes?: string;
    }>;

    /** FHIR 數據需求 */
    dataRequirements?: ScoringFHIRDataRequirements;
    /** @deprecated 使用 dataRequirements 代替 */
    fhirDataRequirements?: ScoringFHIRDataRequirements;

    /** 自定義結果渲染函數 */
    customResultRenderer?: (score: number, sectionScores: Record<string, number>) => string;

    /** 自定義初始化函數 */
    customInitialize?: (
        client: FHIRClientType | null,
        patient: PatientType | null,
        container: HTMLElement,
        calculate: () => void
    ) => void | Promise<void>;
}

// ==========================================
// 向後兼容別名
// ==========================================

/** @deprecated 使用 ScoringOption */
export type RadioOption = ScoringOption;
/** @deprecated 使用 ScoringSection */
export type RadioSection = ScoringSection;
/** @deprecated 使用 ScoringRiskLevel */
export type RiskLevel = ScoringRiskLevel;
/** @deprecated 使用 ScoringCalculatorConfig */
export type RadioScoreCalculatorConfig = ScoringCalculatorConfig;
/** @deprecated 使用 ScoringCalculatorConfig */
export type ScoreCalculatorConfig = ScoringCalculatorConfig;
/** @deprecated 使用 ScoringCalculatorConfig */
export type YesNoCalculatorConfig = ScoringCalculatorConfig;
