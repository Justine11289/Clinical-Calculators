/**
 * 藥物換算計算器工廠函數
 *
 * 適用於藥物劑量轉換的計算器，如：
 * - 類固醇換算 (Steroid Conversion)
 * - 苯二氮平類換算 (Benzodiazepine Conversion)
 *
 * 特點：
 * - 支援雙向換算（從 A 藥物 → B 藥物）
 * - 自動生成等效劑量表
 * - 支援換算範圍顯示
 */

import { uiBuilder } from '../../ui-builder.js';

// ==========================================
// 類型定義
// ==========================================

/** 藥物選項 */
export interface DrugOption {
    /** 藥物識別碼 */
    id: string;
    /** 顯示名稱 */
    name: string;
    /** 等效劑量（相對於基準藥物） */
    equivalentDose: number;
    /** 換算範圍（可選，用於不確定性換算） */
    conversionRange?: [number, number];
}

/** 藥物換算矩陣（用於複雜換算關係） */
export interface ConversionMatrix {
    [fromDrug: string]: {
        [toDrug: string]: {
            factor: number;
            range?: [number, number];
        };
    };
}

/** 換算表配置 */
export interface ConversionTableConfig {
    /** 是否顯示換算表 */
    show: boolean;
    /** 表格標題 */
    title?: string;
    /** 是否固定第一欄 */
    stickyFirstColumn?: boolean;
}

/** 換算計算器配置 */
export interface ConversionCalculatorConfig {
    id: string;
    title: string;
    description: string;

    /** 藥物列表 */
    drugs: DrugOption[];

    /**
     * 換算矩陣（可選）
     * 如果提供，將使用矩陣中的特定換算因子
     * 如果未提供，將使用 equivalentDose 計算
     */
    conversionMatrix?: ConversionMatrix;

    /** 換算表配置 */
    conversionTable?: ConversionTableConfig;

    /** 是否顯示換算範圍 */
    showRange?: boolean;

    /** 單位（如 "mg"） */
    unit?: string;

    /** 說明提示 */
    infoAlert?: string;

    /** 警告提示 */
    warningAlert?: string;

    /** 額外資訊（HTML） */
    additionalInfo?: string;

    /** 自訂結果渲染函數 */
    customResultRenderer?: (result: ConversionResult) => string;
}

/** 換算結果 */
export interface ConversionResult {
    fromDrug: DrugOption;
    toDrug: DrugOption;
    fromDose: number;
    toDose: number;
    rangeMin?: number;
    rangeMax?: number;
}

/** 計算器模組介面 */
export interface CalculatorModule {
    id: string;
    title: string;
    description: string;
    generateHTML: () => string;
    initialize: (client: unknown, patient: unknown, container: HTMLElement) => void;
}

// ==========================================
// 工廠函數
// ==========================================

/**
 * 創建藥物換算計算器
 */
