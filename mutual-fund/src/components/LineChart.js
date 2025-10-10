// components/LineChart.js (UPDATED for Comparison)
'use client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define a separate function to generate datasets to handle both single and multi-fund comparison
const generateDatasets = (data, title, color) => {
    // If 'data' is an array of chart datasets (for comparison)
    if (data.length > 0 && data[0].hasOwnProperty('label')) {
        return data.map(dataset => ({
            ...dataset,
            pointRadius: 0,
            tension: 0.2,
            fill: false, // No fill for comparison
        }));
    }
    
    // If 'data' is for a single fund (standard NAV or SIP chart)
    return [{
        label: title,
        data: data.map(d => d.value),
        borderColor: color,
        backgroundColor: color + '40',
        pointRadius: 0,
        tension: 0.2,
        fill: true,
    }];
};

export default function LineChart({ data, title, color = '#3b82f6', isComparison = false, customLabels = null }) {
    
    const datasets = generateDatasets(data, title, color);

    const chartData = {
        labels: isComparison ? customLabels : data.map(d => d.date),
        datasets: datasets,
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: isComparison, // Show legend only in comparison view
                position: 'top',
                labels: {
                    color: '#e5e7eb', // Light text color for dark theme
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                display: true,
                grid: { display: false },
                ticks: {
                    maxTicksLimit: 10,
                    color: '#9ca3af',
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: isComparison ? 'NAV' : 'NAV (₹)',
                    color: '#9ca3af',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                     color: '#9ca3af',
                }
            },
        },
    };

    return (
        <div className="relative h-full" style={{ minHeight: isComparison ? '400px' : '384px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
}