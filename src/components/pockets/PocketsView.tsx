import React from 'react';
import {
  Wallet01Icon,
  Add01Icon,
  Exchange01Icon,
  Edit02Icon,
  Delete02Icon,
  ViewIcon,
  CheckmarkCircle02Icon,
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
  const { state, totalPocketsBalance, deletePocket } = useApp();
  const lang = state.settings.language;

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
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-[32px] neu-flat border border-white/60 dark:border-white/5">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">
            {getTranslation(lang, 'pocketsViewTitle')}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {getTranslation(lang, 'pocketsViewDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block p-2.5 px-4 rounded-2xl neu-pressed">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              {getTranslation(lang, 'totalAllPockets')}
            </span>
            <span className="text-sm font-black text-sky-600 dark:text-sky-400">
              {formatCurrency(totalPocketsBalance)}
            </span>
          </div>
          <button
            onClick={onOpenAddPocket}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl neu-button text-sky-600 dark:text-sky-400 text-xs font-black transition"
          >
            <Add01Icon className="w-4 h-4" />
            <span>{getTranslation(lang, 'addPocket')}</span>
          </button>
        </div>
      </div>

      {/* Pockets Grid */}
      {state.pockets.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-[32px] neu-flat border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-3xl neu-pressed flex items-center justify-center text-sky-500 mb-4">
            <Wallet01Icon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            {getTranslation(lang, 'noPockets')}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            {getTranslation(lang, 'noPocketsDesc')}
          </p>
          <button
            onClick={onOpenAddPocket}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl neu-button text-sky-600 dark:text-sky-400 text-xs font-black transition"
          >
            <Add01Icon className="w-4 h-4" />
            <span>{getTranslation(lang, 'createNow')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.pockets.map((pocket) => {
            const colorMeta = COLOR_MAP[pocket.color] || COLOR_MAP.sky;
            const percentage = pocket.target > 0
              ? Math.min(100, Math.round((pocket.balance / pocket.target) * 100))
              : null;
            const isTargetReached = percentage !== null && percentage >= 100;

            return (
              <div
                key={pocket.id}
                onClick={() => onSelectPocketDetail(pocket)}
                className="group relative rounded-[28px] neu-flat hover:neu-convex transition-all cursor-pointer p-5 flex flex-col justify-between overflow-hidden border border-white/60 dark:border-white/5"
              >
                {/* Color Top Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${colorMeta.banner}`} />

                <div>
                  {/* Title & Action Buttons Row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-black px-3 py-1 rounded-full neu-pressed ${colorMeta.badge}`}>
                      {pocket.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPocket(pocket);
                        }}
                        className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-sky-600 transition"
                        title={getTranslation(lang, 'editPocket')}
                      >
                        <Edit02Icon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(pocket, e)}
                        className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-slate-400 hover:text-red-600 transition"
                        title={getTranslation(lang, 'delete')}
                      >
                        <Delete02Icon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="my-2.5">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      {getTranslation(lang, 'currentBalance')}
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                      {formatCurrency(pocket.balance)}
                    </p>
                  </div>

                  {/* Progress Bar towards target */}
                  {pocket.target > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          {isTargetReached && <CheckmarkCircle02Icon className="w-3.5 h-3.5 text-emerald-500" />}
                          {getTranslation(lang, 'saveTarget')}: {formatCurrency(pocket.target)}
                        </span>
                        <span className={isTargetReached ? 'text-emerald-500 font-black' : 'text-sky-600 dark:text-sky-400 font-bold'}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full neu-pressed overflow-hidden p-0.5">
                        <div
                          className={`h-full ${colorMeta.banner} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center gap-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAllocatePocket(pocket.id);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl neu-button text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Exchange01Icon className="w-3.5 h-3.5" />
                    <span>{getTranslation(lang, 'fillBalance')}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPocketDetail(pocket);
                    }}
                    className="py-2.5 px-3.5 rounded-xl neu-button text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition"
                  >
                    <ViewIcon className="w-3.5 h-3.5" />
                    <span>{getTranslation(lang, 'pocketDetail')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
