import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Transaction, CashflowFilterConfig } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Enforce Google Sans font 100% on Chart.js globally
ChartJS.defaults.font.family = "'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif";

interface CashflowChartProps {
  transactions: Transaction[];
  filter?: CashflowFilterConfig;
  isDark?: boolean;
  lang?: 'id' | 'en';
}

interface DataPoint {
  label: string;
  income: number;
  expense: number;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({
  transactions,
  filter = { type: '6months' },
  isDark = false,
  lang = 'id',
}) => {
  const monthNamesID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthNamesEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNames = lang === 'en' ? monthNamesEN : monthNamesID;

  const chartDataPoints = useMemo<DataPoint[]>(() => {
    const now = new Date();
    const filterType = filter.type;

    // 1. Last 7 Days
    if (filterType === '7days') {
      const points: DataPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);

        const weekday = d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
          weekday: 'short',
        });
        const label = `${weekday}, ${d.getDate()} ${monthNames[d.getMonth()]}`;

        const income = transactions
          .filter((t) => (t.type === 'income' || t.type === 'transfer_in') && t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter((t) => (t.type === 'expense' || t.type === 'transfer_out') && t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);

        points.push({ label, income, expense });
      }
      return points;
    }

    // 2. Last 1 Month (30 Days)
    if (filterType === '1month') {
      const points: DataPoint[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const label = `${d.getDate()} ${monthNames[d.getMonth()]}`;

        const income = transactions
          .filter((t) => (t.type === 'income' || t.type === 'transfer_in') && t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter((t) => (t.type === 'expense' || t.type === 'transfer_out') && t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);

        points.push({ label, income, expense });
      }
      return points;
    }

    // 3. Last 1 Year (12 Months)
    if (filterType === '1year') {
      const points: DataPoint[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const label = `${monthNames[m]} ${y.toString().slice(-2)}`;

        const income = transactions
          .filter((t) => {
            if (t.type !== 'income' && t.type !== 'transfer_in') return false;
            const tDate = new Date(t.date);
            return tDate.getFullYear() === y && tDate.getMonth() === m;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter((t) => {
            if (t.type !== 'expense' && t.type !== 'transfer_out') return false;
            const tDate = new Date(t.date);
            return tDate.getFullYear() === y && tDate.getMonth() === m;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        points.push({ label, income, expense });
      }
      return points;
    }

    // 4. All Time
    if (filterType === 'all') {
      if (transactions.length === 0) {
        // Fallback to last 6 months empty
        return Array.from({ length: 6 }).map((_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return {
            label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
            income: 0,
            expense: 0,
          };
        });
      }

      // Sort dates
      const sortedDates = transactions.map((t) => new Date(t.date).getTime()).sort((a, b) => a - b);
      const earliest = new Date(sortedDates[0]);
      const monthsSpan =
        (now.getFullYear() - earliest.getFullYear()) * 12 + (now.getMonth() - earliest.getMonth()) + 1;
      const count = Math.max(3, Math.min(monthsSpan, 36));

      const points: DataPoint[] = [];
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const label = `${monthNames[m]} ${y.toString().slice(-2)}`;

        const income = transactions
          .filter((t) => {
            if (t.type !== 'income' && t.type !== 'transfer_in') return false;
            const tDate = new Date(t.date);
            return tDate.getFullYear() === y && tDate.getMonth() === m;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter((t) => {
            if (t.type !== 'expense' && t.type !== 'transfer_out') return false;
            const tDate = new Date(t.date);
            return tDate.getFullYear() === y && tDate.getMonth() === m;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        points.push({ label, income, expense });
      }
      return points;
    }

    // 5. Custom Date Range
    if (filterType === 'custom' && filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);

      // If invalid, fallback
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return [];
      }

      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // If <= 31 days, group by day
      if (diffDays <= 31) {
        const points: DataPoint[] = [];
        const current = new Date(start);
        while (current <= end) {
          const dateStr = current.toISOString().slice(0, 10);
          const label = `${current.getDate()} ${monthNames[current.getMonth()]}`;

          const income = transactions
            .filter((t) => (t.type === 'income' || t.type === 'transfer_in') && t.date === dateStr)
            .reduce((sum, t) => sum + t.amount, 0);

          const expense = transactions
            .filter((t) => (t.type === 'expense' || t.type === 'transfer_out') && t.date === dateStr)
            .reduce((sum, t) => sum + t.amount, 0);

          points.push({ label, income, expense });
          current.setDate(current.getDate() + 1);
        }
        return points;
      }

      // If > 31 days, group by month
      const points: DataPoint[] = [];
      const current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= endMonth) {
        const y = current.getFullYear();
        const m = current.getMonth();
        const label = `${monthNames[m]} ${y.toString().slice(-2)}`;

        const income = transactions
          .filter((t) => {
            if (t.type !== 'income' && t.type !== 'transfer_in') return false;
            const tDate = new Date(t.date);
            return (
              tDate.getFullYear() === y &&
              tDate.getMonth() === m &&
              t.date >= filter.startDate! &&
              t.date <= filter.endDate!
            );
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter((t) => {
            if (t.type !== 'expense' && t.type !== 'transfer_out') return false;
            const tDate = new Date(t.date);
            return (
              tDate.getFullYear() === y &&
              tDate.getMonth() === m &&
              t.date >= filter.startDate! &&
              t.date <= filter.endDate!
            );
          })
          .reduce((sum, t) => sum + t.amount, 0);

        points.push({ label, income, expense });
        current.setMonth(current.getMonth() + 1);
      }
      return points;
    }

    // Default: Last 6 Months
    const points: DataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = `${monthNames[m]} ${y.toString().slice(-2)}`;

      const income = transactions
        .filter((t) => {
          if (t.type !== 'income' && t.type !== 'transfer_in') return false;
          const tDate = new Date(t.date);
          return tDate.getFullYear() === y && tDate.getMonth() === m;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter((t) => {
          if (t.type !== 'expense' && t.type !== 'transfer_out') return false;
          const tDate = new Date(t.date);
          return tDate.getFullYear() === y && tDate.getMonth() === m;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      points.push({ label, income, expense });
    }
    return points;
  }, [transactions, filter, lang]);

  const data = {
    labels: chartDataPoints.map((m) => m.label),
    datasets: [
      {
        label: getTranslation(lang, 'income'),
        data: chartDataPoints.map((m) => m.income),
        borderColor: '#10b981', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: chartDataPoints.length > 20 ? 2 : 4,
        pointHoverRadius: 6,
      },
      {
        label: getTranslation(lang, 'expense'),
        data: chartDataPoints.map((m) => m.expense),
        borderColor: '#ef4444', // Red 500
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#ef4444',
        pointRadius: chartDataPoints.length > 20 ? 2 : 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: "'Google Sans', sans-serif", size: 12 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        titleFont: { family: "'Google Sans', sans-serif", weight: 'bold' },
        bodyFont: { family: "'Google Sans', sans-serif" },
        callbacks: {
          label: (context) => {
            const val = context.raw as number;
            return ` ${context.dataset.label}: ${formatCurrency(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { family: "'Google Sans', sans-serif", size: 10 },
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.7)',
        },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { family: "'Google Sans', sans-serif", size: 11 },
          callback: (value) => {
            const num = Number(value);
            if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}M`;
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
            return num.toString();
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-64 sm:h-72 font-sans">
      <Line data={data} options={options} />
    </div>
  );
};
