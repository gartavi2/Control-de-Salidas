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

  // Create an array of size maxLimit to represent all slots
  const slots = Array.from({ length: maxLimit }, (_, index) => {
    return activeComputers[index] || null;
  });

  return (
    <div className="space-y-3" id="capacity-slots-container">
      {/* Capacity Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-bold text-slate-800 tracking-tight">
              Pases de Salida Activos:
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isAtLimit
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : occupiedCount > 0
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {occupiedCount} de {maxLimit} en el exterior
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-1.5">
          <span className="font-medium">Regla de aula:</span>
          <span>Máximo {maxLimit} estudiantes fuera a la vez</span>
        </div>
      </div>

      {/* 3 Slot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`rounded-xl p-3.5 border-2 transition-all shadow-xs ${
                  isCritical
                    ? 'bg-rose-50/90 border-rose-400 text-rose-950 ring-2 ring-rose-300/50'
                    : isWarning
                    ? 'bg-amber-50/90 border-amber-400 text-amber-950 ring-2 ring-amber-300/40'
                    : 'bg-indigo-50/80 border-indigo-300 text-indigo-950'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-sm ${
                        isCritical
                          ? 'bg-rose-600'
                          : isWarning
                          ? 'bg-amber-600'
                          : 'bg-indigo-600'
                      }`}
                    >
                      {computer.number.toString().padStart(2, '0')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm">
                          Pase #{slotNumber}: PC {computer.number.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <span className="inline-flex items-center text-xs font-semibold text-slate-700 mt-0.5">
                        <span className="mr-1">{reason.icon}</span>
                        <span>{computer.customReasonNote || reason.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Elapsed Timer Counter */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-600 block">
                      Transcurrido
                    </span>
                    <span
                      className={`font-mono text-sm font-extrabold ${
                        isCritical
                          ? 'text-rose-700 animate-pulse'
                          : isWarning
                          ? 'text-amber-800'
                          : 'text-indigo-800'
                      }`}
                    >
                      {formatTime(elapsedSeconds)}
                    </span>
                  </div>
                </div>

                {/* Return Action button */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-700">
                    {isCritical ? (
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> +10 min fuera
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> En curso
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onReturn(computer.number)}
                    className="px-3 py-1 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Marcar Regreso</span>
                  </button>
                </div>
              </motion.div>
            );
          }

          // Empty / Available Slot
          return (
            <div
              key={`empty-slot-${slotNumber}`}
              className="rounded-xl p-3.5 border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col justify-between min-h-[110px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    #{slotNumber}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-700 block">
                      Pase Disponible
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Listo para asignar
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-mono">00:00</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2">
                Activa el interruptor de cualquier PC para autorizar salida.
              </p>
            </div>
          );
        })}
      </div>

      {/* High-visibility Warning Banner if 3/3 Full */}
      {isAtLimit && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between gap-3"
          id="limit-reached-banner"
        >
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-200 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold leading-tight">
              Cupo Máximo Alcanzado (3/3): Se deben esperar retornos para permitir otra salida.
            </p>
          </div>
          <div className="hidden sm:flex items-center text-xs bg-rose-700/80 px-2.5 py-1 rounded-md font-medium border border-rose-500/50">
            <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
            <span>Esperando reincorporación</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
