/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  Info, 
  Monitor, 
  CheckCircle,
  X
} from 'lucide-react';
import { ComputerState, ExitRecord, AppSettings, ExitReason } from './types';
import { 
  getInitialComputers, 
  saveComputers, 
  getHistory, 
  saveHistory, 
  getSettings, 
  saveSettings 
} from './utils/storage';
import { playExitSound, playReturnSound, playBlockedSound } from './utils/audio';
import { Header } from './components/Header';
import { CapacitySlots } from './components/CapacitySlots';
import { ComputerGrid } from './components/ComputerGrid';
import { ExitReasonModal } from './components/ExitReasonModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Primary States
  const [computers, setComputers] = useState<ComputerState[]>(() => getInitialComputers());
  const [history, setHistory] = useState<ExitRecord[]>(() => getHistory());
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());

  // Real-time ticking clock (every 1 second)
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  // UI Interactive States
  const [modalPcNumber, setModalPcNumber] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyOutFilter, setOnlyOutFilter] = useState<boolean>(false);
  const [shakingPcNumber, setShakingPcNumber] = useState<number | null>(null);
  const [blockedAlertMessage, setBlockedAlertMessage] = useState<string | null>(null);

  // Sync timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveComputers(computers);
  }, [computers]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Derived: active computers outside
  const activeComputers = useMemo(() => {
    return computers.filter((c) => c.isOut);
  }, [computers]);

  const outsideCount = activeComputers.length;
  const isAtLimit = outsideCount >= settings.maxAllowedOutside;

  // Completed exits today
  const completedExitsToday = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startMs = startOfDay.getTime();
    return history.filter((h) => h.startTime >= startMs).length;
  }, [history]);

  // Filtered computers based on search and "only out" toggle
  const filteredComputers = useMemo(() => {
    return computers.filter((c) => {
      if (onlyOutFilter && !c.isOut) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const pcStr = c.number.toString();
        const paddedStr = c.number.toString().padStart(2, '0');
        const reasonStr = c.reason ? c.reason.toLowerCase() : '';
        const noteStr = c.customReasonNote ? c.customReasonNote.toLowerCase() : '';
        return (
          pcStr.includes(query) ||
          paddedStr.includes(query) ||
          reasonStr.includes(query) ||
          noteStr.includes(query)
        );
      }
      return true;
    });
  }, [computers, onlyOutFilter, searchQuery]);

  // Handle student return from a workstation
  const handleReturn = useCallback((pcNumber: number) => {
    setComputers((prev) => {
      const target = prev.find((c) => c.number === pcNumber);
      if (!target || !target.isOut) return prev;

      const now = Date.now();
      const startTime = target.startTime || now;
      const durationSeconds = Math.max(1, Math.round((now - startTime) / 1000));

      const newRecord: ExitRecord = {
        id: target.activeExitId || `exit-${now}-${pcNumber}`,
        computerNumber: pcNumber,
        reason: target.reason || 'baño',
        customReasonNote: target.customReasonNote,
        startTime,
        endTime: now,
        durationSeconds,
      };

      // Add to history log
      setHistory((prevHistory) => [newRecord, ...prevHistory]);

      playReturnSound(settings.soundEnabled);

      return prev.map((c) => {
        if (c.number === pcNumber) {
          return {
            ...c,
            isOut: false,
            activeExitId: undefined,
            startTime: undefined,
            reason: undefined,
            customReasonNote: undefined,
          };
        }
        return c;
      });
    });
  }, [settings.soundEnabled]);

  // Handle return for all active workstations
  const handleReturnAll = useCallback(() => {
    const now = Date.now();
    const recordsToAdd: ExitRecord[] = [];

    setComputers((prev) => {
      const updated = prev.map((c) => {
        if (c.isOut) {
          const startTime = c.startTime || now;
          const durationSeconds = Math.max(1, Math.round((now - startTime) / 1000));
          recordsToAdd.push({
            id: c.activeExitId || `exit-${now}-${c.number}`,
            computerNumber: c.number,
            reason: c.reason || 'baño',
            customReasonNote: c.customReasonNote,
            startTime,
            endTime: now,
            durationSeconds,
          });
          return {
            ...c,
            isOut: false,
            activeExitId: undefined,
            startTime: undefined,
            reason: undefined,
            customReasonNote: undefined,
          };
        }
        return c;
      });
      return updated;
    });

    if (recordsToAdd.length > 0) {
      setHistory((prev) => [...recordsToAdd, ...prev]);
      playReturnSound(settings.soundEnabled);
    }
  }, [settings.soundEnabled]);

  // Handle switch toggle on a computer
  const handleToggle = useCallback((pcNumber: number) => {
    const target = computers.find((c) => c.number === pcNumber);
    if (!target) return;

    if (target.isOut) {
      // It's currently out -> return to class
      handleReturn(pcNumber);
    } else {
      // It's currently in class -> attempt exit
      if (outsideCount >= settings.maxAllowedOutside) {
        // Exceeded limit!
        setShakingPcNumber(pcNumber);
        setTimeout(() => setShakingPcNumber(null), 500);

        playBlockedSound(settings.soundEnabled);

        setBlockedAlertMessage(
          `No se puede autorizar la salida de la PC-${pcNumber.toString().padStart(2, '0')}. El cupo máximo de ${settings.maxAllowedOutside} estudiantes ya está ocupado.`
        );

        setTimeout(() => {
          setBlockedAlertMessage(null);
        }, 5000);
      } else {
        // Allowed -> Open reason selector modal
        setModalPcNumber(pcNumber);
      }
    }
  }, [computers, outsideCount, settings.maxAllowedOutside, settings.soundEnabled, handleReturn]);

  // Confirm and start exit from modal
  const handleConfirmExit = useCallback(
    (pcNumber: number, reason: ExitReason, customNote?: string) => {
      // Verify limit isn't broken
      const currentActiveCount = computers.filter((c) => c.isOut).length;
      if (currentActiveCount >= settings.maxAllowedOutside) {
        setBlockedAlertMessage(
          `Límite alcanzado (${settings.maxAllowedOutside}/${settings.maxAllowedOutside}). Debe regresar un estudiante antes de registrar otra salida.`
        );
        playBlockedSound(settings.soundEnabled);
        setModalPcNumber(null);
        return;
      }

      const now = Date.now();
      const newExitId = `exit-${now}-${pcNumber}`;

      setComputers((prev) =>
        prev.map((c) => {
          if (c.number === pcNumber) {
            return {
              ...c,
              isOut: true,
              activeExitId: newExitId,
              startTime: now,
              reason,
              customReasonNote: customNote,
            };
          }
          return c;
        })
      );

      playExitSound(settings.soundEnabled);
      setModalPcNumber(null);
      setBlockedAlertMessage(null);
    },
    [computers, settings.maxAllowedOutside, settings.soundEnabled]
  );

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        totalComputers={computers.length}
        outsideCount={outsideCount}
        maxLimit={settings.maxAllowedOutside}
        completedExitsToday={completedExitsToday}
        settings={settings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyOutFilter={onlyOutFilter}
        onToggleOnlyOut={() => setOnlyOutFilter((prev) => !prev)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={() =>
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onReturnAll={handleReturnAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Real-time Blocked Limit Warning Toast */}
        <AnimatePresence>
          {blockedAlertMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 border border-rose-500"
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-200 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold">{blockedAlertMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setBlockedAlertMessage(null)}
                className="text-rose-100 hover:text-white p-1 rounded-md hover:bg-rose-700/60"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Exit Slots Visualizer (Active Passes) */}
        <section aria-labelledby="active-slots-heading">
          <h2 id="active-slots-heading" className="sr-only">
            Pases de Salida Activos
          </h2>
          <CapacitySlots
            activeComputers={activeComputers}
            settings={settings}
            currentTimeMs={currentTimeMs}
            onReturn={handleReturn}
          />
        </section>

        {/* Workstations Grid Section */}
        <section aria-labelledby="computers-grid-heading" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h2 id="computers-grid-heading" className="text-base font-extrabold text-slate-900 tracking-tight">
                Puestos de Trabajo (34 Computadoras)
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                — {filteredComputers.length} mostradas
              </span>
            </div>

            {/* Legend guide */}
            <div className="flex items-center space-x-4 text-[11px] text-slate-600">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>En clase (Inactivo)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Afuera (Activo)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>+10 min fuera</span>
              </div>
            </div>
          </div>

          {/* If search result is empty */}
          {filteredComputers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
              <Monitor className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No se encontraron puestos</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No hay computadoras que coincidan con los filtros aplicados.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setOnlyOutFilter(false);
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <ComputerGrid
              computers={filteredComputers}
              currentTimeMs={currentTimeMs}
              settings={settings}
              isBlockedByLimit={isAtLimit}
              shakingPcNumber={shakingPcNumber}
              onToggle={handleToggle}
              onQuickReturn={handleReturn}
            />
          )}
        </section>
      </main>

      {/* Classroom Rules Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              <strong>Regla Institucional:</strong> Máximo 3 estudiantes simultáneos fuera del aula. Al regresar, marca su casilla para liberar el cupo.
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Laboratorio de Computación • 34 Estaciones
          </div>
        </div>
      </footer>

      {/* Exit Reason Selection Modal */}
      <ExitReasonModal
        isOpen={modalPcNumber !== null}
        pcNumber={modalPcNumber}
        onClose={() => setModalPcNumber(null)}
        onConfirm={handleConfirmExit}
      />

      {/* History Log Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      {/* Classroom Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}
