// src/theme-toggle.ts
/**
 * Theme Toggle - 主題切換功能
 * 支持淺色/深色主題切換，並保存使用者偏好
 */

type ThemeType = 'tech' | 'light';

interface IThemeManager {
    STORAGE_KEY: string;
    DARK_THEME: ThemeType;
    LIGHT_THEME: ThemeType;
    init(): void;
    loadTheme(): void;
    setTheme(theme: ThemeType): void;
    toggleTheme(): void;
    updateToggleIcon(icon: string): void;
    bindToggleButton(): void;
    watchSystemTheme(): void;
    getCurrentTheme(): ThemeType;
}

const ThemeManager: IThemeManager = {
    STORAGE_KEY: 'medcalc-theme',
    DARK_THEME: 'tech',
    LIGHT_THEME: 'light',

    /**
     * 初始化主題管理器
     */
    init(): void {
        // 載入保存的主題偏好
        this.loadTheme();

        // 綁定切換按鈕事件
        this.bindToggleButton();

        // 監聽系統主題變化
        this.watchSystemTheme();
    },

    /**
     * 載入已保存的主題或系統偏好
     */
    loadTheme(): void {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeType | null;

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // 如果沒有保存的偏好，檢查系統設定
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? this.DARK_THEME : this.LIGHT_THEME);
        }
    },

    /**
     * 設置主題
     * @param theme - 主題名稱 ('tech' 或 'light')
     */
    setTheme(theme: ThemeType): void {
        const html = document.documentElement;
        const body = document.body;

        if (theme === this.DARK_THEME) {
            html.setAttribute('data-theme', 'tech');
            body.classList.add('tech-theme');
            this.updateToggleIcon('☀️');
        } else {
            html.removeAttribute('data-theme');
            body.classList.remove('tech-theme');
            this.updateToggleIcon('🌙');
        }

        // 保存到 localStorage
        localStorage.setItem(this.STORAGE_KEY, theme);
    },

    /**
     * 切換主題
     */
    toggleTheme(): void {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme: ThemeType = currentTheme === 'tech' ? this.LIGHT_THEME : this.DARK_THEME;
        this.setTheme(newTheme);
    },

    /**
     * 更新切換按鈕圖示
     * @param icon - 圖示 emoji
     */
    updateToggleIcon(icon: string): void {
        const iconElement = document.querySelector('.theme-icon');
        if (iconElement) {
            iconElement.textContent = icon;
        }
    },

    /**
     * 綁定切換按鈕事件
     */
    bindToggleButton(): void {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },

    /**
     * 監聽系統主題變化
     */
    watchSystemTheme(): void {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (e: MediaQueryListEvent) => {
            // 只有在使用者沒有手動設定主題時才跟隨系統
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);
            if (!savedTheme) {
                this.setTheme(e.matches ? this.DARK_THEME : this.LIGHT_THEME);
            }
        });
    },

    /**
     * 獲取當前主題
     * @returns 當前主題名稱
     */
    getCurrentTheme(): ThemeType {
        const theme = document.documentElement.getAttribute('data-theme');
        return theme === 'tech' ? this.DARK_THEME : this.LIGHT_THEME;
    }
};

// 當 DOM 載入完成時初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

// 導出以供其他模組使用
export { ThemeManager };
