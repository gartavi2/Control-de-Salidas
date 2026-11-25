import React from 'react';
import { motion } from 'motion/react';
import { Monitor, Clock, AlertTriangle, ArrowRightCircle } from 'lucide-react';
import { ComputerState } from '../types';
import { EXIT_REASONS } from '../utils/constants';
import { formatTime } from '../utils/storage';

interface ComputerCardProps {
  computer: ComputerState;
  elapsedSeconds: number;
  warningMinutes: number;
  criticalMinutes: number;
  isBlockedByLimit: boolean;
  onToggle: (pcNumber: number) => void;
  onQuickReturn: (pcNumber: number) => void;
  isShaking?: boolean;
  dimmed?: boolean;
}

export const ComputerCard: React.FC<ComputerCardProps> = ({
  computer,
  elapsedSeconds,
  warningMinutes,
  criticalMinutes,
  isBlockedByLimit,
  onToggle,
  onQuickReturn,
  isShaking,
  dimmed = false,
}) => {
  const isOut = computer.isOut;
  const reasonInfo = computer.reason ? EXIT_REASONS[computer.reason] : EXIT_REASONS.baño;

  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const isCritical = isOut && elapsedMins >= criticalMinutes;
  const isWarning = isOut && !isCritical && elapsedMins >= warningMinutes;

  const handleCardClick = () => {
    onToggle(computer.number);
  };

  return (
    <motion.div
      animate={
        isShaking
          ? { x: [-6, 6, -5, 5, -3, 3, 0], transition: { duration: 0.4 } }
          : {}
      }
      className={`relative rounded-xl transition-all duration-200 border select-none overflow-hidden ${
        dimmed ? 'opacity-30 pointer-events-none' : ''
      } ${
        isOut
          ? isCritical
            ? 'bg-rose-50/95 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/40 dark:ring-rose-500/30 shadow-md shadow-rose-100 dark:shadow-none'
            : isWarning
            ? 'bg-amber-50/95 dark:bg-amber-950/45 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30 dark:ring-amber-500/30 shadow-md shadow-amber-100 dark:shadow-none'
            : 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-700 shadow-sm ring-1 ring-indigo-300/40 dark:ring-indigo-600/30'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      }`}
      id={`pc-card-${computer.number}`}
    >
      {/* Top Status Bar */}
      <div
        className={`h-1.5 w-full transition-colors ${
          isOut
            ? isCritical
              ? 'bg-rose-500 animate-pulse'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-indigo-500'
            : 'bg-emerald-500/75 dark:bg-emerald-500/60'
        }`}
      />

      <div className="p-3 sm:p-3.5 flex flex-col justify-between h-full min-h-[144px]">
        {/* Header: PC Number & Status Indicator */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm tabular-nums transition-colors ${
                isOut
                  ? isCritical
                    ? 'bg-rose-600 text-white shadow-xs'
                    : isWarning
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
              }`}
            >
              {computer.number.toString().padStart(2, '0')}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 tracking-tight block">
                PC {computer.number.toString().padStart(2, '0')}
              </span>
              <span
                className={`inline-flex items-center text-[11px] font-medium leading-none mt-0.5 ${
                  isOut
                    ? isCritical
                      ? 'text-rose-700 dark:text-rose-300'
                      : isWarning
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-indigo-700 dark:text-indigo-300'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {isOut ? 'Afuera' : 'En clase'}
              </span>
            </div>
          </div>

          {/* Interactive Tactile Switch Button (44px+ hit target wrapper) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(computer.number);
            }}
            title={
              isOut
                ? 'Tocar para registrar regreso a clase'
                : isBlockedByLimit
                ? 'Límite alcanzado'
                : 'Tocar para autorizar salida'
            }
            aria-label={`Cambiar estado de PC ${computer.number}`}
            className="min-w-[44px] min-h-[44px] -m-1.5 flex items-center justify-center rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isOut
                  ? isCritical
                    ? 'bg-rose-600'
                    : isWarning
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                  : isBlockedByLimit
                  ? 'bg-slate-200 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isOut ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        </div>

        {/* Dynamic Center / Status Details */}
        <div className="my-2">
          {isOut ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 truncate max-w-full"
                  title={computer.customReasonNote || reasonInfo.label}
                >
                  <span className="text-sm">{reasonInfo.icon}</span>
                  <span className="truncate">{computer.customReasonNote || reasonInfo.label}</span>
                </span>
              </div>

              <div
                className={`flex items-center justify-between text-xs font-mono tabular-nums font-bold px-2.5 py-1.5 rounded-lg border ${
                  isCritical
                    ? 'bg-rose-100/90 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100 border-rose-200 dark:border-rose-700'
                    : isWarning
                    ? 'bg-amber-100/90 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-700'
                    : 'bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100 border-indigo-200 dark:border-indigo-700'
                }`}
              >
                <span className="flex items-center space-x-1 font-sans text-[11px] font-medium">
                  {isCritical ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                  )}
                  <span>Tiempo</span>
                </span>
                <span className="tracking-wider">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs py-1">
              <Monitor className="w-3.5 h-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />
              <span className="truncate">Puesto disponible</span>
            </div>
          )}
        </div>

        {/* Bottom Quick Action (>=44px tablet touch target) */}
        <div>
          {isOut ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickReturn(computer.number);
              }}
              className={`w-full min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] ${
                isCritical
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  : isWarning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              <ArrowRightCircle className="w-4 h-4 shrink-0" />
              <span>Marcar Regreso</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCardClick}
              disabled={isBlockedByLimit}
              className={`w-full min-h-[44px] py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors active:scale-[0.98] ${
                isBlockedByLimit
                  ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isBlockedByLimit ? 'Cupo lleno' : 'Pedir Salida'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
