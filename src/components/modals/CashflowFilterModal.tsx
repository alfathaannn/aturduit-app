import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FilterHorizontalIcon,
  Cancel01Icon,
  Tick02Icon,
  Alert02Icon,
  Calendar01Icon,
  Clock01Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { CashflowFilterConfig, CashflowFilterType } from '../../types';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { CustomSelect } from '../ui/CustomSelect';

interface CashflowFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: CashflowFilterConfig;
  onApply: (config: CashflowFilterConfig) => void;
}

export const CashflowFilterModal: React.FC<CashflowFilterModalProps> = ({
  isOpen,
  onClose,
  currentFilter,
  onApply,
}) => {
  const { state } = useApp();
  const lang = state.settings.language;

  const [selectedType, setSelectedType] = useState<CashflowFilterType>(currentFilter.type);
  const [startDate, setStartDate] = useState<string>(
    currentFilter.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(
    currentFilter.endDate || new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedType(currentFilter.type);
      setStartDate(
        currentFilter.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      );
      setEndDate(
        currentFilter.endDate || new Date().toISOString().slice(0, 10)
      );
      setError('');
    }
  }, [isOpen, currentFilter]);

  if (!isOpen) return null;

  const periodOptions = [
    { value: '7days', label: getTranslation(lang, 'last7Days') },
    { value: '1month', label: getTranslation(lang, 'last1Month') },
    { value: '6months', label: getTranslation(lang, 'last6Months') },
    { value: '1year', label: getTranslation(lang, 'last1Year') },
    { value: 'all', label: getTranslation(lang, 'allTime') },
    { value: 'custom', label: getTranslation(lang, 'customRange') },
  ];

  const quickPresets: { id: CashflowFilterType; label: string }[] = [
    { id: '7days', label: lang === 'id' ? '7 Hari' : '7 Days' },
    { id: '1month', label: lang === 'id' ? '1 Bulan' : '1 Month' },
    { id: '6months', label: lang === 'id' ? '6 Bulan' : '6 Months' },
    { id: '1year', label: lang === 'id' ? '1 Tahun' : '1 Year' },
    { id: 'all', label: lang === 'id' ? 'Semua' : 'All' },
    { id: 'custom', label: lang === 'id' ? 'Kustom' : 'Custom' },
  ];

  const getActiveLabel = () => {
    const found = periodOptions.find((p) => p.value === selectedType);
    return found ? found.label : getTranslation(lang, 'last6Months');
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedType === 'custom') {
      if (!startDate || !endDate) {
        setError(getTranslation(lang, 'pickBothDates'));
        return;
      }
      if (startDate > endDate) {
        setError(getTranslation(lang, 'invalidDateRange'));
        return;
      }
    }

    onApply({
      type: selectedType,
      startDate: selectedType === 'custom' ? startDate : undefined,
      endDate: selectedType === 'custom' ? endDate : undefined,
    });
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up font-sans">
      <div className="relative w-full max-w-md rounded-[32px] neu-flat border border-white/60 dark:border-white/5 p-6 sm:p-8 shadow-2xl">
        {/* Header - Styled like AllocateModal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center text-sky-500">
              <FilterHorizontalIcon className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {getTranslation(lang, 'filterCashFlow')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Period Badge Card (Like AllocateModal's Available Main Balance Card) */}
        <div className="mt-5 p-4 rounded-2xl neu-pressed flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {getTranslation(lang, 'periodPreset')}
          </span>
          <span className="text-sm font-black text-sky-600 dark:text-sky-400">
            {getActiveLabel()}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mt-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50">
            <Alert02Icon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleApply} className="mt-5 space-y-4">
          {/* Custom Select Period (Matches AllocateModal's CustomSelect) */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              {lang === 'id' ? 'Pilih Rentang Waktu' : 'Select Time Range'}
            </label>
            <CustomSelect
              value={selectedType}
              onChange={(val) => {
                setSelectedType(val as CashflowFilterType);
                setError('');
              }}
              options={periodOptions}
              placeholder={getTranslation(lang, 'periodPreset')}
            />

            {/* Quick Add Preset Chips (Matches AllocateModal's preset chips) */}
            <div className="flex gap-2 flex-wrap mt-2.5">
              {quickPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(preset.id);
                    setError('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedType === preset.id
                      ? 'neu-pressed text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/30'
                      : 'neu-button text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Pickers (When 'custom' selected, with safe positioning) */}
          {selectedType === 'custom' && (
            <div className="p-4 rounded-2xl neu-flat-sm border border-white/60 dark:border-white/5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {getTranslation(lang, 'startDate')}
                  </label>
                  <CustomDatePicker
                    value={startDate}
                    onChange={setStartDate}
                    lang={lang}
                    placeholder={getTranslation(lang, 'startDate')}
                    dropUp
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {getTranslation(lang, 'endDate')}
                  </label>
                  <CustomDatePicker
                    value={endDate}
                    onChange={setEndDate}
                    lang={lang}
                    placeholder={getTranslation(lang, 'endDate')}
                    dropUp
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons (Matches AllocateModal) */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 neu-button transition"
            >
              {getTranslation(lang, 'cancel')}
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/30 transition flex items-center justify-center gap-2"
            >
              <Tick02Icon className="w-4 h-4" />
              <span>{getTranslation(lang, 'applyFilter')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
