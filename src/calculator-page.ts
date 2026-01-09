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
                ready(): Promise<FHIRClient>;
            };
        };
    }
}

interface FHIRClient {
    patient: {
        read(): Promise<Patient>;
    };
}

interface Patient {
    id: string;
    name?: Array<{
        given?: string[];
        family?: string;
        text?: string;
    }>;
}

// Cache version - increment this when you update calculators to force reload
window.CACHE_VERSION = '1.0.5';

/**
 * Show loading indicator
 */
function showLoading(element: HTMLElement): void {
    element.innerHTML = `
        <div class="loading-container" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            min-height: 200px;
        ">
            <div class="loading-spinner" style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            "></div>
            <p style="margin-top: 20px; color: #666; font-size: 0.95em;">Loading calculator...</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
}

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const calculatorId = params.get('name');

    const patientInfoDiv = document.getElementById('patient-info');
    const container = document.getElementById('calculator-container');
    const pageTitle = document.getElementById('page-title');

    if (!patientInfoDiv || !container || !pageTitle) {
        console.error('Required DOM elements not found');
        return;
    }

    if (!calculatorId) {
        container.innerHTML = '<h2>No calculator specified.</h2>';
        return;
    }

    // Find metadata for title
    const calculatorInfo = getCalculatorMetadata(calculatorId);

    if (!calculatorInfo) {
        container.innerHTML = `<h2>Calculator "${calculatorId}" not found.</h2>`;
        return;
    }

    // Set page title immediately from metadata
    pageTitle.textContent = calculatorInfo.title;
    const card = document.createElement('div');
    card.className = 'calculator-card';
    container.appendChild(card);

    // 記錄最近使用和使用統計
    favoritesManager.addToRecent(calculatorId);
    favoritesManager.trackUsage(calculatorId);

    // Show loading indicator
    showLoading(card);

    const loadCalculatorModule = async (): Promise<void> => {
        try {
            // Use the new loadCalculator function from index.js
            const calculator = (await loadCalculator(calculatorId)) as CalculatorModule;

            if (!calculator || typeof calculator.generateHTML !== 'function') {
                throw new Error('Invalid calculator module structure.');
            }

            card.innerHTML = calculator.generateHTML();

            // 初始化計算器的輔助函數
            const initializeCalculator = (
                client: FHIRClient | null,
                patient: Patient | null
            ): void => {
                if (typeof calculator.initialize === 'function') {
                    try {
                        calculator.initialize(client, patient, card);
                    } catch (initError) {
                        console.error('Error during calculator initialization:', initError);
                        card.innerHTML =
                            '<div class="error-box">An error occurred while initializing this calculator.</div>';
                    }
                }
            };

            window.FHIR.oauth2
                .ready()
                .then((client: FHIRClient) => {
                    displayPatientInfo(client, patientInfoDiv).then((patient: Patient | null) => {
                        initializeCalculator(client, patient);
                    });
                })
                .catch((error: Error) => {
                    console.error(error);
                    patientInfoDiv.innerText =
                        'No patient data available. Please launch from the EHR.';
                    // 即使沒有 FHIR 客戶端，也要初始化計算器（讓用戶可以手動輸入）
                    initializeCalculator(null, null);
                });
        } catch (error) {
            console.error(`Failed to load calculator module: ${calculatorId}`, error);
            displayError(card, error as Error, 'This calculator is temporarily unavailable. Please try again later or contact support.');
        }
    };

    loadCalculatorModule();
};
