import { uiBuilder } from '../../ui-builder.js';

interface CalculatorModule {
    id: string;
    title: string;
    description: string;
    generateHTML: () => string;
    initialize: (client: any, patient: any, container: HTMLElement) => void;
}

export const dueDate: CalculatorModule = {
    id: 'due-date',
    title: 'Pregnancy Due Dates Calculator',
    description:
        'Calculates pregnancy dates from last period, gestational age, or date of conception.',

    generateHTML: function () {
        return `
            <div class="calculator-header">
                <h3>${this.title}</h3>
                <p class="description">${this.description}</p>
            </div>

            ${uiBuilder.createSection({
                title: 'First Day of Last Menstrual Period (LMP)',
                content: uiBuilder.createInput({
                    id: 'lmp-date',
                    label: 'LMP Date',
                    type: 'date',
                    placeholder: 'YYYY-MM-DD'
                })
            })}

            ${uiBuilder.createResultBox({ id: 'due-date-result', title: 'Pregnancy Dating' })}
            
            ${uiBuilder.createAlert({
                type: 'info',
                message: `
                    <strong>Important Notes:</strong>
                    <ul class="info-list">
                        <li>Calculation assumes a 28-day cycle.</li>
                        <li>Actual due date may vary by ±2 weeks.</li>
                        <li>Ultrasound is more accurate for dating in the first trimester.</li>
                    </ul>
                `
            })}
        `;
    },

    initialize: function (client, patient, container) {
        uiBuilder.initializeComponents(container);

        const lmpInput = container.querySelector('#lmp-date') as HTMLInputElement;

        // Set default to today
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        lmpInput.value = todayStr;

        const calculate = () => {
            const lmpDateString = lmpInput.value;
            if (!lmpDateString) {
                return;
            }

            const [year, month, day] = lmpDateString.split('-').map(Number);
            const lmpDate = new Date(year, month - 1, day);

            const resultBox = container.querySelector('#due-date-result');
            if (isNaN(lmpDate.getTime())) {
                if (resultBox) {
                    resultBox.classList.remove('show');
                }
                return;
            }

            // EDD = LMP + 280 days
            const edd = new Date(lmpDate.getTime());
            edd.setDate(edd.getDate() + 280);

            // GA
            const now = new Date();
            const diffTime = now.getTime() - lmpDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            const weeks = Math.floor(diffDays / 7);
            const days = diffDays % 7;

            if (resultBox) {
                const resultContent = resultBox.querySelector('.ui-result-content');

                // Format EDD
                const options: Intl.DateTimeFormatOptions = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                };
                const eddStr = edd.toLocaleDateString(undefined, options);

                let alertType: 'info' | 'success' | 'danger' = 'info';
                let statusMessage = '';

                if (diffDays < 0) {
                    statusMessage = 'LMP is in the future.';
                    alertType = 'danger';
                } else if (diffDays > 294) {
                    // > 42 weeks
                    statusMessage = 'Post-term pregnancy (>42 weeks).';
                    alertType = 'danger';
                } else {
                    statusMessage = 'Normal pregnancy duration.';
                    alertType = 'success';
                }

                if (resultContent) {
                    resultContent.innerHTML = `
                        ${uiBuilder.createResultItem({
                            label: 'Estimated Due Date (EDD)',
                            value: eddStr,
                            unit: '',
                            alertClass: 'ui-alert-success'
                        })}
                        ${uiBuilder.createResultItem({
                            label: 'Gestational Age',
                            value: `${weeks} weeks, ${days} days`,
                            unit: '',
                            alertClass: `ui-alert-${alertType}`
                        })}
                        ${uiBuilder.createResultItem({
                            label: 'Days Remaining',
                            value: Math.max(0, 280 - diffDays).toString(),
                            unit: 'days'
                        })}
                        ${diffDays < 0 || diffDays > 294 ? uiBuilder.createAlert({ type: alertType, message: statusMessage }) : ''}
                    `;
                }
                resultBox.classList.add('show');
            }
        };

        lmpInput.addEventListener('input', calculate);
        calculate();
    }
};
