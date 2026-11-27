import React, { useState } from 'react';
import {
  Download01Icon,
  Alert02Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { generatePDF } from '../../utils/pdfGenerator';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { BottomSheet } from '../ui/BottomSheet';
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
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={getTranslation(lang, 'exportPdf')}
      icon={<Download01Icon className="w-5 h-5" />}
      iconColorClass="text-red-500"
    >
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50">
          <Alert02Icon className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick presets */}
      <div className="flex gap-2.5 flex-wrap">
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
            className="w-2/3 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Download01Icon className="w-4 h-4" />
            <span>{getTranslation(lang, 'downloadPDF')}</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
