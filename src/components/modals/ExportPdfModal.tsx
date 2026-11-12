import React, { useState } from 'react';
import {
  Download01Icon,
  Alert02Icon,
  Cancel01Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { generatePDF } from '../../utils/pdfGenerator';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import Swal from 'sweetalert2';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({ isOpen, onClose }) => {
  const { state } = useApp();
  const lang = state.settings.language;

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError(getTranslation(lang, 'pickBothDates'));
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError(getTranslation(lang, 'invalidDateRange'));
      return;
    }

    try {
      generatePDF(state.transactions, state.pockets, startDate, endDate, lang);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: getTranslation(lang, 'pdfDownloaded'),
        showConfirmButton: false,
        timer: 2500,
      });
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError(getTranslation(lang, 'alertErrorTitle'));
    }
  };

  const setPreset = (preset: 'thisMonth' | 'lastMonth' | 'all') => {
    const d = new Date();
    if (preset === 'thisMonth') {
      setStartDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10));
      setEndDate(d.toISOString().slice(0, 10));
    } else if (preset === 'lastMonth') {
      const startLast = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10);
      const endLast = new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10);
      setStartDate(startLast);
      setEndDate(endLast);
    } else {
      setStartDate('2020-01-01');
      setEndDate(d.toISOString().slice(0, 10));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in-up font-sans">
      <div className="relative w-full max-w-md rounded-[32px] neu-flat border border-white/60 dark:border-white/5 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center text-red-500">
              <Download01Icon className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {getTranslation(lang, 'exportPdf')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mt-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50">
            <Alert02Icon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick presets */}
        <div className="flex gap-2.5 mt-5">
          <button
            type="button"
            onClick={() => setPreset('thisMonth')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl neu-button text-slate-600 dark:text-slate-300 hover:text-sky-600 transition"
          >
            {getTranslation(lang, 'thisMonthPreset')}
          </button>
          <button
            type="button"
            onClick={() => setPreset('lastMonth')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl neu-button text-slate-600 dark:text-slate-300 hover:text-sky-600 transition"
          >
            {getTranslation(lang, 'lastMonthPreset')}
          </button>
          <button
            type="button"
            onClick={() => setPreset('all')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl neu-button text-slate-600 dark:text-slate-300 hover:text-sky-600 transition"
          >
            {getTranslation(lang, 'allTimePreset')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleExport} className="mt-4 space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              {getTranslation(lang, 'startDate')}
            </label>
            <CustomDatePicker
              value={startDate}
              onChange={setStartDate}
              lang={lang}
              placeholder={getTranslation(lang, 'startDate')}
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
              className="w-2/3 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              <Download01Icon className="w-4 h-4" />
              <span>{getTranslation(lang, 'downloadPDF')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
