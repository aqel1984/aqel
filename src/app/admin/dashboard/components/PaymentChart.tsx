'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TimeSeriesData } from '@/lib/services/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PaymentChartProps {
  data: TimeSeriesData[];
}

export default function PaymentChart({ data }: PaymentChartProps) {
  const chartData: ChartData<'line'> = {
    labels: data.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Payment Amount (USD)',
        data: data.map(item => item.amount),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Payment History',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] bg-white rounded-lg shadow-md p-4">
      <Line options={options} data={chartData} />
    </div>
  );
}
