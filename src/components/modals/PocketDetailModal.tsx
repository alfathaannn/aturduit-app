import React from 'react';
import {
  Wallet01Icon,
  ArrowDownLeft01Icon,
  Edit02Icon,
  Delete02Icon,
  Add01Icon,
  Exchange01Icon,
  RotateLeft01Icon,
} from 'hugeicons-react';
import { Pocket } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { getTranslation, translations } from '../../utils/translations';
import { confirmAndVoidTransaction } from '../../utils/voidTransactionHelper';
import { BottomSheet } from '../ui/BottomSheet';
import Swal from 'sweetalert2';

interface PocketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocket: Pocket | null;
  onEdit: (pocket: Pocket) => void;
  onAllocate: (pocketId: string) => void;
  onTransfer: (pocketId: string) => void;
}

export const PocketDetailModal: React.FC<PocketDetailModalProps> = ({
  isOpen,
  onClose,
  pocket,
  onEdit,
  onAllocate,
  onTransfer,
}) => {
  const { state, deletePocket, voidTransaction } = useApp();
  const lang = state.settings.language;

  const livePocket = pocket ? state.pockets.find((p) => p.id === pocket.id) || pocket : null;

  const pocketTransactions = livePocket
    ? state.transactions.filter((t) => t.pocketId === livePocket.id && t.type === 'expense')
    : [];

  const totalExpense = pocketTransactions
    .filter((t) => !t.voided)
    .reduce((sum, t) => sum + t.amount, 0);

  const percentage =
    livePocket && livePocket.target > 0
      ? Math.min(100, Math.round((livePocket.balance / livePocket.target) * 100))
      : null;

  const handleDelete = () => {
    if (!livePocket) return;
    const formattedBalance = formatCurrency(livePocket.balance);
    const desc = livePocket.balance > 0
      ? translations[lang].confirmDeletePocketDescRefund(livePocket.name, formattedBalance)
      : translations[lang].confirmDeletePocketDescEmpty;

    Swal.fire({
      title: `${getTranslation(lang, 'confirmDeletePocketTitle')} (${livePocket.name})`,
      text: desc,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: getTranslation(lang, 'yesDelete'),
      cancelButtonText: getTranslation(lang, 'cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        deletePocket(livePocket.id);
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
    <BottomSheet
      isOpen={isOpen && Boolean(livePocket)}
      onClose={onClose}
      title={livePocket?.name || ''}
      subtitle={getTranslation(lang, 'pocketDetail')}
      icon={<Wallet01Icon className="w-5 h-5" />}
      iconColorClass="text-sky-500"
    >
      {livePocket && (
        <div className="space-y-4">
          {/* Balance card */}
          <div className="p-5 rounded-2xl neu-pressed">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {getTranslation(lang, 'currentBalance')}
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(livePocket.balance)}
            </p>

            {livePocket.target > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
                <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-300">
                  <span>{getTranslation(lang, 'saveTarget')}: {formatCurrency(livePocket.target)}</span>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAllocate(livePocket.id);
              }}
              className="flex-1 py-3 px-2.5 rounded-2xl neu-button text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Add01Icon className="w-4 h-4" />
              <span>{getTranslation(lang, 'fillBalance')}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onTransfer(livePocket.id);
              }}
              className="flex-1 py-3 px-2.5 rounded-2xl neu-button text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Exchange01Icon className="w-4 h-4" />
              <span>{getTranslation(lang, 'transfer')}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(livePocket);
              }}
              className="py-3 px-3 rounded-2xl neu-button text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center transition active:scale-95"
              title={getTranslation(lang, 'editPocket')}
            >
              <Edit02Icon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="py-3 px-3 rounded-2xl neu-button text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center transition active:scale-95"
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
              <div className="rounded-2xl neu-pressed py-6 px-4 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  {getTranslation(lang, 'noExpensesInPocket')}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl neu-pressed overflow-hidden">
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-200/50 dark:divide-slate-800/60">
                  {pocketTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`px-3.5 py-3 flex items-center justify-between gap-2.5 ${
                        tx.voided ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl neu-flat-sm flex items-center justify-center flex-shrink-0 ${
                            tx.voided ? 'text-slate-400' : 'text-red-500'
                          }`}
                        >
                          <ArrowDownLeft01Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p
                              className={`text-xs font-bold break-words ${
                                tx.voided
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-800 dark:text-white'
                              }`}
                            >
                              {tx.description}
                            </p>
                            {tx.voided && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full neu-flat-sm text-amber-600 dark:text-amber-400">
                                {getTranslation(lang, 'voidedBadge')}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {formatShortDate(tx.date, lang)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs font-black whitespace-nowrap ${
                            tx.voided
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          -{formatCurrency(tx.amount)}
                        </span>
                        {!tx.voided && (
                          <button
                            type="button"
                            onClick={() =>
                              confirmAndVoidTransaction(tx, state.pockets, lang, voidTransaction)
                            }
                            className="w-7 h-7 rounded-xl neu-button flex items-center justify-center text-amber-500 hover:text-amber-600 transition active:scale-95"
                            title={getTranslation(lang, 'voidTx')}
                          >
                            <RotateLeft01Icon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
