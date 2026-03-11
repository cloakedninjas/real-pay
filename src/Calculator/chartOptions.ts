import type { ChartOptions } from 'chart.js';

export const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Real salary over time'
        }
    },
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                display: true,
                text: 'Salary',
            }
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
                drawOnChartArea: false,
            },
            title: {
                display: true,
                text: 'Inflation (%)',
            }
        },
    }
};
