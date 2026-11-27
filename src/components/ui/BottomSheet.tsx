import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cancel01Icon } from 'hugeicons-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColorClass?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}

/**
 * Unified Neomorphic Bottom Sheet rendered via React Portal.
 * Replaces all centered modals with a consistent mobile-first slide-up sheet.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconColorClass = 'text-sky-500',
  children,
  fullHeight = false,
}) => {
  return createPortal(
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

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full max-w-2xl flex flex-col neu-flat rounded-t-[32px] sm:rounded-t-[36px] border-t border-white/60 dark:border-white/5 shadow-2xl overflow-hidden ${
              fullHeight ? 'h-[100dvh]' : 'max-h-[90dvh]'
            }`}
          >
            {/* Pinned Sheet Header */}
            <div className="px-6 pt-4 pb-3.5 sm:px-8 sm:pt-5 flex-shrink-0 border-b border-slate-200/50 dark:border-slate-800/50 bg-inherit">
              {/* Drag Handle */}
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3.5" />

              {title && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {icon && (
                      <span
                        className={`w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center flex-shrink-0 ${iconColorClass}`}
                      >
                        {icon}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight break-words">
                        {title}
                      </h3>
                      {subtitle && (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition flex-shrink-0 active:scale-95"
                  >
                    <Cancel01Icon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 pb-8 sm:px-8 sm:pb-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
