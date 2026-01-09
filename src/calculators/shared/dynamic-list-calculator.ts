/**
 * 動態列表計算器工廠函數
 *
 * 適用於可動態新增/刪除項目的計算器，如：
 * - MME 計算器（多種鴉片類藥物）
 * - 多藥物總量計算
 *
 * 特點：
 * - 動態新增/刪除項目
 * - 自動彙總計算
 * - 支援分級結果顯示
 */

import { uiBuilder } from '../../ui-builder.js';

// ==========================================
// 類型定義
// ==========================================

/** 項目選項 */
export interface ItemOption {
    /** 選項值 */
    value: string;
    /** 顯示標籤 */
    label: string;
    /** 換算因子 */
    factor: number;
}

/** 風險等級 */
export interface RiskLevel {
    minValue: number;
    maxValue: number;
    label: string;
    severity: 'success' | 'warning' | 'danger' | 'info';
    recommendation?: string;
}

/** 動態列表計算器配置 */
export interface DynamicListCalculatorConfig {
    id: string;
    title: string;
    description: string;

    /** 項目選項列表 */
    itemOptions: ItemOption[];

    /** 項目標籤（如 "Opioid"） */
    itemLabel: string;

    /** 數值標籤（如 "Daily Dose"） */
    valueLabel: string;

    /** 數值單位（如 "mg/day"） */
    valueUnit?: string;

    /** 結果標籤（如 "Total Daily MME"） */
    resultLabel: string;

    /** 結果單位（如 "MME/day"） */
    resultUnit?: string;

    /** 風險等級 */
    riskLevels?: RiskLevel[];

    /** 新增按鈕文字 */
    addButtonText?: string;

    /** 說明提示 */
    infoAlert?: string;

    /** 警告提示 */
    warningAlert?: string;

    /** 額外資訊（HTML） */
    additionalInfo?: string;

    /** 自訂結果渲染函數 */
    customResultRenderer?: (
        total: number,
        items: Array<{ option: string; value: number }>
    ) => string;
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
 * 創建動態列表計算器
 */
export function createDynamicListCalculator(config: DynamicListCalculatorConfig): CalculatorModule {
    return {
        id: config.id,
        title: config.title,
        description: config.description,

        generateHTML(): string {
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
                    title: config.itemLabel + 's',
                    icon: '💊',
                    content: `
                        <div id="${config.id}-list">
                            <!-- Dynamic rows will be added here -->
                        </div>
                        <div class="mt-15">
                            <button id="${config.id}-add-btn" class="ui-button ui-button-secondary full-width">
                                + ${config.addButtonText || 'Add Item'}
                            </button>
                        </div>
                    `
                })}

                ${uiBuilder.createResultBox({ id: `${config.id}-result`, title: config.resultLabel })}

                ${config.additionalInfo || ''}
            `;
        },

        initialize(client, patient, container): void {
            uiBuilder.initializeComponents(container);

            const listContainer = container.querySelector(`#${config.id}-list`) as HTMLElement;
            const addBtn = container.querySelector(`#${config.id}-add-btn`) as HTMLElement;
            const resultBox = container.querySelector(`#${config.id}-result`);

            // 建立選項映射
            const optionMap = new Map<string, ItemOption>();
            config.itemOptions.forEach(opt => optionMap.set(opt.value, opt));

            const selectOptions = config.itemOptions.map(opt => ({
                value: opt.value,
                label: opt.label
            }));

            const calculate = () => {
                let total = 0;
                const items: Array<{ option: string; value: number }> = [];
                const rows = listContainer.querySelectorAll(`.${config.id}-row`);

                if (rows.length === 0) {
                    if (resultBox) resultBox.classList.remove('show');
                    return;
                }

                rows.forEach(row => {
                    const select = row.querySelector('select') as HTMLSelectElement;
                    const input = row.querySelector('input') as HTMLInputElement;
                    const optionValue = select?.value;
                    const inputValue = parseFloat(input?.value || '0');

                    if (optionValue && inputValue > 0) {
                        const option = optionMap.get(optionValue);
                        if (option) {
                            total += inputValue * option.factor;
                            items.push({ option: optionValue, value: inputValue });
                        }
                    }
                });

                // 渲染結果
                if (resultBox) {
                    const resultContent = resultBox.querySelector('.ui-result-content');

                    if (config.customResultRenderer) {
                        if (resultContent) {
                            resultContent.innerHTML = config.customResultRenderer(total, items);
                        }
                    } else {
                        // 預設結果渲染
                        let riskLevel = '';
                        let alertType: 'success' | 'warning' | 'danger' | 'info' = 'info';
                        let recommendation = '';

                        if (config.riskLevels) {
                            for (const level of config.riskLevels) {
                                if (total >= level.minValue && total < level.maxValue) {
                                    riskLevel = level.label;
                                    alertType = level.severity;
                                    recommendation = level.recommendation || '';
                                    break;
                                }
                            }
                        }

                        if (resultContent) {
                            resultContent.innerHTML = `
                                ${uiBuilder.createResultItem({
                                    label: config.resultLabel,
                                    value: total.toFixed(1),
                                    unit: config.resultUnit || '',
                                    interpretation: riskLevel,
                                    alertClass: `ui-alert-${alertType}`
                                })}
                                ${
                                    recommendation
                                        ? uiBuilder.createAlert({
                                              type: alertType,
                                              message: `<strong>Recommendation:</strong> ${recommendation}`
                                          })
                                        : ''
                                }
                            `;
                        }
                    }
                    resultBox.classList.add('show');
                }
            };

            const createRow = () => {
                const rowId = `${config.id}-row-${Date.now()}`;
                const div = document.createElement('div');
                div.className = `${config.id}-row flex-row gap-md align-center mb-10 p-10`;

                const selectHTML = uiBuilder.createSelect({
                    id: `${rowId}-select`,
                    label: config.itemLabel,
                    options: selectOptions
                });

                const inputHTML = uiBuilder.createInput({
                    id: `${rowId}-input`,
                    label: config.valueLabel,
                    type: 'number',
                    placeholder: config.valueUnit || ''
                });

                div.innerHTML = `
                    <div class="flex-1">${selectHTML}</div>
                    <div class="flex-1">${inputHTML}</div>
                    <button class="remove-btn ui-button ui-button-danger mt-20">✕</button>
                `;

                listContainer.appendChild(div);

                const select = div.querySelector('select') as HTMLSelectElement;
                const input = div.querySelector('input') as HTMLInputElement;
                const removeBtn = div.querySelector('.remove-btn') as HTMLElement;

                select?.addEventListener('change', calculate);
                input?.addEventListener('input', calculate);
                removeBtn?.addEventListener('click', () => {
                    div.remove();
                    calculate();
                });
            };

            addBtn?.addEventListener('click', createRow);

            // 建立初始行
            createRow();
        }
    };
}
