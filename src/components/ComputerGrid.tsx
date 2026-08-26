import React from 'react';
import { ComputerState, AppSettings } from '../types';
import { ComputerCard } from './ComputerCard';

interface ComputerGridProps {
  computers: ComputerState[];
  currentTimeMs: number;
  settings: AppSettings;
  isBlockedByLimit: boolean;
  shakingPcNumber: number | null;
  onToggle: (pcNumber: number) => void;
  onQuickReturn: (pcNumber: number) => void;
}

export const ComputerGrid: React.FC<ComputerGridProps> = ({
  computers,
  currentTimeMs,
  settings,
  isBlockedByLimit,
  shakingPcNumber,
  onToggle,
  onQuickReturn,
}) => {
  // If classroom rows mode is active, organize into rows of 6
  if (settings.viewMode === 'classroom') {
    // Group into 6 rows: 1-6, 7-12, 13-18, 19-24, 25-30, 31-34
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
          <div key={row.name} className="space-y-2">
            <div className="flex items-center space-x-2 px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {row.name}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {row.computers.map((computer) => {
                const elapsedSeconds =
                  computer.isOut && computer.startTime
                    ? Math.max(0, Math.floor((currentTimeMs - computer.startTime) / 1000))
                    : 0;

                return (
                  <ComputerCard
                    key={computer.number}
                    computer={computer}
                    elapsedSeconds={elapsedSeconds}
                    warningMinutes={settings.warningTimeMinutes}
                    criticalMinutes={settings.criticalTimeMinutes}
                    isBlockedByLimit={isBlockedByLimit && !computer.isOut}
                    isShaking={shakingPcNumber === computer.number}
                    onToggle={onToggle}
                    onQuickReturn={onQuickReturn}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Standard Grid view (Dense 6-columns on desktop, 4 on tablet, 2 on mobile)
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      id="grid-view-container"
    >
      {computers.map((computer) => {
        const elapsedSeconds =
          computer.isOut && computer.startTime
            ? Math.max(0, Math.floor((currentTimeMs - computer.startTime) / 1000))
            : 0;

        return (
          <ComputerCard
            key={computer.number}
            computer={computer}
            elapsedSeconds={elapsedSeconds}
            warningMinutes={settings.warningTimeMinutes}
            criticalMinutes={settings.criticalTimeMinutes}
            isBlockedByLimit={isBlockedByLimit && !computer.isOut}
            isShaking={shakingPcNumber === computer.number}
            onToggle={onToggle}
            onQuickReturn={onQuickReturn}
          />
        );
      })}
    </div>
  );
};
