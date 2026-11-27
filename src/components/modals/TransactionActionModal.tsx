import React from 'react';
import {
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Exchange01Icon,
  Delete02Icon,
  RotateLeft01Icon,
} from 'hugeicons-react';
import { Pocket, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import { confirmAndVoidTransaction } from '../../utils/voidTransactionHelper';
import { BottomSheet } from '../ui/BottomSheet';

interface TransactionActionModalProps {
  transaction: Transaction | null;
  transactions: Transaction[];
  pockets: Pocket[];
  lang: 'id' | 'en';
  onClose: () => void;
  onVoid: (id: string) => void;
  onDelete?: (id: string, description: string) => void;
}

export const TransactionActionModal: React.FC<TransactionActionModalProps> = ({
  transaction,
  transactions,
  pockets,
  lang,
  onClose,
  onVoid,
  onDelete,
}) => {
  const liveTx = transaction
    ? transactions.find((t) => t.id === transaction.id) || transaction
    : null;

  const isIncome = liveTx ? liveTx.type === 'income' || liveTx.type === 'transfer_in' : false;
  const isExpense = liveTx ? liveTx.type === 'expense' : false;
  const pocketName =
    liveTx && liveTx.pocketId
      ? pockets.find((p) => p.id === liveTx.pocketId)?.name
      : null;

  const iconColor = !liveTx || liveTx.voided
    ? 'text-slate-400'
    : isIncome
    ? 'text-emerald-500'
    : isExpense
    ? 'text-red-500'
    : 'text-blue-500';

  return (
    <BottomSheet
      isOpen={Boolean(liveTx)}
      onClose={onClose}
      title={liveTx?.description || ''}
      subtitle={liveTx ? formatDate(liveTx.date, lang) : ''}
      icon={
        isIncome ? (
          <ArrowDownLeft01Icon className="w-5 h-5" />
        ) : isExpense ? (
          <ArrowUpRight01Icon className="w-5 h-5" />
        ) : (
          <Exchange01Icon className="w-5 h-5" />
        )
      }
      iconColorClass={iconColor}
    >
      {liveTx && (
        <div className="space-y-4">
          {/* Summary Info Card */}
          <div className="p-4 rounded-2xl neu-pressed space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                {getTranslation(lang, 'amount')}
              </span>
              <span
                className={`text-lg font-black ${
                  liveTx.voided
                    ? 'line-through text-slate-400'
                    : isIncome
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isExpense
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {isIncome ? '+' : '-'}{formatCurrency(liveTx.amount)}
              </span>
            </div>

            {pocketName && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs font-bold text-slate-400">
                  {getTranslation(lang, 'pocketsCount')}
                </span>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400">
                  {pocketName}
                </span>
              </div>
            )}

            {liveTx.voided && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xs font-bold text-slate-400">Status</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full neu-flat text-amber-600 dark:text-amber-400">
                  {getTranslation(lang, 'voidedBadge')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-1">
            {!liveTx.voided && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  confirmAndVoidTransaction(liveTx, pockets, lang, onVoid);
                }}
                className="flex-1 py-3 px-3 rounded-2xl neu-button text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <RotateLeft01Icon className="w-4 h-4" />
                <span>{getTranslation(lang, 'voidTx')}</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(liveTx.id, liveTx.description);
                }}
                className={`${
                  liveTx.voided ? 'w-full' : 'px-5'
                } py-3 rounded-2xl neu-button text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95`}
              >
                <Delete02Icon className="w-4 h-4" />
                <span>{getTranslation(lang, 'delete')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
