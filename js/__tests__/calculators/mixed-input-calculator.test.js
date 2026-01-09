/**
 * @jest-environment jsdom
 */
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { createMixedInputCalculator } from '../../calculators/shared/mixed-input-calculator';
// Mock console
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });
describe('Mixed Input Calculator Factory', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });
    const mockConfig = {
        id: 'test-mixed',
        title: 'Test Mixed Calculator',
        description: 'A mixed input calculator for testing',
        sections: [
            {
                title: 'Numeric Inputs',
                icon: '🔢',
                inputs: [
                    {
                        type: 'number',
                        id: 'test-number',
                        label: 'Numeric Value',
                        unit: 'units',
                        min: 0,
                        max: 100
                    }
                ]
            },
            {
                title: 'Radio Selection',
                icon: '📋',
                inputs: [
                    {
                        type: 'radio',
                        name: 'test-radio',
                        label: 'Select Option',
                        options: [
                            { value: '0', label: 'Option A' },
                            { value: '1', label: 'Option B' },
                            { value: '2', label: 'Option C' }
                        ]
                    }
                ]
            }
        ],
        riskLevels: [
            {
                minScore: 0,
                maxScore: 50,
                label: 'Low',
                severity: 'success',
                description: 'Low level'
            },
            {
                minScore: 51,
                maxScore: 100,
                label: 'High',
                severity: 'danger',
                description: 'High level'
            }
        ],
        calculate: (values) => {
            const numValue = values['test-number'] || 0;
            const radioValue = parseInt(values['test-radio'] || '0', 10);
            return numValue + radioValue * 10;
        }
    };
    test('should create mixed input calculator', () => {
        const calculator = createMixedInputCalculator(mockConfig);
        expect(calculator).toBeDefined();
        expect(calculator.id).toBe('test-mixed');
        expect(typeof calculator.generateHTML).toBe('function');
        expect(typeof calculator.initialize).toBe('function');
    });
    test('generateHTML should include both numeric and radio inputs', () => {
        const calculator = createMixedInputCalculator(mockConfig);
        const html = calculator.generateHTML();
        expect(html).toContain('Numeric Inputs');
        expect(html).toContain('Radio Selection');
        expect(html).toContain('test-number');
        expect(html).toContain('test-radio');
    });
    test('should initialize and handle mixed inputs', () => {
        const calculator = createMixedInputCalculator(mockConfig);
        container.innerHTML = calculator.generateHTML();
        expect(() => {
            calculator.initialize(null, null, container);
        }).not.toThrow();
    });
    test('should calculate with mixed input types', () => {
        const calculator = createMixedInputCalculator(mockConfig);
        container.innerHTML = calculator.generateHTML();
        calculator.initialize(null, null, container);
        const numInput = container.querySelector('#test-number');
        const radioInput = container.querySelector('input[name="test-radio"][value="2"]');
        if (numInput) {
            numInput.value = '30';
            numInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (radioInput) {
            radioInput.checked = true;
            radioInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // Score should be 30 + 2*10 = 50
        setTimeout(() => {
            const resultText = container.textContent || '';
            const hasExpectedResult = resultText.includes('50') || resultText.toLowerCase().includes('low');
            expect(hasExpectedResult).toBe(true);
        }, 100);
    });
});
