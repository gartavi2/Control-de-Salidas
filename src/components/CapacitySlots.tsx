import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, CheckCircle2, Clock, ArrowLeftRight, UserCheck } from 'lucide-react';
import { ComputerState, AppSettings } from '../types';
import { EXIT_REASONS } from '../utils/constants';
import { formatTime } from '../utils/storage';

interface CapacitySlotsProps {
  activeComputers: ComputerState[];
  settings: AppSettings;
  currentTimeMs: number;
  onReturn: (pcNumber: number) => void;
}

export const CapacitySlots: React.FC<CapacitySlotsProps> = ({
  activeComputers,
  settings,
  currentTimeMs,
  onReturn,
}) => {
  const maxLimit = settings.maxAllowedOutside;
  const occupiedCount = activeComputers.length;
  const isAtLimit = occupiedCount >= maxLimit;

  const slots = Array.from({ length: maxLimit }, (_, index) => {
    return activeComputers[index] || null;
  });

  return (
    <div className="space-y-3" id="capacity-slots-container">
      {/* Capacity Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center flex-wrap gap-2 text-sm">
          <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Pases de Salida Activos
          </span>
          <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">·</span>
          <span
            className={`text-xs font-bold tabular-nums ${
              isAtLimit
                ? 'text-rose-700 dark:text-rose-400'
                : occupiedCount > 0
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {occupiedCount} de {maxLimit} en el exterior
          </span>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400">
          Regla de aula · Máximo {maxLimit} estudiantes fuera a la vez
        </div>
      </div>

      {/* Active Pass Slot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {slots.map((computer, index) => {
          const slotNumber = index + 1;

          if (computer) {
            const reason = computer.reason ? EXIT_REASONS[computer.reason] : EXIT_REASONS.baño;
            const elapsedSeconds = computer.startTime
              ? Math.max(0, Math.floor((currentTimeMs - computer.startTime) / 1000))
              : 0;
            const elapsedMins = Math.floor(elapsedSeconds / 60);
            const isCritical = elapsedMins >= settings.criticalTimeMinutes;
            const isWarning = !isCritical && elapsedMins >= settings.warningTimeMinutes;

            return (
              <motion.div
                key={`slot-${slotNumber}-pc-${computer.number}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={`rounded-2xl p-3.5 border-2 transition-all shadow-xs ${
                  isCritical
                    ? 'bg-rose-50/95 dark:bg-rose-950/50 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-100 ring-2 ring-rose-300/50 dark:ring-rose-500/30'
                    : isWarning
                    ? 'bg-amber-50/95 dark:bg-amber-950/45 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-100 ring-2 ring-amber-300/40 dark:ring-amber-500/30'
                    : 'bg-indigo-50/85 dark:bg-indigo-950/45 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg tabular-nums text-white shadow-sm shrink-0 ${
                        isCritical
                          ? 'bg-rose-600'
                          : isWarning
                          ? 'bg-amber-600'
                          : 'bg-indigo-600'
                      }`}
                    >
                      {computer.number.toString().padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm block truncate">
                        Pase #{slotNumber} · PC {computer.number.toString().padStart(2, '0')}
                      </span>
                      <span className="inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate max-w-full">
                        <span className="mr-1">{reason.icon}</span>
                        <span className="truncate">{computer.customReasonNote || reason.label}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      Tiempo
                    </span>
                    <span
                      className={`font-mono tabular-nums text-sm font-extrabold ${
                        isCritical
                          ? 'text-rose-700 dark:text-rose-300 animate-pulse'
                          : isWarning
                          ? 'text-amber-800 dark:text-amber-300'
                          : 'text-indigo-800 dark:text-indigo-300'
                      }`}
                    >
                      {formatTime(elapsedSeconds)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    {isCritical ? (
                      <span className="text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> +{settings.criticalTimeMinutes} min fuera
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> En curso
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onReturn(computer.number)}
                    className="min-h-[44px] px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs transition-all flex items-center space-x-1.5"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Marcar Regreso</span>
                  </button>
                </div>
              </motion.div>
            );
          }

          return (
            <div
              key={`empty-slot-${slotNumber}`}
              className="rounded-2xl p-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 flex flex-col justify-between min-h-[116px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs tabular-nums">
                    #{slotNumber}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                      Pase Disponible
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Listo para asignar
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">00:00</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                Toca cualquier computadora libre para autorizar salida.
              </p>
            </div>
          );
        })}
      </div>

      {/* High-visibility Warning Banner if Full */}
      {isAtLimit && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-600 dark:bg-rose-700 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between gap-3"
          id="limit-reached-banner"
        >
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-200 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold leading-tight">
              Cupo Máximo Alcanzado ({maxLimit}/{maxLimit}): Se deben esperar retornos para permitir otra salida.
            </p>
          </div>
          <div className="hidden sm:flex items-center text-xs bg-rose-700/80 dark:bg-rose-800/80 px-2.5 py-1 rounded-md font-medium border border-rose-500/50 shrink-0">
            <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
            <span>Esperando reincorporación</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
