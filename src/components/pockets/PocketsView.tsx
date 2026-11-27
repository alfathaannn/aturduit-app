import React, { useState } from 'react';
import {
  Wallet01Icon,
  Add01Icon,
  Exchange01Icon,
  Edit02Icon,
  Delete02Icon,
  ViewIcon,
  CheckmarkCircle02Icon,
  ArrowDown01Icon,
  FilterHorizontalIcon,
  Tick02Icon,
} from 'hugeicons-react';
import { useApp } from '../../context/AppContext';
import { Pocket } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { getTranslation, translations } from '../../utils/translations';
import Swal from 'sweetalert2';

interface PocketsViewProps {
  onOpenAddPocket: () => void;
  onEditPocket: (pocket: Pocket) => void;
  onAllocatePocket: (pocketId: string) => void;
  onSelectPocketDetail: (pocket: Pocket) => void;
}

const COLOR_MAP: Record<string, { banner: string; ring: string; badge: string }> = {
  sky: { banner: 'bg-sky-500', ring: 'ring-sky-500/30', badge: 'text-sky-600 dark:text-sky-400' },
  blue: { banner: 'bg-blue-600', ring: 'ring-blue-500/30', badge: 'text-blue-600 dark:text-blue-400' },
  indigo: { banner: 'bg-indigo-600', ring: 'ring-indigo-500/30', badge: 'text-indigo-600 dark:text-indigo-400' },
  purple: { banner: 'bg-purple-600', ring: 'ring-purple-500/30', badge: 'text-purple-600 dark:text-purple-400' },
  emerald: { banner: 'bg-emerald-500', ring: 'ring-emerald-500/30', badge: 'text-emerald-600 dark:text-emerald-400' },
  amber: { banner: 'bg-amber-500', ring: 'ring-amber-500/30', badge: 'text-amber-600 dark:text-amber-400' },
  rose: { banner: 'bg-rose-500', ring: 'ring-rose-500/30', badge: 'text-rose-600 dark:text-rose-400' },
};

