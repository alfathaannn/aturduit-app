import React from 'react';
import {
  Wallet01Icon,
  ArrowDownLeft01Icon,
  Edit02Icon,
  Delete02Icon,
  Add01Icon,
  Cancel01Icon,
} from 'hugeicons-react';
import { Pocket } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getTranslation, translations } from '../../utils/translations';
import Swal from 'sweetalert2';

interface PocketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocket: Pocket | null;
  onEdit: (pocket: Pocket) => void;
  onAllocate: (pocketId: string) => void;
}

export const PocketDetailModal: React.FC<PocketDetailModalProps> = ({
  isOpen,
  onClose,
  pocket,
  onEdit,
  onAllocate,
}) => {
  const { state, deletePocket } = useApp();
  const lang = state.settings.language;

  if (!isOpen || !pocket) return null;

  const pocketTransactions = state.transactions.filter(
    (t) => t.pocketId === pocket.id && t.type === 'expense'
  );

  const totalExpense = pocketTransactions.reduce((sum, t) => sum + t.amount, 0);

  const percentage = pocket.target > 0
    ? Math.min(100, Math.round((pocket.balance / pocket.target) * 100))
    : null;

  const handleDelete = () => {
    const formattedBalance = formatCurrency(pocket.balance);
    const desc = pocket.balance > 0
      ? translations[lang].confirmDeletePocketDescRefund(pocket.name, formattedBalance)
      : translations[lang].confirmDeletePocketDescEmpty;

    Swal.fire({
      title: `${getTranslation(lang, 'confirmDeletePocketTitle')} (${pocket.name})`,
      text: desc,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: getTranslation(lang, 'yesDelete'),
      cancelButtonText: getTranslation(lang, 'cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        deletePocket(pocket.id);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: getTranslation(lang, 'pocketDeleted'),
          showConfirmButton: false,
          timer: 2000,
        });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in-up font-sans">
      <div className="relative w-full max-w-lg rounded-[32px] neu-flat border border-white/60 dark:border-white/5 p-6 sm:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center text-sky-500">
              <Wallet01Icon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                {pocket.name}
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                {getTranslation(lang, 'pocketDetail')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {/* Balance card */}
          <div className="p-5 rounded-2xl neu-pressed">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {getTranslation(lang, 'currentBalance')}
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(pocket.balance)}
            </p>

            {pocket.target > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
                <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-300">
                  <span>{getTranslation(lang, 'saveTarget')}: {formatCurrency(pocket.target)}</span>
                  <span className="text-sky-600 dark:text-sky-400 font-black">{percentage}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full neu-flat overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onAllocate(pocket.id);
              }}
              className="flex-1 py-3 px-3 rounded-2xl neu-button text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Add01Icon className="w-4 h-4" />
              <span>{getTranslation(lang, 'fillBalance')}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(pocket);
              }}
              className="py-3 px-4 rounded-2xl neu-button text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Edit02Icon className="w-4 h-4" />
              <span>{getTranslation(lang, 'editPocket')}</span>
            </button>
            <button
              onClick={handleDelete}
              className="py-3 px-4 rounded-2xl neu-button text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              title={getTranslation(lang, 'delete')}
            >
              <Delete02Icon className="w-4 h-4" />
            </button>
          </div>

          {/* Expense history under this pocket */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {getTranslation(lang, 'pocketExpensesTitle')} ({pocketTransactions.length})
              </h4>
              <span className="text-xs font-black text-red-600 dark:text-red-400">
                {formatCurrency(totalExpense)}
              </span>
            </div>

            {pocketTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-medium">
                {getTranslation(lang, 'noExpensesInPocket')}
              </p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {pocketTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl neu-flat-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl neu-pressed flex items-center justify-center text-red-500">
                        <ArrowDownLeft01Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatDate(tx.date, lang)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-red-600 dark:text-red-400">
                      -{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 neu-button"
          >
            {getTranslation(lang, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
