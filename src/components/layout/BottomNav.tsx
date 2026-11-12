import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  DashboardSquare01Icon,
  Wallet01Icon,
  Clock01Icon,
  Note01Icon,
  Settings01Icon,
} from 'hugeicons-react';
import { ActiveTab } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTranslation, TranslationKey } from '../../utils/translations';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { state } = useApp();
  const lang = state.settings.language;

  const tabs: {
    id: ActiveTab;
    labelKey: TranslationKey;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: DashboardSquare01Icon },
    { id: 'pockets', labelKey: 'pockets', icon: Wallet01Icon },
    { id: 'history', labelKey: 'history', icon: Clock01Icon },
    { id: 'notepad', labelKey: 'notepad', icon: Note01Icon },
    { id: 'settings', labelKey: 'settings', icon: Settings01Icon },
  ];

  return (
    <nav className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none font-sans select-none">
      <div className="pointer-events-auto relative flex items-center gap-1.5 p-2 rounded-full neu-flat border border-white/60 dark:border-white/5 shadow-2xl">
        <LayoutGroup id="bottomNavigation">
          {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-full text-xs font-bold transition-colors duration-200 ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {/* Neomorphic Inset Sunken Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-full neu-pressed"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 32,
                  }}
                />
              )}

              {/* Icon & Label with Spring Motion */}
              <motion.div
                className="relative z-10 flex items-center gap-2"
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />

                <AnimatePresence mode="popLayout" initial={false}>
                  {isActive && (
                    <motion.span
                      key={tab.id}
                      initial={{ opacity: 0, width: 0, x: -6 }}
                      animate={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -6 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                      className="whitespace-nowrap overflow-hidden text-xs font-bold"
                    >
                      {getTranslation(lang, tab.labelKey)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </button>
          );
        })}
        </LayoutGroup>
      </div>
    </nav>
  );
};
