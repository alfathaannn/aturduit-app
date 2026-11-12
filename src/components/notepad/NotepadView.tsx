import React, { useState, useEffect } from 'react';
import {
  Note01Icon,
  Copy01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import Swal from 'sweetalert2';

export const NotepadView: React.FC = () => {
  const { state, setNotepadContent } = useApp();
  const lang = state.settings.language;

  const [text, setText] = useState(state.notepadContent || '');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Debounced auto-save
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setNotepadContent(text);
      setSaveStatus('saved');
    }, 400);

    return () => clearTimeout(timer);
  }, [text, setNotepadContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    Swal.fire({
      title: getTranslation(lang, 'confirmClearNotesTitle'),
      text: getTranslation(lang, 'confirmClearNotesDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: getTranslation(lang, 'yesClear'),
      cancelButtonText: getTranslation(lang, 'cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        setText('');
        setNotepadContent('');
      }
    });
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-[32px] neu-flat border border-white/60 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
              {getTranslation(lang, 'notepadTitle')}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400 font-semibold">
                {saveStatus === 'saving'
                  ? getTranslation(lang, 'saving')
                  : getTranslation(lang, 'notepadSaved')}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold neu-button text-slate-700 dark:text-slate-200 transition"
          >
            <Copy01Icon className="w-3.5 h-3.5 text-sky-500" />
            <span>{copied ? getTranslation(lang, 'copied') : getTranslation(lang, 'copyNotes')}</span>
          </button>
          <button
            onClick={handleClear}
            className="w-10 h-10 rounded-2xl neu-button flex items-center justify-center text-red-500 hover:text-red-600 transition"
            title={getTranslation(lang, 'clearNotes')}
          >
            <Delete02Icon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Neomorphic Inset Sunken Pad */}
      <div className="rounded-[32px] neu-flat border border-white/60 dark:border-white/5 p-5 sm:p-7">
        <div className="rounded-[24px] neu-pressed p-5 sm:p-6">
          <textarea
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={getTranslation(lang, 'notepadPlaceholder')}
            className="w-full bg-transparent text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-100 placeholder-slate-400 border-none resize-none focus:outline-none font-sans"
          />
        </div>

        {/* Footer Stats */}
        <div className="pt-4 mt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>{wordCount} {getTranslation(lang, 'wordsCount')} &bull; {charCount} {getTranslation(lang, 'charactersCount')}</span>
          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold px-3 py-1 rounded-full neu-pressed">
            <CheckmarkCircle02Icon className="w-3.5 h-3.5" />
            {getTranslation(lang, 'storageSynced')}
          </span>
        </div>
      </div>
    </div>
  );
};
