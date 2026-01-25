import {
    calculatorModules,
    CalculatorMetadata // 確保有匯入型別
} from './calculators/index.js';
import { displayPatientInfo } from './utils.js';

window.onload = async () => {
    const patientInfoDiv = document.getElementById('patient-info') as HTMLElement;
    const calculatorCard = document.getElementById('calculator-card') as HTMLElement;

    const urlParams = new URLSearchParams(window.location.search);
    const calcId = urlParams.get('id');

    if (!calcId) {
        if (calculatorCard) calculatorCard.innerHTML = '<h1>錯誤：未指定計算機 ID</h1>';
        return;
    }

    // 解決 'possibly undefined'：使用變數接收 find 結果
    const foundCalc = calculatorModules.find(m => m.id === calcId);

    // 守衛子句：如果找不到就中斷，這會讓 TS 知道後續的 calcMetadata 絕對存在
    if (!foundCalc) {
        if (calculatorCard) calculatorCard.innerHTML = '<h1>錯誤：找不到該計算機模組</h1>';
        return;
    }

    // 強制轉型確保 TS 認得 render 屬性
    const calcMetadata = foundCalc as CalculatorMetadata;

    async function initializeWithoutAuth() {
        try {
            // 修正：使用 const 宣告 client 以通過 Lint 檢查
            const client = await (async () => {
                const response = await fetch('./test-Patient.json');
                if (!response.ok) throw new Error('找不到 test-Patient.json');

                const bundle = await response.json();
                const patientEntry = bundle.entry.find(
                    (ent: any) => ent.resource.resourceType === 'Patient'
                );
                const patient = patientEntry.resource;

                return {
                    patient: { id: patient.id, read: () => Promise.resolve(patient) },
                    request: async () => bundle,
                    user: { read: () => Promise.reject('測試模式') }
                };
            })();

            if (patientInfoDiv) {
                displayPatientInfo(client, patientInfoDiv);
            }

            // 渲染計算機內容
            if (calculatorCard) {
                calculatorCard.innerHTML = '';

                // 解決 'Property render does not exist'：現在 TS 知道它存在了
                if (calcMetadata.render) {
                    calcMetadata.render(calculatorCard, client);
                } else {
                    calculatorCard.innerHTML = `<h2>${calcMetadata.title}</h2><p>此計算機尚未實作渲染邏輯。</p>`;
                }
            }
        } catch (error) {
            console.error('初始化失敗:', error);
            if (calculatorCard) {
                calculatorCard.innerHTML = `<b style="color:red">無法載入測試資料，請確認 test-Patient.json 位於正確路徑。</b>`;
            }
        }
    }

    await initializeWithoutAuth();
};
