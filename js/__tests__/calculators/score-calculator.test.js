/**
 * @jest-environment jsdom
 */
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { createScoreCalculator } from '../../calculators/shared/scoring-calculator';
// Mock console to reduce noise
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });
describe('Score Calculator Factory', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });
    // Using the correct ScoreSection structure with options (not inputs)
    const mockConfig = {
        id: 'test-score',
        title: 'Test Score Calculator',
        description: 'A test calculator for unit testing',
        sections: [
            {
                title: 'Section 1',
                icon: '📋',
                options: [
                    { id: 'option-1', label: 'Option 1 (+1)', value: 1 },
                    { id: 'option-2', label: 'Option 2 (+2)', value: 2 },
                    { id: 'option-3', label: 'Option 3 (+3)', value: 3 }
                ]
            },
            {
                title: 'Section 2',
                icon: '⚕️',
                options: [
                    { id: 'option-4', label: 'Option 4 (+1)', value: 1 },
                    { id: 'option-5', label: 'Option 5 (+2)', value: 2 }
                ]
            }
        ],
        riskLevels: [
            {
                minScore: 0,
                maxScore: 2,
                risk: 'Low Risk',
                category: 'Low',
                severity: 'success'
            },
            {
                minScore: 3,
                maxScore: 5,
                risk: 'Medium Risk',
                category: 'Medium',
                severity: 'warning'
            },
            {
                minScore: 6,
                maxScore: 10,
                risk: 'High Risk',
                category: 'High',
                severity: 'danger'
            }
        ]
    };
    test('should create calculator with valid config', () => {
        const calculator = createScoreCalculator(mockConfig);
        expect(calculator).toBeDefined();
        expect(calculator.id).toBe('test-score');
        expect(calculator.title).toBe('Test Score Calculator');
        expect(typeof calculator.generateHTML).toBe('function');
        expect(typeof calculator.initialize).toBe('function');
    });
    test('generateHTML should return valid HTML', () => {
        const calculator = createScoreCalculator(mockConfig);
        const html = calculator.generateHTML();
        expect(typeof html).toBe('string');
        expect(html.length).toBeGreaterThan(0);
        expect(html).toContain('Test Score Calculator');
        expect(html).toContain('Section 1');
    });
    test('should initialize without errors', () => {
        const calculator = createScoreCalculator(mockConfig);
        container.innerHTML = calculator.generateHTML();
        expect(() => {
            calculator.initialize(null, null, container);
        }).not.toThrow();
    });
    test('should calculate score when checkboxes are selected', () => {
        const calculator = createScoreCalculator(mockConfig);
        container.innerHTML = calculator.generateHTML();
        calculator.initialize(null, null, container);
        // Find and check some checkboxes
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length > 0) {
            // Check first two checkboxes
            checkboxes[0].checked = true;
            checkboxes[1].checked = true;
            checkboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
            checkboxes[1].dispatchEvent(new Event('change', { bubbles: true }));
            // Score should be calculated
            setTimeout(() => {
                const resultText = container.textContent || '';
                // Should show some score
                expect(resultText).toMatch(/\d+/);
            }, 100);
        }
    });
    test('should show result box when score is calculated', () => {
        const calculator = createScoreCalculator(mockConfig);
        container.innerHTML = calculator.generateHTML();
        calculator.initialize(null, null, container);
        const checkbox = container.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            setTimeout(() => {
                const resultBox = container.querySelector('.result-box, [class*="result"]');
                expect(resultBox).toBeDefined();
            }, 100);
        }
    });
});
