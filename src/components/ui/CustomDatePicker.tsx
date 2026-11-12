import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from 'hugeicons-react';
import { formatDate, formatShortDate } from '../../utils/formatters';

interface CustomDatePickerProps {
  value: string; // ISO date string 'YYYY-MM-DD'
  onChange: (value: string) => void;
  lang?: 'id' | 'en';
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  dropUp?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  lang = 'id',
  placeholder = 'Pilih Tanggal',
  className = '',
  onClear,
  dropUp,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect placement or use dropUp prop
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (dropUp !== undefined) {
        setPlacement(dropUp ? 'top' : 'bottom');
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Calendar popup height is ~280px
      if (spaceBelow < 300 && spaceAbove > 240) {
        setPlacement('top');
      } else if (spaceBelow < 300) {
        setPlacement(spaceAbove >= spaceBelow ? 'top' : 'bottom');
      } else {
        setPlacement('bottom');
      }
    }
  }, [isOpen, dropUp]);

  // Parse current value or fallback to today
  const selectedDate = value ? new Date(value) : null;
  const initialYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const monthNamesID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthNamesEN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNames = lang === 'en' ? monthNamesEN : monthNamesID;

  const dayNamesID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const dayNamesEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNames = lang === 'en' ? dayNamesEN : dayNamesID;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const formatted = `${viewYear}-${m}-${d}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleToday = () => {
    const now = new Date();
    const formatted = now.toISOString().slice(0, 10);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChange(formatted);
    setIsOpen(false);
  };

  // Build calendar matrix
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDay = today.getDate();

  const selectedDay =
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth
      ? selectedDate.getDate()
      : null;

  return (
    <div ref={containerRef} className={`relative font-sans select-none ${className}`}>
      {/* Trigger Button (Replaces native input) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl neu-pressed text-left cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar01Icon className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {value ? formatShortDate(value, lang) : placeholder}
          </span>
        </div>

        {value && onClear && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="p-1 rounded-lg hover:text-red-500 text-slate-400 transition"
            title="Hapus filter"
          >
            <Cancel01Icon className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Custom Neomorphic Calendar Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'top' ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'top' ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute left-0 sm:left-0 z-50 p-3.5 rounded-[26px] neu-flat border border-white/60 dark:border-white/5 shadow-2xl w-68 sm:w-72 max-w-[calc(100vw-2.5rem)] ${
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/50 dark:border-slate-800/60">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-xl neu-button flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ArrowLeft01Icon className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-black text-slate-800 dark:text-white">
                {monthNames[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-xl neu-button flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ArrowRight01Icon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {dayNames.map((d, idx) => (
                <span
                  key={d}
                  className={`text-[10px] font-black ${
                    idx === 0 ? 'text-red-500' : 'text-slate-400'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Day Cells Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading padding days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="w-7 h-7 sm:w-8 sm:h-8" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                const isToday = isCurrentMonth && todayDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      isSelected
                        ? 'neu-pressed text-sky-600 dark:text-sky-400 font-black'
                        : isToday
                        ? 'neu-button text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/40'
                        : 'hover:neu-button text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Calendar Footer Shortcuts */}
            <div className="pt-3 mt-2 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1 rounded-xl text-[11px] font-bold neu-button text-sky-600 dark:text-sky-400"
              >
                {lang === 'id' ? 'Hari Ini' : 'Today'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-xl text-[11px] font-bold text-slate-400 hover:text-slate-600"
              >
                {lang === 'id' ? 'Tutup' : 'Close'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
