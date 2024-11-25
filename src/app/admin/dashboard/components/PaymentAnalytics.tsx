'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PaymentData {
  date: string;
  amount: number;
  status: string;
}

export default function PaymentAnalytics() {
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch('/api/payment-analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch payment data');
      }
      const data = await response.json();
      setPaymentData(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: paymentData.map(d => d.date),
    datasets: [
      {
        label: 'Payment Amount',
        data: paymentData.map(d => d.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Payment Analytics'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (USD)'
        }
      }
    }
  };

  if (loading) {
    return <div>Loading payment analytics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4">Payment Analytics</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
