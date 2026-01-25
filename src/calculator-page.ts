// src/calculator-page.ts
import { displayPatientInfo } from './utils.js';
import { loadCalculator, getCalculatorMetadata, CalculatorModule } from './calculators/index.js';
import { favoritesManager } from './favorites.js';
import { displayError } from './errorHandler.js';

declare global {
    interface Window {
        CACHE_VERSION: string;
        FHIR: {
            oauth2: {
                ready(): Promise<any>;
            };
        };
    }
}

// 快取版本號
window.CACHE_VERSION = '1.s1.1';

/**
 * 顯示載入中狀態
 */
function showLoading(element: HTMLElement): void {
    element.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading calculator and local test data...</p>
        </div>
    `;
}

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const calculatorId = params.get('id');
    const patientInfoDiv = document.getElementById('patient-info');
    const container = document.getElementById('calculator-container');
    const pageTitle = document.getElementById('page-title');

    if (!patientInfoDiv || !container || !pageTitle) {
        console.error('Required DOM elements not found');
        return;
    }

    if (!calculatorId) {
        container.innerHTML = '<h2>No calculator ID specified.</h2>';
        return;
    }

    const calculatorInfo = getCalculatorMetadata(calculatorId);
    if (!calculatorInfo) {
        container.innerHTML = `<h2>Calculator "${calculatorId}" not found.</h2>`;
        return;
    }

    pageTitle.textContent = calculatorInfo.title;
    const card = document.createElement('div');
    card.className = 'calculator-card';
    container.appendChild(card);

    favoritesManager.addToRecent(calculatorId);
    favoritesManager.trackUsage(calculatorId);

    // src/calculator-page.ts 關鍵片段修正
    const loadCalculatorModule = async () => {
        try {
            const calculator = await loadCalculator(calculatorId);
            card.innerHTML = calculator.generateHTML();

            // 修正：路徑改為 './test-Patient.json'
            const response = await fetch('./test-Patient.json');
            if (!response.ok) throw new Error('無法讀取測試資料檔案');

            const bundle = await response.json();
            const patient = bundle.entry.find(
                (e: any) => e.resource.resourceType === 'Patient'
            )?.resource;

            const mockClient = {
                patient: {
                    id: patient.id,
                    read: () => Promise.resolve(patient),
                    request: () => Promise.resolve(bundle)
                },
                request: () => Promise.resolve(bundle)
            };

            if (typeof calculator.initialize === 'function') {
                calculator.initialize(mockClient, patient, card);
                displayPatientInfo(mockClient, patientInfoDiv as HTMLElement);
            }
        } catch (error) {
            console.error(`初始化失敗: ${calculatorId}`, error);
        }
    };
    loadCalculatorModule();
};
