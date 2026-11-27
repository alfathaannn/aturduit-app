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

/** Converts a Date or ISO timestamp into a local YYYY-MM-DD key. */
const toLocalDateKey = (input: Date | string): string => {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Parses a YYYY-MM-DD string as a local midnight Date (avoiding UTC day-shift). */
const parseLocalDate = (dateStr: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(dateStr);
};

const formatCompactAxis = (num: number): string => {
  if (num === 0) return '0';
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)}M`;
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)}jt`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return `${Number.isInteger(val) ? val : val.toFixed(0)}rb`;
  }
  return num.toString();
};

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
    // Exclude voided transactions and internal pocket transfers so cash flow reflects true income & expenses
    const cashflowTxs = transactions
      .filter((t) => !t.voided && (t.type === 'income' || t.type === 'expense'))
      .map((t) => ({ ...t, dateKey: toLocalDateKey(t.date) }))
      .filter((t) => t.dateKey !== '');

    const now = new Date();
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const filterType = filter.type;

    const aggregateDaily = (start: Date, end: Date, withWeekday = false): DataPoint[] => {
      const points: DataPoint[] = [];
      const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endLocal = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      while (cursor <= endLocal) {
        const key = toLocalDateKey(cursor);
        const baseLabel = `${cursor.getDate()} ${monthNames[cursor.getMonth()]}`;
        const label = withWeekday
          ? `${cursor.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' })}, ${baseLabel}`
          : baseLabel;

        let income = 0;
        let expense = 0;
        for (const t of cashflowTxs) {
          if (t.dateKey === key) {
            if (t.type === 'income') income += t.amount;
            else if (t.type === 'expense') expense += t.amount;
          }
        }
        points.push({ label, income, expense });
        cursor.setDate(cursor.getDate() + 1);
      }
      return points;
    };

    const aggregateMonthly = (
      startYear: number,
      startMonth: number,
      endYear: number,
      endMonth: number,
      minKey?: string,
      maxKey?: string
    ): DataPoint[] => {
      const points: DataPoint[] = [];
      const cursor = new Date(startYear, startMonth, 1);
      const endCursor = new Date(endYear, endMonth, 1);

      while (cursor <= endCursor) {
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = `${monthNames[m]} ${String(y).slice(-2)}`;

        let income = 0;
        let expense = 0;
        for (const t of cashflowTxs) {
          if (!t.dateKey.startsWith(monthPrefix)) continue;
          if (minKey && t.dateKey < minKey) continue;
          if (maxKey && t.dateKey > maxKey) continue;
          if (t.type === 'income') income += t.amount;
          else if (t.type === 'expense') expense += t.amount;
        }

        points.push({ label, income, expense });
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return points;
    };

    if (filterType === '7days') {
      const start = new Date(todayLocal);
      start.setDate(start.getDate() - 6);
      return aggregateDaily(start, todayLocal, true);
    }

    if (filterType === '1month') {
      const start = new Date(todayLocal);
      start.setDate(start.getDate() - 29);
      return aggregateDaily(start, todayLocal, false);
    }

    if (filterType === '1year') {
      const start = new Date(todayLocal.getFullYear(), todayLocal.getMonth() - 11, 1);
      return aggregateMonthly(
        start.getFullYear(),
        start.getMonth(),
        todayLocal.getFullYear(),
        todayLocal.getMonth()
      );
    }

    if (filterType === 'all') {
      if (cashflowTxs.length === 0) {
        const start = new Date(todayLocal.getFullYear(), todayLocal.getMonth() - 5, 1);
        return aggregateMonthly(
          start.getFullYear(),
          start.getMonth(),
          todayLocal.getFullYear(),
          todayLocal.getMonth()
        );
      }

      const sortedKeys = cashflowTxs.map((t) => t.dateKey).sort();
      const earliest = parseLocalDate(sortedKeys[0]);
      const latest = parseLocalDate(sortedKeys[sortedKeys.length - 1]);
      const endRef = latest > todayLocal ? latest : todayLocal;

      const diffDays =
        Math.round((endRef.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays <= 31) {
        const start = diffDays < 7
          ? new Date(endRef.getFullYear(), endRef.getMonth(), endRef.getDate() - 6)
          : earliest;
        return aggregateDaily(start, endRef, diffDays <= 7);
      }

      const monthsSpan =
        (endRef.getFullYear() - earliest.getFullYear()) * 12 +
        (endRef.getMonth() - earliest.getMonth()) +
        1;
      const clampedMonths = Math.min(monthsSpan, 36);
      const startMonth = new Date(endRef.getFullYear(), endRef.getMonth() - (clampedMonths - 1), 1);

      return aggregateMonthly(
        startMonth.getFullYear(),
        startMonth.getMonth(),
        endRef.getFullYear(),
        endRef.getMonth()
      );
    }

    if (filterType === 'custom' && filter.startDate && filter.endDate) {
      const start = parseLocalDate(filter.startDate);
      const end = parseLocalDate(filter.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return [];
      }

      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays <= 31) {
        return aggregateDaily(start, end, diffDays <= 7);
      }

      return aggregateMonthly(
        start.getFullYear(),
        start.getMonth(),
        end.getFullYear(),
        end.getMonth(),
        filter.startDate,
        filter.endDate
      );
    }

    // Default: Last 6 Months
    const start = new Date(todayLocal.getFullYear(), todayLocal.getMonth() - 5, 1);
    return aggregateMonthly(
      start.getFullYear(),
      start.getMonth(),
      todayLocal.getFullYear(),
      todayLocal.getMonth()
    );
  }, [transactions, filter, lang, monthNames]);

  const periodTotals = useMemo(() => {
    return chartDataPoints.reduce(
      (acc, p) => ({
        income: acc.income + p.income,
        expense: acc.expense + p.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [chartDataPoints]);

  const manyPoints = chartDataPoints.length > 15;

  const data = {
    labels: chartDataPoints.map((m) => m.label),
    datasets: [
      {
        label: getTranslation(lang, 'income'),
        data: chartDataPoints.map((m) => m.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 2.5,
        cubicInterpolationMode: 'monotone' as const,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: isDark ? '#191d24' : '#eef2f6',
        pointBorderWidth: 1.5,
        pointRadius: manyPoints ? 2 : 4,
        pointHoverRadius: 6,
      },
      {
        label: getTranslation(lang, 'expense'),
        data: chartDataPoints.map((m) => m.expense),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 2.5,
        cubicInterpolationMode: 'monotone' as const,
        fill: true,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: isDark ? '#191d24' : '#eef2f6',
        pointBorderWidth: 1.5,
        pointRadius: manyPoints ? 2 : 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        cornerRadius: 14,
        usePointStyle: true,
        titleFont: { family: "'Google Sans', sans-serif", weight: 'bold', size: 12 },
        bodyFont: { family: "'Google Sans', sans-serif", size: 11 },
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
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { family: "'Google Sans', sans-serif", size: 10, weight: 600 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.16)',
        },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { family: "'Google Sans', sans-serif", size: 10, weight: 600 },
          maxTicksLimit: 5,
          padding: 8,
          callback: (value) => formatCompactAxis(Number(value)),
        },
      },
    },
  };

  return (
    <div className="space-y-3.5 font-sans">
      {/* Clean Period Totals Summary Pills (Replaces bulky legend) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="px-3 py-2 rounded-2xl neu-pressed flex items-center gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 leading-none">
              {getTranslation(lang, 'income')}
            </p>
            <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(periodTotals.income)}
            </p>
          </div>
        </div>

        <div className="px-3 py-2 rounded-2xl neu-pressed flex items-center gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 leading-none">
              {getTranslation(lang, 'expense')}
            </p>
            <p className="text-xs sm:text-sm font-black text-red-600 dark:text-red-400 mt-1">
              {formatCurrency(periodTotals.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Line Chart Canvas */}
      <div className="w-full h-52 sm:h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
