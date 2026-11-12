import React, { useState, useEffect } from 'react';
import {
  Exchange01Icon,
  Alert02Icon,
  Cancel01Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { getTranslation, translations } from '../../utils/translations';
import { CustomSelect } from '../ui/CustomSelect';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

interface AllocateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPocketId?: string;
}

export const AllocateModal: React.FC<AllocateModalProps> = ({
  isOpen,
  onClose,
  targetPocketId,
}) => {
  const { state, allocateToPocket } = useApp();
  const lang = state.settings.language;

  const [pocketId, setPocketId] = useState<string>(targetPocketId || '');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPocketId(targetPocketId || (state.pockets[0]?.id ?? ''));
      setAmount('');
      setError('');
    }
  }, [isOpen, targetPocketId, state.pockets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numericAmount || numericAmount <= 0) {
      setError(getTranslation(lang, 'validAmountRequired'));
      return;
    }

    if (!pocketId) {
      setError(getTranslation(lang, 'selectTargetPocket'));
      return;
    }

    if (numericAmount > state.mainBalance) {
      setError(translations[lang].insufficientMainBalance(formatCurrency(state.mainBalance)));
      return;
    }

    try {
      allocateToPocket(pocketId, numericAmount);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: getTranslation(lang, 'balanceAllocated'),
        showConfirmButton: false,
        timer: 2000,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setError(msg);
    }
  };

  const handleQuickAdd = (preset: number) => {
    const current = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
    setAmount((current + preset).toString());
  };

  const pocketOptions = state.pockets.map((pocket) => ({
    value: pocket.id,
    label: pocket.name,
    sublabel: `(${getTranslation(lang, 'currentBalance')}: ${formatCurrency(pocket.balance)})`,
    color: pocket.color,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in-up font-sans">
      <div className="relative w-full max-w-md rounded-[32px] neu-flat border border-white/60 dark:border-white/5 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center text-blue-500">
              <Exchange01Icon className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {getTranslation(lang, 'allocateTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Available Main Balance Card */}
        <div className="mt-5 p-4 rounded-2xl neu-pressed flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {getTranslation(lang, 'availableMainBalance')}
          </span>
          <span className="text-sm font-black text-sky-600 dark:text-sky-400">
            {formatCurrency(state.mainBalance)}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mt-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50">
            <Alert02Icon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              {getTranslation(lang, 'selectPocket')}
            </label>
            <CustomSelect
              value={pocketId}
              onChange={(val) => setPocketId(val)}
              options={pocketOptions}
              placeholder={getTranslation(lang, 'selectPocket')}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              {getTranslation(lang, 'amount')} (Rp)
            </label>
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
                <p className="mt-1 text-xs text-sky-600 dark:text-sky-400 font-bold">
                  {formatCurrency(Number(amount))}
                </p>
              )}
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[50000, 100000, 250000, 500000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickAdd(preset)}
                className="px-2.5 py-1 text-xs font-bold rounded-xl neu-button text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition"
              >
                +{formatCurrency(preset)}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 neu-button"
            >
              {getTranslation(lang, 'cancel')}
            </button>
            <button
              type="submit"
              disabled={state.pockets.length === 0 || state.mainBalance <= 0}
              className="w-2/3 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getTranslation(lang, 'fillBalance')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
