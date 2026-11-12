import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown01Icon, Tick02Icon } from 'hugeicons-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  color?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  dropUp?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
  dropUp,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto detect space or use dropUp prop
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      if (dropUp !== undefined) {
        setPlacement(dropUp ? 'top' : 'bottom');
        return;
      }
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 240 && spaceAbove > 180) {
        setPlacement('top');
      } else if (spaceBelow < 240) {
        setPlacement(spaceAbove >= spaceBelow ? 'top' : 'bottom');
      } else {
        setPlacement('bottom');
      }
    }
  }, [isOpen, dropUp]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative font-sans select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl neu-pressed text-left transition-all"
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.color && (
            <span className={`w-3 h-3 rounded-full flex-shrink-0 bg-${selectedOption.color}-500 shadow-sm`} />
          )}
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-[11px] font-semibold text-slate-400 truncate">
              {selectedOption.sublabel}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 flex-shrink-0"
        >
          <ArrowDown01Icon className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Custom Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'top' ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'top' ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 right-0 z-50 p-2 rounded-2xl neu-flat border border-white/60 dark:border-white/5 shadow-2xl max-h-56 overflow-y-auto ${
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 my-0.5 rounded-xl text-left text-xs font-bold transition-all ${
                    isSelected
                      ? 'neu-pressed text-sky-600 dark:text-sky-400'
                      : 'hover:neu-button text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.color && (
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 bg-${opt.color}-500`} />
                    )}
                    <span className="truncate">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-slate-400 font-semibold truncate">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>

                  {isSelected && <Tick02Icon className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

