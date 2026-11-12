import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tick02Icon } from 'hugeicons-react';

interface CustomCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  className = '',
}) => {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      id={id}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={`flex items-center gap-3 cursor-pointer select-none group ${className}`}
    >
      <div
        className={`w-6 h-6 rounded-xl neu-pressed flex items-center justify-center transition-all duration-200 ${
          checked
            ? 'ring-2 ring-sky-500/50 bg-sky-500/10 dark:bg-sky-500/20'
            : 'hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-600'
        }`}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="w-4 h-4 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-sm"
            >
              <Tick02Icon className="w-3 h-3 stroke-[3]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {label && (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {label}
        </span>
      )}
    </div>
  );
};

