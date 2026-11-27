import React, { useState, useEffect } from 'react';
import { Exchange01Icon, Alert02Icon } from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { getTranslation, translations } from '../../utils/translations';
import { CustomSelect } from '../ui/CustomSelect';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { BottomSheet } from '../ui/BottomSheet';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

interface TransferPocketSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePocketId?: string;
}

export const TransferPocketSheet: React.FC<TransferPocketSheetProps> = ({
  isOpen,
  onClose,
  sourcePocketId,
}) => {
  const { state, transferFromPocket, addExpense } = useApp();
  const lang = state.settings.language;

  const [targetId, setTargetId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string>('');

  const sourcePocket = state.pockets.find((p) => p.id === sourcePocketId);
  const isExpenseMode = targetId === '__EXPENSE__';

  useEffect(() => {
    if (isOpen) {
      setTargetId('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setError('');
    }
  }, [isOpen, sourcePocketId]);

  const destinationOptions = [
    {
      value: '__EXPENSE__',
      label: getTranslation(lang, 'transferAsExpenseOption'),
      sublabel: `(${getTranslation(lang, 'transferAsExpenseSublabel')})`,
      color: 'rose',
    },
    {
      value: '__MAIN__',
      label: getTranslation(lang, 'mainBalance'),
      sublabel: `(${formatCurrency(state.mainBalance)})`,
      color: 'emerald',
    },
    ...state.pockets
      .filter((p) => p.id !== sourcePocketId)
      .map((pocket) => ({
        value: pocket.id,
        label: pocket.name,
        sublabel: `(${formatCurrency(pocket.balance)})`,
        color: pocket.color,
      })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!sourcePocket) return;

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numericAmount || numericAmount <= 0) {
      setError(getTranslation(lang, 'validAmountRequired'));
      return;
    }

    if (!targetId) {
      setError(getTranslation(lang, 'selectTransferDestination'));
      return;
    }

    if (numericAmount > sourcePocket.balance) {
      setError(
        translations[lang].insufficientPocketBalance(
          sourcePocket.name,
          formatCurrency(sourcePocket.balance)
        )
      );
      return;
    }

    if (isExpenseMode && !description.trim()) {
      setError(getTranslation(lang, 'descriptionRequired'));
      return;
    }

    try {
      if (isExpenseMode) {
        addExpense(numericAmount, description, sourcePocket.id, date);
      } else {
        transferFromPocket(sourcePocket.id, targetId, numericAmount);
      }

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: getTranslation(lang, isExpenseMode ? 'transactionSaved' : 'transferSuccess'),
        showConfirmButton: false,
        timer: 2000,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setError(msg);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen && Boolean(sourcePocket)}
      onClose={onClose}
      title={getTranslation(lang, 'transferFromPocketTitle')}
      subtitle={sourcePocket?.name}
      icon={<Exchange01Icon className="w-5 h-5" />}
      iconColorClass={isExpenseMode ? 'text-red-500' : 'text-indigo-500'}
    >
      {sourcePocket && (
        <>
          {/* Source Pocket Balance Card */}
          <div className="p-4 rounded-2xl neu-pressed flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {getTranslation(lang, 'sourcePocketBalance')}
            </span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(sourcePocket.balance)}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mt-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50">
              <Alert02Icon className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                {getTranslation(lang, 'selectTransferDestination')}
              </label>
              <CustomSelect
                value={targetId}
                onChange={(val) => {
                  setTargetId(val);
                  setError('');
                }}
                options={destinationOptions}
                placeholder={getTranslation(lang, 'selectTransferDestination')}
              />
            </div>

            {isExpenseMode && (
              <>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {getTranslation(lang, 'description')}
                  </label>
                  <div className="rounded-2xl neu-pressed px-4 py-2.5">
                    <input
                      type="text"
                      placeholder={getTranslation(lang, 'amountPrompt')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {getTranslation(lang, 'date')}
                  </label>
                  <CustomDatePicker
                    value={date}
                    onChange={setDate}
                    lang={lang}
                    dropUp
                  />
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {getTranslation(lang, 'amount')} (Rp)
                </label>
                {sourcePocket.balance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(sourcePocket.balance.toString())}
                    className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Max ({formatCurrency(sourcePocket.balance)})
                  </button>
                )}
              </div>
              <div className="rounded-2xl neu-pressed p-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-transparent text-2xl font-black text-slate-900 dark:text-white focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
                  autoFocus
                />
                {amount && Number(amount) > 0 && (
                  <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    {formatCurrency(Number(amount))}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 neu-button"
              >
                {getTranslation(lang, 'cancel')}
              </button>
              <button
                type="submit"
                disabled={sourcePocket.balance <= 0}
                className={`w-2/3 py-3 rounded-2xl text-xs font-black text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
                  isExpenseMode
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/30'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-600/30'
                }`}
              >
                {getTranslation(lang, isExpenseMode ? 'save' : 'transfer')}
              </button>
            </div>
          </form>
        </>
      )}
    </BottomSheet>
  );
};
