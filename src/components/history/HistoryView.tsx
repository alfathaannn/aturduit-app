import React, { useState, useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import {
  Clock01Icon,
  Search01Icon,
  Download01Icon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  ArrowRight01Icon,
  Exchange01Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { TransactionActionModal } from '../modals/TransactionActionModal';
import Swal from 'sweetalert2';

interface HistoryViewProps {
  onOpenExportPdf: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onOpenExportPdf }) => {
  const { state, deleteTransaction, voidTransaction, exportData } = useApp();
  const lang = state.settings.language;

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const pocketsMap = useMemo(() => {
    const map = new Map<string, string>();
    state.pockets.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [state.pockets]);

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      // 1. Tab Filter
      if (activeTab === 'income' && tx.type !== 'income') return false;
      if (activeTab === 'expense' && tx.type !== 'expense') return false;
      if (activeTab === 'transfer' && tx.type !== 'transfer_out' && tx.type !== 'transfer_in') return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const pocketName = tx.pocketId ? (pocketsMap.get(tx.pocketId) || '') : '';
        const matchDesc = tx.description.toLowerCase().includes(query);
        const matchPocket = pocketName.toLowerCase().includes(query);
        const matchAmount = tx.amount.toString().includes(query);
        if (!matchDesc && !matchPocket && !matchAmount) return false;
      }

      // 3. Date filter
      if (dateFilter) {
        const txDate = tx.date.slice(0, 10);
        if (txDate !== dateFilter) return false;
      }

      return true;
    });
  }, [state.transactions, activeTab, searchQuery, dateFilter, pocketsMap]);

  const handleDelete = (id: string, desc: string) => {
    Swal.fire({
      title: getTranslation(lang, 'confirmDeleteTxTitle'),
      text: desc,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: getTranslation(lang, 'yesDelete'),
      cancelButtonText: getTranslation(lang, 'cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTransaction(id);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: getTranslation(lang, 'transactionDeleted'),
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-fade-in-up font-sans">
      {/* Compact Header Bar (Mobile-First) */}
      <div className="p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] neu-flat border border-white/60 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-white leading-tight">
              {getTranslation(lang, 'historyViewTitle')}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-snug">
              {getTranslation(lang, 'historyViewDesc')}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExportPdf}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl neu-button text-red-600 dark:text-red-400 text-[11px] sm:text-xs font-black transition active:scale-95"
          >
            <Download01Icon className="w-3.5 h-3.5" />
            <span>{getTranslation(lang, 'exportPdf')}</span>
          </button>
          <button
            onClick={exportData}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl neu-button text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-bold transition active:scale-95"
          >
            <span>{getTranslation(lang, 'exportJson')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-3.5 sm:p-5 rounded-[26px] sm:rounded-[32px] neu-flat border border-white/60 dark:border-white/5 space-y-3">
        {/* Search & Date Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 relative neu-pressed rounded-2xl px-3.5 py-2 flex items-center gap-2">
            <Search01Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={getTranslation(lang, 'searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="w-full">
            <CustomDatePicker
              value={dateFilter}
              onChange={setDateFilter}
              lang={lang}
              placeholder={getTranslation(lang, 'pickDate')}
              onClear={() => setDateFilter('')}
            />
          </div>
        </div>

        <LayoutGroup id="historyTabs">
          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl neu-pressed">
            {[
              { id: 'all', label: getTranslation(lang, 'all') },
              { id: 'income', label: getTranslation(lang, 'income') },
              { id: 'expense', label: getTranslation(lang, 'expense') },
              { id: 'transfer', label: getTranslation(lang, 'transfer') },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-black transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="historyCategoryPill"
                      className="absolute inset-0 rounded-xl neu-button"
                      transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* Transactions List - Clean Single-Container Divided Rows */}
      <div className="rounded-[28px] sm:rounded-[32px] neu-flat border border-white/60 dark:border-white/5 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl neu-pressed flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Clock01Icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(lang, 'noTransactions')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {getTranslation(lang, 'noTransactionsFilterDesc')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income' || tx.type === 'transfer_in';
              const isExpense = tx.type === 'expense';
              const pocketName = tx.pocketId ? pocketsMap.get(tx.pocketId) : null;

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className={`flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 transition-colors cursor-pointer active:bg-slate-200/40 dark:active:bg-slate-800/40 ${
                    tx.voided ? 'opacity-60' : 'hover:bg-white/30 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Left: Icon + Title + Meta */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl neu-pressed flex items-center justify-center flex-shrink-0 ${
                        tx.voided
                          ? 'text-slate-400'
                          : isIncome
                          ? 'text-emerald-500'
                          : isExpense
                          ? 'text-red-500'
                          : 'text-blue-500'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft01Icon className="w-4 h-4" />
                      ) : isExpense ? (
                        <ArrowUpRight01Icon className="w-4 h-4" />
                      ) : (
                        <Exchange01Icon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[13px] sm:text-sm font-bold leading-snug break-words ${
                            tx.voided
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-white'
                          }`}
                        >
                          {tx.description}
                        </span>
                        {tx.voided && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full neu-pressed text-amber-600 dark:text-amber-400 flex-shrink-0">
                            {getTranslation(lang, 'voidedBadge')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium flex-wrap">
                        <span className="whitespace-nowrap">{formatShortDate(tx.date, lang)}</span>
                        {pocketName && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-sky-600 dark:text-sky-400 break-words">
                              {pocketName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount + Subtle Tap Indicator */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[13px] sm:text-sm font-black whitespace-nowrap ${
                        tx.voided
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isExpense
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <ArrowRight01Icon className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Action Modal (Detail, Void & Delete) */}
      <TransactionActionModal
        transaction={selectedTx}
        transactions={state.transactions}
        pockets={state.pockets}
        lang={lang}
        onClose={() => setSelectedTx(null)}
        onVoid={voidTransaction}
        onDelete={handleDelete}
      />
    </div>
  );
};
