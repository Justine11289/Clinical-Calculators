import { calculatorModules } from './calculators/index.js';
import { displayPatientInfo } from './utils.js';

window.onload = async () => {
    const patientInfoDiv = document.getElementById('patient-info') as HTMLElement;
    const calculatorContainer = document.getElementById('calculator-container') as HTMLElement;

    const urlParams = new URLSearchParams(window.location.search);
    const calcId = urlParams.get('id');

    if (!calcId) {
        if (calculatorContainer) calculatorContainer.innerHTML = '<h1>錯誤：未指定計算機 ID</h1>';
        return;
    }

    const calcMetadata = calculatorModules.find(m => m.id === calcId);
    if (!calcMetadata) {
        if (calculatorContainer)
            calculatorContainer.innerHTML = '<h1>錯誤：找不到該計算機模組</h1>';
        return;
    }

    async function initializeCalculator() {
        try {
            // 修正：使用 const 配合立即執行函式，避免 Lint 報錯 'prefer-const'
            const client = await (async () => {
                // 確保路徑指向根目錄的 test-Patient.json
                const response = await fetch('./test-Patient.json');
                const bundle = await response.json();

                // 從 Bundle 中尋找病人資源
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

            if (client && patientInfoDiv) {
                displayPatientInfo(client, patientInfoDiv);
            }
        } catch (error) {
            console.error('初始化失敗:', error);
            if (patientInfoDiv) {
                patientInfoDiv.innerHTML = `<b style="color:red">無法載入資料，請確認 test-Patient.json 是否存在。</b>`;
            }
        }
    }

    await initializeCalculator();
};
