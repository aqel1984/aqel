'use client';

import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CurrencyData {
  [key: string]: {
    amount: number;
    percentage: number;
  };
}

interface CurrencyDistributionProps {
  data: CurrencyData;
}

export function CurrencyDistribution({ data }: CurrencyDistributionProps) {
  const chartRef = useRef<ChartJS<"doughnut", number[], string>>();

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      return;
    }
  }, [data]);

  if (!data || Object.keys(data).length === 0) {
    return <div>No currency data available</div>;
  }

  const currencies = Object.keys(data);
  const percentages = currencies.map(currency => data[currency]?.percentage || 0);
  const amounts = currencies.map(currency => data[currency]?.amount || 0);

  const chartData: ChartData<'doughnut', number[], string> = {
    labels: currencies,
    datasets: [
      {
        data: percentages,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const currency = currencies[index] || '';
            const amount = amounts[index] || 0;
            const percentage = percentages[index] || 0;
            return `${currency}: ${amount.toFixed(2)} (${percentage.toFixed(2)}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <Doughnut
        ref={chartRef}
        data={chartData}
        options={options}
      />
    </div>
  );
}
