import React, { useState, useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import {
  Clock01Icon,
  Search01Icon,
  Download01Icon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Exchange01Icon,
  Delete02Icon,
  RepeatIcon,
  RotateLeft01Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import Swal from 'sweetalert2';

interface HistoryViewProps {
  onOpenExportPdf: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onOpenExportPdf }) => {
  const { state, deleteTransaction, exportData } = useApp();
  const lang = state.settings.language;

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-[32px] neu-flat border border-white/60 dark:border-white/5">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">
            {getTranslation(lang, 'historyViewTitle')}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {getTranslation(lang, 'historyViewDesc')}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenExportPdf}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl neu-button text-red-600 dark:text-red-400 text-xs font-black transition"
          >
            <Download01Icon className="w-3.5 h-3.5" />
            <span>{getTranslation(lang, 'exportPdf')}</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl neu-button text-slate-700 dark:text-slate-300 text-xs font-bold transition"
          >
            <span>{getTranslation(lang, 'exportJson')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-5 sm:p-6 rounded-[32px] neu-flat border border-white/60 dark:border-white/5 space-y-4">

        {/* Search & Date Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <div className='flex justify-center items-center'>
            {
              [{ id: 'all', label: getTranslation(lang, 'all') },
              { id: 'income', label: getTranslation(lang, 'income') },
              { id: 'expense', label: getTranslation(lang, 'expense') },
              { id: 'transfer', label: getTranslation(lang, 'transfer') },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`relative mx-0.5 px-3 py-2 rounded-2xl text-xs font-black transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'neu-button text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="historyCategoryPill"
                        className="absolute inset-0 rounded-2xl neu-pressed"
                        transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })
            }
          </div>
        </LayoutGroup>
      </div>

      {/* Transactions List */}
      <div className="p-5 sm:p-7 rounded-[32px] neu-flat border border-white/60 dark:border-white/5">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-3xl neu-pressed flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Clock01Icon className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(lang, 'noTransactions')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {getTranslation(lang, 'noTransactionsFilterDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income' || tx.type === 'transfer_in';
              const isExpense = tx.type === 'expense';
              const pocketName = tx.pocketId ? pocketsMap.get(tx.pocketId) : null;

              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl neu-flat-sm hover:neu-pressed transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center flex-shrink-0 ${
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {tx.description}
                        </span>
                        {pocketName && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full neu-pressed text-sky-600 dark:text-sky-400">
                            {pocketName}
                          </span>
                        )}
                        {tx.recurring && (
                          <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full neu-pressed text-purple-600 dark:text-purple-400">
                            <RepeatIcon className="w-2.5 h-2.5" />
                            {getTranslation(lang, 'recurringBadge')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {formatDate(tx.date, lang)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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

                    <button
                      onClick={() => handleDelete(tx.id, tx.description)}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-red-600 transition"
                      title={getTranslation(lang, 'delete')}
                    >
                      <Delete02Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
