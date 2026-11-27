import React, { useState, useEffect } from 'react';
import { Exchange01Icon, Alert02Icon } from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { getTranslation, translations } from '../../utils/translations';
import { CustomSelect } from '../ui/CustomSelect';
import { BottomSheet } from '../ui/BottomSheet';
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
  const { state, allocateToPocket, transferFromPocket } = useApp();
  const lang = state.settings.language;

  const [sourceId, setSourceId] = useState<string>('__MAIN__');
  const [pocketId, setPocketId] = useState<string>(targetPocketId || '');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSourceId('__MAIN__');
      setPocketId(targetPocketId || '');
      setAmount('');
      setError('');
    }
  }, [isOpen, targetPocketId]);

  const isSourceMain = sourceId === '__MAIN__';
  const sourcePocket = !isSourceMain ? state.pockets.find((p) => p.id === sourceId) : undefined;
  const availableBalance = isSourceMain ? state.mainBalance : (sourcePocket?.balance ?? 0);

  const sourceOptions = [
    {
      value: '__MAIN__',
      label: getTranslation(lang, 'mainBalance'),
      sublabel: `(${formatCurrency(state.mainBalance)})`,
      color: 'emerald',
    },
    ...state.pockets.map((pocket) => ({
      value: pocket.id,
      label: pocket.name,
      sublabel: `(${formatCurrency(pocket.balance)})`,
      color: pocket.color,
    })),
  ];

  const targetOptions = [
    ...(!isSourceMain
      ? [
          {
            value: '__MAIN__',
            label: getTranslation(lang, 'mainBalance'),
            sublabel: `(${formatCurrency(state.mainBalance)})`,
            color: 'emerald',
          },
        ]
      : []),
    ...state.pockets
      .filter((pocket) => pocket.id !== sourceId)
      .map((pocket) => ({
        value: pocket.id,
        label: pocket.name,
        sublabel: `(${getTranslation(lang, 'currentBalance')}: ${formatCurrency(pocket.balance)})`,
        color: pocket.color,
      })),
  ];

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

    if (numericAmount > availableBalance) {
      if (isSourceMain) {
        setError(translations[lang].insufficientMainBalance(formatCurrency(availableBalance)));
      } else if (sourcePocket) {
        setError(
          translations[lang].insufficientPocketBalance(
            sourcePocket.name,
            formatCurrency(availableBalance)
          )
        );
      }
      return;
    }

    try {
      if (isSourceMain) {
        allocateToPocket(pocketId, numericAmount);
      } else {
        transferFromPocket(sourceId, pocketId, numericAmount);
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
        title: getTranslation(lang, isSourceMain ? 'balanceAllocated' : 'transferSuccess'),
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
      isOpen={isOpen}
      onClose={onClose}
      title={getTranslation(lang, 'allocateTitle')}
      icon={<Exchange01Icon className="w-5 h-5" />}
      iconColorClass="text-blue-500"
    >
      {/* Available Source Balance Card */}
      <div className="p-4 rounded-2xl neu-pressed flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {getTranslation(lang, 'availableSourceBalance')}
        </span>
        <span className="text-sm font-black text-sky-600 dark:text-sky-400">
          {formatCurrency(availableBalance)}
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
            {getTranslation(lang, 'sourceFunds')}
          </label>
          <CustomSelect
            value={sourceId}
            onChange={(val) => {
              setSourceId(val);
              if (val === pocketId || (val === '__MAIN__' && pocketId === '__MAIN__')) {
                setPocketId('');
              }
              setError('');
            }}
            options={sourceOptions}
            placeholder={getTranslation(lang, 'sourceFunds')}
          />
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
            {getTranslation(lang, 'selectTargetPocket')}
          </label>
          <CustomSelect
            value={pocketId}
            onChange={(val) => {
              setPocketId(val);
              setError('');
            }}
            options={targetOptions}
            placeholder={getTranslation(lang, 'selectTargetPocket')}
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

        {/* Get Remaining / Outstanding Balance Button */}
        <div>
          <button
            type="button"
            disabled={availableBalance <= 0}
            onClick={() => setAmount(availableBalance.toString())}
            className="w-full py-2.5 px-4 rounded-2xl neu-button text-xs font-black text-sky-600 dark:text-sky-400 flex items-center justify-between transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>{getTranslation(lang, 'useRemainingBalance')}</span>
            <span>{formatCurrency(availableBalance)}</span>
          </button>
        </div>

        {/* Buttons */}
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
            disabled={availableBalance <= 0}
            className="w-2/3 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {getTranslation(lang, 'fillBalance')}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
