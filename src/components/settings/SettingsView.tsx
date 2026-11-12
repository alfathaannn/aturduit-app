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
    <div className="space-y-6 animate-fade-in-up pb-12 font-sans">
      {/* Header Bar */}
      <div className="p-6 sm:p-7 rounded-[32px] neu-flat border border-white/60 dark:border-white/5 flex items-center gap-3.5">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">
            {getTranslation(lang, 'settingsViewTitle')}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {getTranslation(lang, 'settingsViewDesc')}
          </p>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="p-6 sm:p-7 rounded-[32px] neu-flat border border-white/60 dark:border-white/5 space-y-4">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
          {getTranslation(lang, 'themePreference')}
        </h3>

        {/* Dark Mode Row */}
        <div className="flex items-center justify-between p-4 rounded-2xl neu-flat-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-pressed flex items-center justify-center text-amber-500">
              {isDark ? <Moon02Icon className="w-5 h-5" /> : <Sun01Icon className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {getTranslation(lang, 'darkMode')}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {isDark ? getTranslation(lang, 'darkActive') : getTranslation(lang, 'lightActive')}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`w-14 h-7 flex items-center rounded-full p-1 neu-pressed transition duration-300 ${
              isDark ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="bg-sky-500 w-5 h-5 rounded-full shadow-md" />
          </button>
        </div>

        {/* Language Row */}
        <div className="flex items-center justify-between p-4 rounded-2xl neu-flat-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-pressed flex items-center justify-center text-blue-500">
              <Globe02Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {getTranslation(lang, 'languagePreference')}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 p-1 rounded-2xl neu-pressed">
            <button
              onClick={() => setLanguage('id')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                lang === 'id'
                  ? 'neu-button text-sky-600 dark:text-sky-400'
                  : 'text-slate-400'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
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

      {/* Data Management Section */}
      <div className="p-6 sm:p-7 rounded-[32px] neu-flat border border-white/60 dark:border-white/5 space-y-4">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
          {getTranslation(lang, 'dataManagementTitle')}
        </h3>

        {/* Storage size indicator */}
        <div className="flex items-center justify-between p-4 rounded-2xl neu-flat-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-pressed flex items-center justify-center text-purple-500">
              <HardDriveIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {getTranslation(lang, 'storageUsage')}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {getTranslation(lang, 'browserStorageDesc')}
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-purple-600 dark:text-purple-400 px-3.5 py-1 rounded-full neu-pressed">
            {storageSize} KB
          </span>
        </div>

        {/* Backup Card */}
        <div className="p-4 rounded-2xl neu-flat-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {getTranslation(lang, 'backupTitle')}
            </p>
            <p className="text-xs text-slate-400 max-w-md font-medium">
              {getTranslation(lang, 'backupDesc')}
            </p>
          </div>
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl neu-button text-sky-600 dark:text-sky-400 text-xs font-black transition whitespace-nowrap"
          >
            <Download01Icon className="w-4 h-4" />
            <span>{getTranslation(lang, 'downloadBackup')}</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="p-4 rounded-2xl neu-flat-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {getTranslation(lang, 'restoreTitle')}
            </p>
            <p className="text-xs text-slate-400 max-w-md font-medium">
              {getTranslation(lang, 'restoreDesc')}
            </p>
          </div>
          <label className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl neu-button text-slate-700 dark:text-slate-200 text-xs font-black cursor-pointer transition whitespace-nowrap">
            <Upload01Icon className="w-4 h-4" />
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

        {/* Reset Card */}
        <div className="p-4 rounded-2xl neu-flat-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <Alert02Icon className="w-4 h-4" />
              {getTranslation(lang, 'resetTitle')}
            </p>
            <p className="text-xs text-red-500/80 dark:text-red-400/80 max-w-md font-medium">
              {getTranslation(lang, 'resetDesc')}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl neu-button text-red-600 dark:text-red-400 text-xs font-black transition whitespace-nowrap"
          >
            <Delete02Icon className="w-4 h-4" />
            <span>{getTranslation(lang, 'resetBtn')}</span>
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="p-6 sm:p-7 rounded-[32px] neu-flat border border-white/60 dark:border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <InformationCircleIcon className="w-4 h-4 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {getTranslation(lang, 'aboutApp')}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4 font-medium">
          {getTranslation(lang, 'appDesc')}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 font-semibold">
          <span>{getTranslation(lang, 'versionLabel')}</span>
          <span>{getTranslation(lang, 'copyright')}</span>
        </div>
      </div>
    </div>
  );
};
