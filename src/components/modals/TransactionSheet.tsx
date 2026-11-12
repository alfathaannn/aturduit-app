import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cancel01Icon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Alert02Icon,
  Wallet01Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import { CustomSelect } from '../ui/CustomSelect';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { CustomCheckbox } from '../ui/CustomCheckbox';
import Swal from 'sweetalert2';

interface TransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense';
  defaultPocketId?: string;
}

export const TransactionSheet: React.FC<TransactionSheetProps> = ({
  isOpen,
  onClose,
  defaultType = 'income',
  defaultPocketId = '',
}) => {
  const { state, addIncome, addExpense } = useApp();
  const lang = state.settings.language;

  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pocketId, setPocketId] = useState<string>(defaultPocketId);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setPocketId(defaultPocketId || (state.pockets[0]?.id ?? ''));
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setIsRecurring(false);
      setError('');
    }
  }, [isOpen, defaultType, defaultPocketId, state.pockets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numericAmount || numericAmount <= 0) {
      setError(getTranslation(lang, 'validAmountRequired'));
      return;
    }

    if (!description.trim()) {
      setError(getTranslation(lang, 'descriptionRequired'));
      return;
    }

    try {
      if (type === 'income') {
        addIncome(numericAmount, description, isRecurring, date);
      } else {
        if (!pocketId) {
          setError(getTranslation(lang, 'pocketRequiredForExpense'));
          return;
        }
        addExpense(numericAmount, description, pocketId, isRecurring, date);
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: getTranslation(lang, 'transactionSaved'),
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

  const selectedPocket = state.pockets.find((p) => p.id === pocketId);

  const pocketOptions = state.pockets.map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: `(${formatCurrency(p.balance)})`,
    color: p.color,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Bottom Sheet Container - Full Screen Height */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-w-2xl h-[100dvh] flex flex-col neu-flat border-t border-white/60 dark:border-white/5 shadow-2xl overflow-hidden"
            >
            {/* Pinned Top Header (Never scrolls away or gets cut off) */}
            <div className="px-6 pt-7 pb-3.5 sm:px-8 sm:pt-6 flex-shrink-0 border-b border-slate-200/50 dark:border-slate-800/50 bg-inherit">
              {/* Sheet Drag Handle */}
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3" />

              {/* Title & Close */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center neu-button ${
                      type === 'income' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {type === 'income' ? (
                      <ArrowDownLeft01Icon className="w-6 h-6" />
                    ) : (
                      <ArrowUpRight01Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                      {type === 'income'
                        ? getTranslation(lang, 'addIncome')
                        : getTranslation(lang, 'addExpense')}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {type === 'income'
                        ? 'Catat dana masuk ke Saldo Utama'
                        : 'Pilih pos kantong untuk pengeluaran'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center neu-button text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  <Cancel01Icon className="w-5 h-5" />
                </button>
              </div>

              {/* Type Switcher with Smooth Physical Sliding Indicator (Animasi Bergeser) */}
              <div className="relative p-1.5 mt-2 rounded-2xl neu-pressed overflow-hidden">
                {/* Physical Sliding Pill Indicator */}
                <motion.div
                  className="absolute top-1.5 bottom-1.5 left-1.5 rounded-xl neu-button pointer-events-none shadow-sm"
                  style={{ width: 'calc(50% - 6px)' }}
                  animate={{
                    x: type === 'income' ? '0%' : '100%',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 32,
                    mass: 0.8,
                  }}
                />

                <div className="relative z-10 grid grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200 ${
                      type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400 font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <ArrowDownLeft01Icon className="w-4 h-4" />
                    <span>{getTranslation(lang, 'income')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200 ${
                      type === 'expense'
                        ? 'text-red-600 dark:text-red-400 font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <ArrowUpRight01Icon className="w-4 h-4" />
                    <span>{getTranslation(lang, 'expense')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8 space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 p-3.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50">
                  <Alert02Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pb-6">
              {/* Amount with Numpad Mode */}
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
                    className="w-full bg-transparent text-2xl sm:text-3xl font-black text-slate-900 dark:text-white focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
                    autoFocus
                  />
                  {amount && Number(amount) > 0 && (
                    <p className="mt-1 text-xs text-sky-600 dark:text-sky-400 font-bold">
                      {formatCurrency(Number(amount))}
                    </p>
                  )}
                </div>

                {/* Quick Add Presets */}
                <div className="flex gap-2 flex-wrap mt-2.5">
                  {[20000, 50000, 100000, 500000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAdd(preset)}
                      className="px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition"
                    >
                      +{formatCurrency(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {getTranslation(lang, 'description')}
                </label>
                <div className="rounded-2xl neu-pressed px-4 py-3">
                  <input
                    type="text"
                    placeholder={getTranslation(lang, 'amountPrompt')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Custom Pocket Selector (Only for expense) */}
              {type === 'expense' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Wallet01Icon className="w-3.5 h-3.5 text-sky-500" />
                      <span>{getTranslation(lang, 'selectPocket')}</span>
                    </label>
                    {selectedPocket && (
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {getTranslation(lang, 'currentBalance')}:{' '}
                        <strong className="text-sky-600 dark:text-sky-400">
                          {formatCurrency(selectedPocket.balance)}
                        </strong>
                      </span>
                    )}
                  </div>

                  {state.pockets.length === 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900">
                      {getTranslation(lang, 'noPocketWarning')}
                    </p>
                  ) : (
                    <CustomSelect
                      value={pocketId}
                      onChange={(val) => setPocketId(val)}
                      options={pocketOptions}
                      placeholder={getTranslation(lang, 'selectPocket')}
                    />
                  )}
                </div>
              )}

              {/* Custom Datepicker & Custom Checkbox Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {getTranslation(lang, 'date')}
                  </label>
                  <CustomDatePicker
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    lang={lang}
                    dropUp
                  />
                </div>

                <div className="flex items-center p-3 rounded-2xl neu-pressed mt-auto h-[46px]">
                  <CustomCheckbox
                    checked={isRecurring}
                    onChange={setIsRecurring}
                    label={getTranslation(lang, 'isRecurring')}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 pb-8 sm:pb-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 neu-button"
                >
                  {getTranslation(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  disabled={type === 'expense' && state.pockets.length === 0}
                  className={`w-2/3 py-3 rounded-2xl text-xs font-black text-white shadow-lg transition-all ${
                    type === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`}
                >
                  {getTranslation(lang, 'save')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
