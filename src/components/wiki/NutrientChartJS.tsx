"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface NutrientData {
    name: string;
    amount: number;
    unit: string;
    percentDV: number; // Daily Value percentage
}

interface NutrientChartJSProps {
    nutrients: NutrientData[];
}

export function NutrientChartJS({ nutrients }: NutrientChartJSProps) {
    // Prepare data for Chart.js
    const labels = nutrients.map(n => n.name);
    const percentages = nutrients.map(n => n.percentDV);

    const data = {
        labels,
        datasets: [
            {
                label: '일일 권장량 대비 (%)',
                data: percentages,
                backgroundColor: percentages.map(p =>
                    p >= 100
                        ? '#059669' // brand emerald-600 for >= 100%
                        : '#10b981' // brand emerald-500 for < 100%
                ),
                borderColor: percentages.map(p =>
                    p >= 100
                        ? '#047857' // brand-strong
                        : '#059669' // brand
                ),
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        indexAxis: 'y' as const, // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const nutrient = nutrients[context.dataIndex];
                        return [
                            `함량: ${nutrient.amount}${nutrient.unit}`,
                            `일일 권장량: ${nutrient.percentDV}%`
                        ];
                    },
                },
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 200, // Max 200% for visual consistency
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 13,
                        weight: 500,
                    },
                },
            },
        },
    };

    return (
        <div className="w-full" style={{ height: `${nutrients.length * 60}px`, minHeight: '300px' }}>
            <Bar data={data} options={options} />
        </div>
    );
}
