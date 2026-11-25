import React from 'react';
import { motion } from 'motion/react';
import { DoorOpen, Presentation, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ComputerState, AppSettings } from '../types';
import { CROQUIS_LAYOUT, EXIT_REASONS } from '../utils/constants';
import { formatTime } from '../utils/storage';
import { ComputerCard } from './ComputerCard';

interface ComputerGridProps {
  computers: ComputerState[];
  allComputers: ComputerState[];
  matchingNumbers: Set<number>;
  hasActiveFilters: boolean;
  currentTimeMs: number;
  settings: AppSettings;
  isBlockedByLimit: boolean;
  shakingPcNumber: number | null;
  onToggle: (pcNumber: number) => void;
  onQuickReturn: (pcNumber: number) => void;
}

interface CroquisStationTileProps {
  computer: ComputerState;
  elapsedSeconds: number;
  warningMinutes: number;
  criticalMinutes: number;
  isBlockedByLimit: boolean;
  isShaking: boolean;
  dimmed: boolean;
  onToggle: (pcNumber: number) => void;
}

const CroquisStationTile: React.FC<CroquisStationTileProps> = ({
  computer,
  elapsedSeconds,
  warningMinutes,
  criticalMinutes,
  isBlockedByLimit,
  isShaking,
  dimmed,
  onToggle,
}) => {
  const isOut = computer.isOut;
  const reasonInfo = computer.reason ? EXIT_REASONS[computer.reason] : EXIT_REASONS.baño;
  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const isCritical = isOut && elapsedMins >= criticalMinutes;
  const isWarning = isOut && !isCritical && elapsedMins >= warningMinutes;

  return (
    <motion.button
      type="button"
      animate={
        isShaking
          ? { x: [-5, 5, -4, 4, -2, 2, 0], transition: { duration: 0.35 } }
          : {}
      }
      onClick={() => onToggle(computer.number)}
      id={`croquis-pc-${computer.number}`}
      title={
        isOut
          ? `PC ${computer.number} afuera (${reasonInfo.label}) — Tocar para marcar regreso`
          : isBlockedByLimit
          ? `PC ${computer.number} — Cupo máximo alcanzado`
          : `PC ${computer.number} en clase — Tocar para autorizar salida`
      }
      className={`w-full min-h-[48px] px-2.5 py-2 rounded-xl border text-left transition-all active:scale-[0.98] flex items-center justify-between gap-2 select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        dimmed ? 'opacity-25 pointer-events-none' : ''
      } ${
        isOut
          ? isCritical
            ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/20'
            : isWarning
            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
            : 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
          : isBlockedByLimit
          ? 'bg-white/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 shadow-2xs'
      }`}
    >
      {/* Left: PC Number Badge + Label */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-extrabold tabular-nums shrink-0 ${
            isOut
              ? isWarning
                ? 'bg-slate-950/15 text-slate-950'
                : 'bg-white/20 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
          }`}
        >
          {computer.number.toString().padStart(2, '0')}
        </span>
        <div className="min-w-0 leading-tight">
          <span className="text-xs font-bold block truncate">
            PC {computer.number.toString().padStart(2, '0')}
          </span>
          {isOut ? (
            <span
              className={`text-[11px] font-medium flex items-center gap-1 truncate ${
                isWarning ? 'text-slate-900' : 'text-white/90'
              }`}
            >
              <span>{reasonInfo.icon}</span>
              <span className="truncate">{computer.customReasonNote || reasonInfo.label}</span>
            </span>
          ) : (
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span className="truncate">En clase</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Live Timer when Out, or quick status */}
      {isOut && (
        <div
          className={`shrink-0 px-2 py-1 rounded-lg font-mono tabular-nums text-xs font-extrabold flex items-center gap-1 ${
            isWarning
              ? 'bg-slate-950/15 text-slate-950'
              : 'bg-black/20 text-white'
          }`}
        >
          {isCritical ? (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Clock className="w-3 h-3 shrink-0 opacity-85" />
          )}
          <span>{formatTime(elapsedSeconds)}</span>
        </div>
      )}
    </motion.button>
  );
};

export const ComputerGrid: React.FC<ComputerGridProps> = ({
  computers,
  allComputers,
  matchingNumbers,
  hasActiveFilters,
  currentTimeMs,
  settings,
  isBlockedByLimit,
  shakingPcNumber,
  onToggle,
  onQuickReturn,
}) => {
  const computerByNumber = React.useMemo(() => {
    const map = new Map<number, ComputerState>();
    allComputers.forEach((c) => map.set(c.number, c));
    return map;
  }, [allComputers]);

  const getElapsed = (computer: ComputerState) =>
    computer.isOut && computer.startTime
      ? Math.max(0, Math.floor((currentTimeMs - computer.startTime) / 1000))
      : 0;

  // CROQUIS DEL LABORATORIO VIEW (exact layout from user sketch, excluding teacher PC)
  if (settings.viewMode === 'croquis') {
    const renderCroquisTile = (pcNum: number) => {
      const comp = computerByNumber.get(pcNum);
      if (!comp) return null;
      const dimmed = hasActiveFilters && !matchingNumbers.has(pcNum);
      return (
        <CroquisStationTile
          key={pcNum}
          computer={comp}
          elapsedSeconds={getElapsed(comp)}
          warningMinutes={settings.warningTimeMinutes}
          criticalMinutes={settings.criticalTimeMinutes}
          isBlockedByLimit={isBlockedByLimit && !comp.isOut}
          isShaking={shakingPcNumber === pcNum}
          dimmed={dimmed}
          onToggle={onToggle}
        />
      );
    };

    return (
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-xs"
        id="croquis-view-container"
      >
        {/* Top Lab Orientation Note */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Mapa físico del laboratorio · Toca cualquier computadora para registrar salida o regreso
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Parte superior: Fondo del aula · Parte inferior: Pizarra
          </div>
        </div>

        {/* Scrollable wrapper only on very narrow phones; fits 100% natively on Lenovo Tab (600px–1280px+) */}
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[580px] space-y-4">
            {/* Main 3-Zone Room Layout */}
            <div className="grid grid-cols-12 gap-3 sm:gap-4 items-stretch">
              {/* ZONE 1: Pared Izquierda (12->7, Puerta, 6->1) */}
              <div className="col-span-3 flex flex-col justify-between bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center pb-2">
                  Pared Izquierda
                </div>

                <div className="space-y-1.5">
                  {CROQUIS_LAYOUT.leftWallBack.map(renderCroquisTile)}
                </div>

                {/* Puerta Marker */}
                <div
                  className="my-2.5 py-2.5 px-2 rounded-xl border-2 border-dashed border-amber-400/70 dark:border-amber-500/50 bg-amber-50/80 dark:bg-amber-950/30 flex items-center justify-center gap-1.5 text-amber-800 dark:text-amber-300"
                  aria-label="Puerta del laboratorio"
                >
                  <DoorOpen className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold tracking-wide">Puerta</span>
                </div>

                <div className="space-y-1.5">
                  {CROQUIS_LAYOUT.leftWallFront.map(renderCroquisTile)}
                </div>
              </div>

              {/* ZONE 2: Mesa Central (13->18 izquierda | 24->19 derecha) */}
              <div className="col-span-6 flex flex-col justify-center bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-4">
                <div className="text-center mb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Mesa Central
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    PC 13–18 (izquierda) · PC 19–24 (derecha)
                  </span>
                </div>

                <div className="grid grid-cols-11 gap-2 items-stretch my-auto">
                  {/* Left Side: 13 -> 18 (top to bottom) */}
                  <div className="col-span-5 space-y-2">
                    {CROQUIS_LAYOUT.mesaCentralLeft.map(renderCroquisTile)}
                  </div>

                  {/* Center Spine Divider */}
                  <div className="col-span-1 flex flex-col items-center justify-center py-2">
                    <div className="w-px flex-1 bg-slate-300 dark:bg-slate-700" />
                    <span
                      className="my-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase select-none"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      Mesa Central
                    </span>
                    <div className="w-px flex-1 bg-slate-300 dark:bg-slate-700" />
                  </div>

                  {/* Right Side: 24 -> 19 (top to bottom, matching 19 at bottom -> 24 at top) */}
                  <div className="col-span-5 space-y-2">
                    {CROQUIS_LAYOUT.mesaCentralRight.map(renderCroquisTile)}
                  </div>
                </div>
              </div>

              {/* ZONE 3: Pared Derecha (25->34 top to bottom) */}
              <div className="col-span-3 flex flex-col justify-between bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center pb-2">
                  Pared Derecha
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  {CROQUIS_LAYOUT.rightWall.map(renderCroquisTile)}
                </div>
              </div>
            </div>

            {/* Bottom Landmark: Pizarra (Front of Room — Teacher PC intentionally omitted) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <div className="w-full max-w-md py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-xs">
                <Presentation className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold tracking-wide">
                  Pizarra · Frente del Laboratorio
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CLASSROOM ROWS VIEW (Filas de Aula)
  if (settings.viewMode === 'classroom') {
    const rows = [
      { name: 'Fila 1 (Frente)', computers: computers.filter((c) => c.number >= 1 && c.number <= 6) },
      { name: 'Fila 2', computers: computers.filter((c) => c.number >= 7 && c.number <= 12) },
      { name: 'Fila 3', computers: computers.filter((c) => c.number >= 13 && c.number <= 18) },
      { name: 'Fila 4', computers: computers.filter((c) => c.number >= 19 && c.number <= 24) },
      { name: 'Fila 5', computers: computers.filter((c) => c.number >= 25 && c.number <= 30) },
      { name: 'Fila 6 (Atrás)', computers: computers.filter((c) => c.number >= 31 && c.number <= 34) },
    ].filter((row) => row.computers.length > 0);

    return (
      <div className="space-y-6" id="classroom-view-container">
        {rows.map((row) => (
          <div key={row.name} className="space-y-2.5">
            <div className="flex items-center space-x-2 px-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {row.name}
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {row.computers.map((computer) => (
                <ComputerCard
                  key={computer.number}
                  computer={computer}
                  elapsedSeconds={getElapsed(computer)}
                  warningMinutes={settings.warningTimeMinutes}
                  criticalMinutes={settings.criticalTimeMinutes}
                  isBlockedByLimit={isBlockedByLimit && !computer.isOut}
                  isShaking={shakingPcNumber === computer.number}
                  onToggle={onToggle}
                  onQuickReturn={onQuickReturn}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // STANDARD GRID VIEW
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      id="grid-view-container"
    >
      {computers.map((computer) => (
        <ComputerCard
          key={computer.number}
          computer={computer}
          elapsedSeconds={getElapsed(computer)}
          warningMinutes={settings.warningTimeMinutes}
          criticalMinutes={settings.criticalTimeMinutes}
          isBlockedByLimit={isBlockedByLimit && !computer.isOut}
          isShaking={shakingPcNumber === computer.number}
          onToggle={onToggle}
          onQuickReturn={onQuickReturn}
        />
      ))}
    </div>
  );
};
