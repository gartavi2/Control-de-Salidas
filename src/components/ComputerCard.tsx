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
        isOut
          ? isCritical
            ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/40 shadow-md shadow-rose-100'
            : isWarning
            ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30 shadow-md shadow-amber-100'
            : 'bg-indigo-50/70 border-indigo-200 shadow-sm ring-1 ring-indigo-300/40'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
      }`}
      id={`pc-card-${computer.number}`}
    >
      {/* Top Bar / Status Stripe */}
      <div
        className={`h-1.5 w-full transition-colors ${
          isOut
            ? isCritical
              ? 'bg-rose-500 animate-pulse'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-indigo-500'
            : 'bg-emerald-500/70'
        }`}
      />

      <div className="p-3 sm:p-3.5 flex flex-col justify-between h-full min-h-[132px]">
        {/* Header: PC Number & Status Indicator */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                isOut
                  ? isCritical
                    ? 'bg-rose-500 text-white shadow-xs'
                    : isWarning
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {computer.number.toString().padStart(2, '0')}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 tracking-tight block">
                PC {computer.number.toString().padStart(2, '0')}
              </span>
              <span
                className={`inline-flex items-center text-[10px] font-medium leading-none ${
                  isOut
                    ? isCritical
                      ? 'text-rose-700'
                      : isWarning
                      ? 'text-amber-700'
                      : 'text-indigo-700'
                    : 'text-emerald-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    isOut
                      ? isCritical
                        ? 'bg-rose-500 animate-ping'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                      : 'bg-emerald-500'
                  }`}
                />
                {isOut ? 'AFUERA' : 'EN CLASE'}
              </span>
            </div>
          </div>

          {/* Interactive Tactile Switch Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(computer.number);
            }}
            title={
              isOut
                ? 'Clic para registrar regreso a clase'
                : isBlockedByLimit
                ? 'Límite de 3 alcanzado'
                : 'Clic para autorizar salida'
            }
            aria-label={`Cambiar estado de PC ${computer.number}`}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isOut
                ? isCritical
                  ? 'bg-rose-600'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
                : isBlockedByLimit
                ? 'bg-slate-200 cursor-not-allowed opacity-60'
                : 'bg-slate-200 hover:bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isOut ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Dynamic Center / Status Details */}
        <div className="my-2">
          {isOut ? (
            <div className="space-y-1.5">
              {/* Reason badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border truncate max-w-full ${
                    reasonInfo.badgeClass
                  }`}
                  title={computer.customReasonNote || reasonInfo.label}
                >
                  <span className="text-xs">{reasonInfo.icon}</span>
                  <span className="truncate">{computer.customReasonNote || reasonInfo.label}</span>
                </span>
              </div>

              {/* Timer badge */}
              <div
                className={`flex items-center justify-between text-xs font-mono font-bold px-2 py-1 rounded-md border ${
                  isCritical
                    ? 'bg-rose-100/90 text-rose-900 border-rose-200'
                    : isWarning
                    ? 'bg-amber-100/90 text-amber-900 border-amber-200'
                    : 'bg-indigo-100/80 text-indigo-900 border-indigo-200'
                }`}
              >
                <span className="flex items-center space-x-1 font-sans text-[11px] font-medium">
                  {isCritical ? (
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                  ) : (
                    <Clock className="w-3 h-3 opacity-70" />
                  )}
                  <span>Tiempo:</span>
                </span>
                <span className="tracking-wider">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-slate-600 text-xs py-1">
              <Monitor className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span className="truncate">Puesto disponible</span>
            </div>
          )}
        </div>

        {/* Bottom Quick Action */}
        <div>
          {isOut ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickReturn(computer.number);
              }}
              className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
                isCritical
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  : isWarning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              <ArrowRightCircle className="w-3.5 h-3.5" />
              <span>Marcar Regreso</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCardClick}
              disabled={isBlockedByLimit}
              className={`w-full py-1 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                isBlockedByLimit
                  ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 border-slate-200'
              }`}
            >
              {isBlockedByLimit ? 'Cupo lleno (3/3)' : 'Pedir Salida'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
