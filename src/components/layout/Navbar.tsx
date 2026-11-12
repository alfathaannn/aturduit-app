import React, { useState, useEffect } from 'react';
import {
  Wallet01Icon,
  Moon02Icon,
  Sun01Icon,
  Globe02Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';

export const Navbar: React.FC = () => {
  const { state, totalGlobalBalance, toggleDarkMode, setLanguage } = useApp();
  const lang = state.settings.language;
  const isDark = state.settings.darkMode;

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = lang === 'id' ? 'id-ID' : 'en-US';
      const formatted = now.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-40 px-3 sm:px-6 lg:px-8 pointer-events-none font-sans select-none transform-gpu">
      <div className="max-w-5xl mx-auto pointer-events-auto">
        <div className="relative flex items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full neu-flat border border-white/70 dark:border-white/10 shadow-xl backdrop-blur-xl bg-[#eef2f6]/95 dark:bg-[#191d24]/95">
          {/* Brand & Dynamic Clock Capsule */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full neu-button flex items-center justify-center text-sky-500 flex-shrink-0">
              <Wallet01Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-xs sm:text-sm leading-tight bg-gradient-to-r from-slate-900 via-sky-900 to-sky-600 dark:from-white dark:via-sky-200 dark:to-sky-400 bg-clip-text text-transparent truncate">
                {getTranslation(lang, 'appTitle')}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate leading-none mt-0.5">
                {currentTime || getTranslation(lang, 'currentDate')}
              </p>
            </div>
          </div>

          {/* Dynamic Island Balance Pill (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full neu-pressed flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-slate-400 font-semibold">
              {getTranslation(lang, 'totalBalance')}:
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-white">
              {formatCurrency(totalGlobalBalance)}
            </span>
          </div>

          {/* Actions: Theme & Language Capsules */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Toggle Pill */}
            <button
              type="button"
              onClick={() => setLanguage(lang === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] font-black text-slate-700 dark:text-slate-200 neu-button active:scale-95 transition"
              title={getTranslation(lang, 'languagePreference')}
            >
              <Globe02Icon className="w-3.5 h-3.5 text-sky-500" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 sm:p-2 rounded-full text-slate-700 dark:text-slate-200 neu-button active:scale-95 transition flex items-center justify-center"
              title={
                isDark
                  ? getTranslation(lang, 'lightActive')
                  : getTranslation(lang, 'darkActive')
              }
            >
              {isDark ? (
                <Sun01Icon className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon02Icon className="w-4 h-4 text-sky-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
