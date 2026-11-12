import React, { useState, useEffect } from 'react';
import {
  Wallet01Icon,
  PaintBoardIcon,
  Alert02Icon,
  Cancel01Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { Pocket } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { getTranslation } from '../../utils/translations';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

interface PocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocketToEdit?: Pocket | null;
}

const COLOR_OPTIONS = [
  { id: 'sky', bg: 'bg-sky-500', ring: 'ring-sky-500' },
  { id: 'blue', bg: 'bg-blue-600', ring: 'ring-blue-600' },
  { id: 'indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-600' },
  { id: 'purple', bg: 'bg-purple-600', ring: 'ring-purple-600' },
  { id: 'emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'amber', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'rose', bg: 'bg-rose-500', ring: 'ring-rose-500' },
];

export const PocketModal: React.FC<PocketModalProps> = ({ isOpen, onClose, pocketToEdit }) => {
  const { state, addPocket, editPocket } = useApp();
  const lang = state.settings.language;

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [color, setColor] = useState('sky');
  const [error, setError] = useState('');

  const isEditing = Boolean(pocketToEdit);

  useEffect(() => {
    if (isOpen) {
      if (pocketToEdit) {
        setName(pocketToEdit.name);
        setTarget(pocketToEdit.target ? pocketToEdit.target.toString() : '');
        setColor(pocketToEdit.color || 'sky');
      } else {
        setName('');
        setTarget('');
        setColor('sky');
      }
      setError('');
    }
  }, [isOpen, pocketToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(getTranslation(lang, 'pocketNameRequired'));
      return;
    }

    const numericTarget = parseFloat(target.replace(/[^0-9]/g, '')) || 0;

    if (isEditing && pocketToEdit) {
      editPocket(pocketToEdit.id, name, numericTarget, color);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: getTranslation(lang, 'pocketUpdated'),
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
      addPocket(name, numericTarget, color);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: getTranslation(lang, 'pocketSaved'),
        showConfirmButton: false,
        timer: 2000,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in-up font-sans">
      <div className="relative w-full max-w-md rounded-[32px] neu-flat border border-white/60 dark:border-white/5 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center text-sky-500">
              <Wallet01Icon className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {isEditing ? getTranslation(lang, 'editPocket') : getTranslation(lang, 'addPocket')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              {getTranslation(lang, 'pocketName')}
            </label>
            <div className="rounded-2xl neu-pressed px-4 py-2.5">
              <input
                type="text"
                placeholder={getTranslation(lang, 'pocketPrompt')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              {getTranslation(lang, 'pocketTarget')}
            </label>
            <div className="rounded-2xl neu-pressed px-4 py-2.5">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder="0 (opsional)"
                value={target}
                onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
              />
            </div>
            {target && Number(target) > 0 && (
              <p className="mt-1 text-xs text-sky-600 dark:text-sky-400 font-bold">
                {getTranslation(lang, 'saveTarget')}: {formatCurrency(Number(target))}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <PaintBoardIcon className="w-3.5 h-3.5 text-sky-500" />
              <span>{getTranslation(lang, 'color')}</span>
            </label>
            <div className="flex items-center gap-2.5 flex-wrap p-2 rounded-2xl neu-pressed">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition transform hover:scale-110 ${
                    color === c.id ? `ring-4 ${c.ring} ring-offset-2 dark:ring-offset-[#191d24] scale-110` : 'opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
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
              className="w-2/3 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/30 transition"
            >
              {isEditing ? getTranslation(lang, 'save') : getTranslation(lang, 'createNow')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
