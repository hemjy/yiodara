import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string;
    }[];
  };
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [{
              label: 'Donations',
              data: data.datasets[0].data,
              backgroundColor: '#BA24D5', // Exact purple color
              borderRadius: 0, // No border radius
              barThickness: 20, // Match the bar thickness in screenshot
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false // No legend
              },
              tooltip: {
                backgroundColor: '#333',
                titleColor: '#fff',
                bodyColor: '#fff',
                displayColors: false,
                callbacks: {
                  label: function(context) {
                    return `$${context.raw}`;
                  }
                }
              }
            },
            scales: {
              y: {
                border: {
                  display: false // No border on y-axis
                },
                beginAtZero: true,
                grid: {
                  color: '#EAECF0', // Light gray grid lines
                },
                ticks: {
                  padding: 10,
                  color: '#667085', // Gray color for ticks
                  callback: function(value) {
                    if (value === 0) return '$0';
                    if (value === 2000) return '$2k';
                    if (value === 4000) return '$4k';
                    if (value === 6000) return '$6k';
                    if (value === 8000) return '$8k';
                    if (value === 10000) return '$10k';
                    return '';
                  }
                }
              },
              x: {
                border: {
                  display: false // No border on x-axis
                },
                grid: {
                  display: false // No grid lines for x-axis
                },
                ticks: {
                  color: '#667085', // Gray color for ticks
                  padding: 5
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default BarChart;