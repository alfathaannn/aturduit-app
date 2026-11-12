import React, { useState } from 'react';
import {
  CreditCardIcon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Exchange01Icon,
  FolderAddIcon,
  ArrowRight01Icon,
  AnalyticsUpIcon,
  Add01Icon,
  FilterHorizontalIcon,
  ArrowDown01Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatShortDate } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import { CashflowChart } from './CashflowChart';
import { ActiveTab, CashflowFilterConfig } from '../../types';
import { CashflowFilterModal } from '../modals/CashflowFilterModal';

interface DashboardViewProps {
  onOpenTransaction: (type: 'income' | 'expense') => void;
  onOpenAllocate: () => void;
  onOpenAddPocket: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTransaction,
  onOpenAllocate,
  onOpenAddPocket,
  onNavigateTab,
}) => {
  const { state, totalGlobalBalance, totalPocketsBalance, stats } = useApp();
  const lang = state.settings.language;
  const isDark = state.settings.darkMode;

  const [cashflowFilter, setCashflowFilter] = useState<CashflowFilterConfig>({ type: '6months' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const recentTransactions = state.transactions.slice(0, 5);

  const getFilterLabel = () => {
    switch (cashflowFilter.type) {
      case '7days':
        return getTranslation(lang, 'last7Days');
      case '1month':
        return getTranslation(lang, 'last1Month');
      case '6months':
        return getTranslation(lang, 'last6Months');
      case '1year':
        return getTranslation(lang, 'last1Year');
      case 'all':
        return getTranslation(lang, 'allTime');
      case 'custom':
        if (cashflowFilter.startDate && cashflowFilter.endDate) {
          return `${formatShortDate(cashflowFilter.startDate, lang)} - ${formatShortDate(cashflowFilter.endDate, lang)}`;
        }
        return getTranslation(lang, 'customRange');
      default:
        return getTranslation(lang, 'last6Months');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Hero Total Balance Card (Neomorphic Flat + Gradient Accent) */}
      <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-8 neu-flat border border-white/60 dark:border-white/5">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              {getTranslation(lang, 'totalBalance')}
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full neu-pressed text-sky-600 dark:text-sky-400">
              {state.pockets.length} {getTranslation(lang, 'pocketsCount')}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            {formatCurrency(totalGlobalBalance)}
          </h2>

          {/* Sub balances breakdown */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
            <div className="p-3.5 rounded-2xl neu-pressed">
              <p className="text-[11px] text-slate-400 font-semibold">
                {getTranslation(lang, 'mainBalance')}
              </p>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {formatCurrency(state.mainBalance)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl neu-pressed">
              <p className="text-[11px] text-slate-400 font-semibold">
                {getTranslation(lang, 'pocketsTotal')}
              </p>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {formatCurrency(totalPocketsBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Income & Expense Cards (Directly triggers Sheet) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Clickable Income Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenTransaction('income')}
          onKeyDown={(e) => e.key === 'Enter' && onOpenTransaction('income')}
          className="group p-5 rounded-[28px] neu-button cursor-pointer flex items-center justify-between transition-all select-none border border-transparent hover:border-emerald-500/30"
          title={getTranslation(lang, 'addIncome')}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{getTranslation(lang, 'income')}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full neu-pressed opacity-90 group-hover:opacity-100">
                + {getTranslation(lang, 'addIncome')}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatCurrency(stats.income)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl neu-pressed flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <ArrowDownLeft01Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Clickable Expense Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenTransaction('expense')}
          onKeyDown={(e) => e.key === 'Enter' && onOpenTransaction('expense')}
          className="group p-5 rounded-[28px] neu-button cursor-pointer flex items-center justify-between transition-all select-none border border-transparent hover:border-red-500/30"
          title={getTranslation(lang, 'addExpense')}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{getTranslation(lang, 'expense')}</span>
              <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded-full neu-pressed opacity-90 group-hover:opacity-100">
                + {getTranslation(lang, 'addExpense')}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1">
              -{formatCurrency(stats.expense)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl neu-pressed flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <ArrowUpRight01Icon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Simplified Management Actions (Aksi Cepat text taken out!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onOpenAllocate}
          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl neu-button text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <div className="w-8 h-8 rounded-xl neu-pressed flex items-center justify-center text-blue-500">
            <Exchange01Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">
            {getTranslation(lang, 'transferToPocket')}
          </span>
        </button>

        <button
          onClick={onOpenAddPocket}
          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl neu-button text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition"
        >
          <div className="w-8 h-8 rounded-xl neu-pressed flex items-center justify-center text-sky-500">
            <FolderAddIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">
            {getTranslation(lang, 'addPocket')}
          </span>
        </button>
      </div>

      {/* Cash Flow Chart (Neomorphic Card) */}
      <div className="p-5 sm:p-6 rounded-[32px] neu-flat border border-white/60 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {getTranslation(lang, 'cashFlow')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-button text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 transition active:scale-95 cursor-pointer"
            title={getTranslation(lang, 'filterCashFlow')}
          >
            <FilterHorizontalIcon className="w-3.5 h-3.5" />
            <span>{getFilterLabel()}</span>
            <ArrowDown01Icon className="w-3 h-3 text-slate-400" />
          </button>
        </div>
        <CashflowChart
          transactions={state.transactions}
          filter={cashflowFilter}
          isDark={isDark}
          lang={lang}
        />
      </div>

      {/* Cash Flow Filter Modal */}
      <CashflowFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilter={cashflowFilter}
        onApply={setCashflowFilter}
      />

      {/* Recent Transactions List (Neomorphic Card) */}
      <div className="p-5 sm:p-6 rounded-[32px] neu-flat border border-white/60 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {getTranslation(lang, 'recentTransactions')}
          </h3>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>{getTranslation(lang, 'viewAll')}</span>
            <ArrowRight01Icon className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {getTranslation(lang, 'noTransactionsYet')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {getTranslation(lang, 'startTrackingPrompt')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income' || tx.type === 'transfer_in';
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl neu-flat-sm hover:neu-pressed transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl neu-pressed flex items-center justify-center flex-shrink-0 ${
                        isIncome
                          ? 'text-emerald-500'
                          : isExpense
                          ? 'text-red-500'
                          : 'text-blue-500'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft01Icon className="w-5 h-5" />
                      ) : isExpense ? (
                        <ArrowUpRight01Icon className="w-5 h-5" />
                      ) : (
                        <Exchange01Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(tx.date, lang)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-black ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isExpense
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
