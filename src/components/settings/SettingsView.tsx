import React, { useRef, useState, useEffect } from 'react';
import {
  Settings01Icon,
  Moon02Icon,
  Sun01Icon,
  Globe02Icon,
  Download01Icon,
  Upload01Icon,
  Delete02Icon,
  HardDriveIcon,
  InformationCircleIcon,
  Alert02Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { getLocalStorageSize } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import Swal from 'sweetalert2';

export const SettingsView: React.FC = () => {
  const { state, toggleDarkMode, setLanguage, exportData, importData, resetData } = useApp();
  const lang = state.settings.language;
  const isDark = state.settings.darkMode;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storageSize, setStorageSize] = useState<string>('0');

  useEffect(() => {
    setStorageSize(getLocalStorageSize());
  }, [state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        Swal.fire({
          icon: 'success',
          title: getTranslation(lang, 'alertSuccessTitle'),
          text: getTranslation(lang, 'dataRestored'),
          confirmButtonColor: '#0284c7',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: getTranslation(lang, 'alertErrorTitle'),
          text: getTranslation(lang, 'dataRestoreFailed'),
          confirmButtonColor: '#ef4444',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    Swal.fire({
      title: getTranslation(lang, 'confirmResetAllTitle'),
      text: getTranslation(lang, 'confirmResetAllDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: getTranslation(lang, 'yesReset'),
      cancelButtonText: getTranslation(lang, 'cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        resetData();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: getTranslation(lang, 'dataResetSuccess'),
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-fade-in-up pb-12 font-sans">
      {/* Compact Header Bar */}
      {/* <div className="px-5 py-4 sm:px-6 sm:py-5 rounded-[28px] sm:rounded-[32px] neu-flat border border-white/60 dark:border-white/5 flex items-center justify-between">
        <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-white">
          {getTranslation(lang, 'settingsViewTitle')}
        </h2>
      </div> */}

      {/* Preferences Section */}
      <div className="rounded-[28px] sm:rounded-[32px] neu-flat border border-white/60 dark:border-white/5 overflow-hidden">
        <div className="px-5 pt-4 pb-2 sm:px-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            {getTranslation(lang, 'themePreference')}
          </h3>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
          {/* Dark Mode Row */}
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-amber-500 flex-shrink-0">
                {isDark ? <Moon02Icon className="w-4 h-4" /> : <Sun01Icon className="w-4 h-4" />}
              </div>
              <p className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-white leading-snug">
                {getTranslation(lang, 'darkMode')}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`w-13 h-7 flex items-center rounded-full p-1 neu-pressed transition duration-300 flex-shrink-0 ${
                isDark ? 'justify-end' : 'justify-start'
              }`}
              style={{ width: '3.25rem' }}
            >
              <div className="bg-sky-500 w-5 h-5 rounded-full shadow-md" />
            </button>
          </div>

          {/* Language Row */}
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-blue-500 flex-shrink-0">
                <Globe02Icon className="w-4 h-4" />
              </div>
              <p className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-white leading-snug">
                {getTranslation(lang, 'languagePreference')}
              </p>
            </div>
            <div className="flex gap-1.5 p-1 rounded-2xl neu-pressed flex-shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                  lang === 'id'
                    ? 'neu-button text-sky-600 dark:text-sky-400'
                    : 'text-slate-400'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                  lang === 'en'
                    ? 'neu-button text-sky-600 dark:text-sky-400'
                    : 'text-slate-400'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="rounded-[28px] sm:rounded-[32px] neu-flat border border-white/60 dark:border-white/5 overflow-hidden">
        <div className="px-5 pt-4 pb-2 sm:px-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            {getTranslation(lang, 'dataManagementTitle')}
          </h3>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
          {/* Storage size indicator */}
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-purple-500 flex-shrink-0">
                <HardDriveIcon className="w-4 h-4" />
              </div>
              <p className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-white leading-snug">
                {getTranslation(lang, 'storageUsage')}
              </p>
            </div>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full neu-pressed whitespace-nowrap flex-shrink-0">
              {storageSize} KB
            </span>
          </div>

          {/* Backup Row */}
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-sky-500 flex-shrink-0">
                <Download01Icon className="w-4 h-4" />
              </div>
              <p className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-white leading-snug">
                {getTranslation(lang, 'backupTitle')}
              </p>
            </div>
            <button
              type="button"
              onClick={exportData}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl neu-button text-sky-600 dark:text-sky-400 text-[11px] sm:text-xs font-black transition whitespace-nowrap flex-shrink-0 active:scale-95"
            >
              <Download01Icon className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          {/* Restore Row */}
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-emerald-500 flex-shrink-0">
                <Upload01Icon className="w-4 h-4" />
              </div>
              <p className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-white leading-snug">
                {getTranslation(lang, 'restoreTitle')}
              </p>
            </div>
            <label className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl neu-button text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs font-black cursor-pointer transition whitespace-nowrap flex-shrink-0 active:scale-95">
              <Upload01Icon className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'chooseFile')}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Row */}
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-red-500 flex-shrink-0">
                <Alert02Icon className="w-4 h-4" />
              </div>
              <p className="text-[13px] sm:text-sm font-bold text-red-600 dark:text-red-400 leading-snug">
                {getTranslation(lang, 'resetTitle')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl neu-button text-red-600 dark:text-red-400 text-[11px] sm:text-xs font-black transition whitespace-nowrap flex-shrink-0 active:scale-95"
            >
              <Delete02Icon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact About Section */}
      <div className="px-5 py-4 sm:px-6 rounded-[28px] sm:rounded-[32px] neu-flat border border-white/60 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-sky-500 flex-shrink-0">
              <InformationCircleIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-white">
                {getTranslation(lang, 'aboutApp')}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                {getTranslation(lang, 'versionLabel')} • {getTranslation(lang, 'copyright')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
