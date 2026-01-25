import { displayPatientInfo } from './utils.js';
import {
    calculatorModules,
    categories,
    CalculatorMetadata,
    CategoryKey
} from './calculators/index.js';
import { favoritesManager } from './favorites.js';

type SortType = 'a-z' | 'z-a';

/**
 * 渲染計算機清單
 */
function renderCalculatorList(calculators: CalculatorMetadata[], container: HTMLElement): void {
    container.innerHTML = '';
    if (calculators.length === 0) {
        container.innerHTML = `<p class="no-results">找不到符合的計算機。</p>`;
        return;
    }

    calculators.forEach(calc => {
        const link = document.createElement('a');
        link.href = `calculator.html?id=${calc.id}`;
        link.className = 'list-item';
        link.innerHTML = `
            <div class="list-item-content">
                <span class="list-item-title">${calc.title}</span>
                ${calc.category ? `<span class="category-badge" data-category="${calc.category}">${categories[calc.category as CategoryKey] || calc.category}</span>` : ''}
            </div>
        `;

        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.innerHTML = favoritesManager.isFavorite(calc.id) ? '⭐' : '☆';
        favoriteBtn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            const isFav = favoritesManager.toggleFavorite(calc.id);
            favoriteBtn.innerHTML = isFav ? '⭐' : '☆';
        };
        link.appendChild(favoriteBtn);
        container.appendChild(link);
    });
}

window.onload = async () => {
    const patientInfoDiv = document.getElementById('patient-info') as HTMLElement;
    const calculatorListDiv = document.getElementById('calculator-list') as HTMLElement;
    const searchBar = document.getElementById('search-bar') as HTMLInputElement;
    const categorySelect = document.getElementById('category-select') as HTMLSelectElement;

    if (!patientInfoDiv || !calculatorListDiv || !searchBar) return;

    // 修正：這裡改用 const，因為在此版本中我們不打算重新賦值
    const currentSortType: SortType = 'a-z';
    let currentCategory: string = 'all';

    function updateDisplay(): void {
        const searchTerm = searchBar.value.toLowerCase();

        // 修正：這裡改用 const，因為它是 filter 的結果，宣告後未再更動
        const filtered = calculatorModules.filter(calc => {
            const matchesSearch = calc.title.toLowerCase().includes(searchTerm);
            const matchesCategory = currentCategory === 'all' || calc.category === currentCategory;
            return matchesSearch && matchesCategory;
        });

        if (currentSortType === 'a-z') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        renderCalculatorList(filtered, calculatorListDiv);
    }

    async function loadTestData() {
        patientInfoDiv.innerHTML = '正在載入測試資料...';
        try {
            const response = await fetch('./test-Patient.json');
            if (!response.ok) throw new Error(`無法讀取 JSON: ${response.status}`);

            const bundle = (await response.json()) as any;
            const patientEntry = bundle.entry.find(
                (e: any) => e.resource.resourceType === 'Patient'
            );
            const patientResource = patientEntry.resource;

            const mockClient = {
                patient: {
                    id: patientResource.id,
                    read: () => Promise.resolve(patientResource)
                },
                request: async () => bundle,
                user: { read: () => Promise.reject('測試模式') }
            };

            displayPatientInfo(mockClient, patientInfoDiv);
        } catch (error) {
            console.error('資料載入失敗:', error);
            patientInfoDiv.innerHTML = `<b style="color:red">錯誤：無法讀取測試資料。</b>`;
        }
    }

    if (categorySelect) {
        categorySelect.onchange = e => {
            currentCategory = (e.target as HTMLSelectElement).value;
            updateDisplay();
        };
    }

    searchBar.oninput = updateDisplay;
    await loadTestData();
    updateDisplay();
};