export const PocketsView: React.FC<PocketsViewProps> = ({
  onOpenAddPocket,
  onEditPocket,
  onAllocatePocket,
  onSelectPocketDetail,
}) => {
  const { state, totalPocketsBalance, deletePocket, movePocket } = useApp();
  const lang = state.settings.language;
  const [isReordering, setIsReordering] = useState(false);

  const handleDelete = (pocket: Pocket, e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedBalance = formatCurrency(pocket.balance);
    const desc = pocket.balance > 0
      ? translations[lang].confirmDeletePocketDescRefund(pocket.name, formattedBalance)
      : translations[lang].confirmDeletePocketDescEmpty;

    Swal.fire({
      title: `${getTranslation(lang, 'confirmDeletePocketTitle')} (${pocket.name})`,
      text: desc,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: getTranslation(lang, 'yesDelete'),
      cancelButtonText: getTranslation(lang, 'cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        deletePocket(pocket.id);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: getTranslation(lang, 'pocketDeleted'),
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up font-sans">
      {/* Compact Header Bar (Mobile-First) */}
      <div className="p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] neu-flat border border-white/60 dark:border-white/5 space-y-3">
        {/* Title & Total Pill */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-white leading-tight">
            {getTranslation(lang, 'pocketsViewTitle')}
          </h2>

          <div className="px-3 py-1.5 rounded-full neu-pressed flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400">
              {state.pockets.length} {getTranslation(lang, 'pocketsCount')}
            </span>
            <span className="text-xs sm:text-sm font-black text-sky-600 dark:text-sky-400">
              {formatCurrency(totalPocketsBalance)}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className={`grid gap-2.5 ${state.pockets.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {state.pockets.length > 1 && (
            <button
              type="button"
              onClick={() => setIsReordering((prev) => !prev)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black transition active:scale-95 ${
                isReordering
                  ? 'neu-pressed text-emerald-600 dark:text-emerald-400'
                  : 'neu-button text-slate-600 dark:text-slate-300'
              }`}
            >
              {isReordering ? (
                <Tick02Icon className="w-4 h-4" />
              ) : (
                <FilterHorizontalIcon className="w-4 h-4" />
              )}
              <span>
                {isReordering
                  ? getTranslation(lang, 'doneReordering')
                  : getTranslation(lang, 'reorderPockets')}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddPocket}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl neu-button text-sky-600 dark:text-sky-400 text-xs font-black transition active:scale-95"
          >
            <Add01Icon className="w-4 h-4" />
            <span>{getTranslation(lang, 'addPocket')}</span>
          </button>
        </div>
      </div>

      {/* Pockets Grid */}
      {state.pockets.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-[28px] sm:rounded-[32px] neu-flat border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-12 h-12 mx-auto rounded-2xl neu-pressed flex items-center justify-center text-sky-500 mb-3">
            <Wallet01Icon className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-1">
            {getTranslation(lang, 'noPockets')}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            {getTranslation(lang, 'noPocketsDesc')}
          </p>
          <button
            onClick={onOpenAddPocket}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl neu-button text-sky-600 dark:text-sky-400 text-xs font-black transition active:scale-95"
          >
            <Add01Icon className="w-4 h-4" />
            <span>{getTranslation(lang, 'createNow')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {state.pockets.map((pocket, index) => {
            const colorMeta = COLOR_MAP[pocket.color] || COLOR_MAP.sky;
            const percentage = pocket.target > 0
              ? Math.min(100, Math.round((pocket.balance / pocket.target) * 100))
              : null;
            const isTargetReached = percentage !== null && percentage >= 100;

            return (
              <div
                key={pocket.id}
                onClick={() => {
                  if (!isReordering) onSelectPocketDetail(pocket);
                }}
                className={`group relative rounded-[24px] sm:rounded-[28px] neu-flat transition-all p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden border border-white/60 dark:border-white/5 ${
                  isReordering ? 'ring-1 ring-sky-500/20' : 'hover:neu-convex cursor-pointer active:scale-[0.99]'
                }`}
              >
                {/* Color Top Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${colorMeta.banner}`} />

                <div>
                  {/* Row 1: Pocket Name Badge & Compact Edit/Delete or Reorder Controls */}
                  <div className="flex items-center justify-between gap-2 mb-2.5 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isReordering && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full neu-pressed text-slate-500 dark:text-slate-400">
                          #{index + 1}
                        </span>
                      )}
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full neu-pressed break-words ${colorMeta.badge}`}>
                        {pocket.name}
                      </span>
                    </div>

                    {isReordering ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            movePocket(pocket.id, 'up');
                          }}
                          className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-sky-600 dark:text-sky-400 transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                          title={getTranslation(lang, 'moveUp')}
                        >
                          <ArrowDown01Icon className="w-4 h-4 rotate-180" />
                        </button>
                        <button
                          type="button"
                          disabled={index === state.pockets.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            movePocket(pocket.id, 'down');
                          }}
                          className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-sky-600 dark:text-sky-400 transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                          title={getTranslation(lang, 'moveDown')}
                        >
                          <ArrowDown01Icon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPocket(pocket);
                          }}
                          className="w-7 h-7 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-sky-600 transition active:scale-95"
                          title={getTranslation(lang, 'editPocket')}
                        >
                          <Edit02Icon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(pocket, e)}
                          className="w-7 h-7 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-red-600 transition active:scale-95"
                          title={getTranslation(lang, 'delete')}
                        >
                          <Delete02Icon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Balance & Inline Quick Actions (Compact Mobile Layout) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {getTranslation(lang, 'currentBalance')}
                      </p>
                      <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(pocket.balance)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAllocatePocket(pocket.id);
                        }}
                        className="py-2 px-2.5 rounded-xl neu-button text-sky-600 dark:text-sky-400 font-bold text-[11px] flex items-center gap-1 transition active:scale-95"
                      >
                        <Exchange01Icon className="w-3.5 h-3.5" />
                        <span>{getTranslation(lang, 'fillBalance')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPocketDetail(pocket);
                        }}
                        className="w-8 h-8 rounded-xl neu-button text-slate-500 dark:text-slate-300 flex items-center justify-center transition active:scale-95"
                        title={getTranslation(lang, 'pocketDetail')}
                      >
                        <ViewIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row 3: Compact Target Progress Bar */}
                  {pocket.target > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1 text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          {isTargetReached && <CheckmarkCircle02Icon className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                          {getTranslation(lang, 'saveTarget')}: {formatCurrency(pocket.target)}
                        </span>
                        <span className={isTargetReached ? 'text-emerald-500 font-black' : 'text-sky-600 dark:text-sky-400 font-bold'}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full neu-pressed overflow-hidden p-0.5">
                        <div
                          className={`h-full ${colorMeta.banner} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