export function createConversionCalculator(config: ConversionCalculatorConfig): CalculatorModule {
    const unit = config.unit || 'mg';

    return {
        id: config.id,
        title: config.title,
        description: config.description,

        generateHTML(): string {
            const drugOptions = config.drugs.map(d => ({
                value: d.id,
                label: d.name
            }));

            // 生成換算表
            let tableHTML = '';
            if (config.conversionTable?.show !== false) {
                const headers = ['Reference Dose', ...config.drugs.map(d => d.name)];
                const rows = config.drugs.map(drug => {
                    const firstCell = `${drug.name} ${drug.equivalentDose} ${unit}`;
                    const conversions = config.drugs.map(targetDrug => {
                        if (config.conversionMatrix) {
                            const factor =
                                config.conversionMatrix[drug.id]?.[targetDrug.id]?.factor;
                            if (factor !== undefined) {
                                return (drug.equivalentDose * factor).toFixed(2);
                            }
                        }
                        // 使用等效劑量計算
                        return (
                            (drug.equivalentDose / targetDrug.equivalentDose) *
                            drug.equivalentDose
                        ).toFixed(2);
                    });
                    return [firstCell, ...conversions];
                });

                tableHTML = uiBuilder.createSection({
                    title: config.conversionTable?.title || 'Equivalence Table',
                    content: `
                        ${uiBuilder.createTable({
                            headers,
                            rows,
                            stickyFirstColumn: config.conversionTable?.stickyFirstColumn ?? true
                        })}
                        <p class="table-note text-sm text-muted mt-10">
                            <strong>Note:</strong> These are approximate equivalents. Individual patient response may vary.
                        </p>
                    `
                });
            }

            // 生成提示
            const warningHTML = config.warningAlert
                ? uiBuilder.createAlert({ type: 'warning', message: config.warningAlert })
                : '';

            const infoHTML = config.infoAlert
                ? uiBuilder.createAlert({ type: 'info', message: config.infoAlert })
                : '';

            return `
                <div class="calculator-header">
                    <h3>${config.title}</h3>
                    <p class="description">${config.description}</p>
                </div>

                ${warningHTML}
                ${infoHTML}

                ${uiBuilder.createSection({
                    title: 'Conversion',
                    content: `
                        <div class="conversion-row flex-row gap-lg align-end">
                            <div class="flex-1">
                                ${uiBuilder.createInput({
                                    id: `${config.id}-from-dose`,
                                    label: 'Dose',
                                    type: 'number',
                                    placeholder: 'Enter dose',
                                    min: 0
                                })}
                            </div>
                            <div class="flex-1">
                                ${uiBuilder.createSelect({
                                    id: `${config.id}-from-drug`,
                                    label: 'From',
                                    options: drugOptions
                                })}
                            </div>
                        </div>
                        <div class="text-center font-bold mb-10 mt-10">IS EQUIVALENT TO</div>
                        <div class="conversion-row flex-row gap-lg align-end">
                            <div class="flex-1">
                                ${uiBuilder.createInput({
                                    id: `${config.id}-to-dose`,
                                    label: 'Equivalent Dose',
                                    type: 'text',
                                    placeholder: 'Result'
                                })}
                            </div>
                            <div class="flex-1">
                                ${uiBuilder.createSelect({
                                    id: `${config.id}-to-drug`,
                                    label: 'To',
                                    options: drugOptions
                                })}
                            </div>
                        </div>
                        ${
                            config.showRange
                                ? `
                            <div id="${config.id}-range" class="mt-10 text-center text-muted ui-hidden">
                                <span class="label">Estimated Range: </span>
                                <span id="${config.id}-range-value"></span>
                            </div>
                        `
                                : ''
                        }
                    `
                })}

                ${tableHTML}
                ${config.additionalInfo || ''}
            `;
        },

        initialize(client, patient, container): void {
            uiBuilder.initializeComponents(container);

            const fromDoseEl = container.querySelector(
                `#${config.id}-from-dose`
            ) as HTMLInputElement;
            const fromDrugEl = container.querySelector(
                `#${config.id}-from-drug`
            ) as HTMLSelectElement;
            const toDoseEl = container.querySelector(`#${config.id}-to-dose`) as HTMLInputElement;
            const toDrugEl = container.querySelector(`#${config.id}-to-drug`) as HTMLSelectElement;
            const rangeEl = container.querySelector(`#${config.id}-range`) as HTMLElement;
            const rangeValueEl = container.querySelector(
                `#${config.id}-range-value`
            ) as HTMLElement;

            // Make result readonly
            if (toDoseEl) {
                toDoseEl.readOnly = true;
            }

            const calculateConversion = () => {
                const fromDose = parseFloat(fromDoseEl?.value || '0');
                const fromDrugId = fromDrugEl?.value;
                const toDrugId = toDrugEl?.value;

                if (isNaN(fromDose) || fromDose <= 0 || !fromDrugId || !toDrugId) {
                    if (toDoseEl) toDoseEl.value = '';
                    if (rangeEl) rangeEl.classList.add('ui-hidden');
                    return;
                }

                const fromDrug = config.drugs.find(d => d.id === fromDrugId);
                const toDrug = config.drugs.find(d => d.id === toDrugId);

                if (!fromDrug || !toDrug) {
                    if (toDoseEl) toDoseEl.value = '';
                    return;
                }

                let toDose: number;
                let rangeMin: number | undefined;
                let rangeMax: number | undefined;

                // 檢查是否有特定的換算矩陣
                if (config.conversionMatrix && config.conversionMatrix[fromDrugId]?.[toDrugId]) {
                    const conversion = config.conversionMatrix[fromDrugId][toDrugId];
                    toDose = fromDose * conversion.factor;
                    if (conversion.range) {
                        rangeMin = fromDose * conversion.range[0];
                        rangeMax = fromDose * conversion.range[1];
                    }
                } else if (fromDrugId === toDrugId) {
                    // 同一藥物
                    toDose = fromDose;
                } else {
                    // 使用等效劑量計算
                    toDose = (fromDose / fromDrug.equivalentDose) * toDrug.equivalentDose;
                }

                if (toDoseEl) {
                    toDoseEl.value = toDose.toFixed(2);
                }

                // 顯示範圍
                if (config.showRange && rangeEl && rangeValueEl) {
                    if (rangeMin !== undefined && rangeMax !== undefined) {
                        rangeValueEl.textContent = `${rangeMin.toFixed(1)} - ${rangeMax.toFixed(1)} ${unit}`;
                        rangeEl.classList.remove('ui-hidden');
                    } else {
                        rangeEl.classList.add('ui-hidden');
                    }
                }
            };

            // 綁定事件
            fromDoseEl?.addEventListener('input', calculateConversion);
            fromDrugEl?.addEventListener('change', calculateConversion);
            toDrugEl?.addEventListener('change', calculateConversion);

            calculateConversion();
        }
    };
}
