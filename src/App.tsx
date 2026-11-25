/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Info,
  Monitor,
  X,
  Map as MapIcon,
  LayoutGrid,
  Rows3,
  WifiOff,
} from 'lucide-react';
import { ComputerState, ExitRecord, AppSettings, ExitReason, ViewMode } from './types';
import {
  getInitialComputers,
  saveComputers,
  getHistory,
  saveHistory,
  getSettings,
  saveSettings,
  hydrateFromIndexedDB,
  requestAndroidPersistentStorage,
  LocalBackupPayload,
} from './utils/storage';
import { playExitSound, playReturnSound, playBlockedSound } from './utils/audio';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { CapacitySlots } from './components/CapacitySlots';
import { ComputerGrid } from './components/ComputerGrid';
import { ExitReasonModal } from './components/ExitReasonModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [computers, setComputers] = useState<ComputerState[]>(() => getInitialComputers());
  const [history, setHistory] = useState<ExitRecord[]>(() => getHistory());
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [isStoragePersisted, setIsStoragePersisted] = useState<boolean>(false);

  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  const [modalPcNumber, setModalPcNumber] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyOutFilter, setOnlyOutFilter] = useState<boolean>(false);
  const [shakingPcNumber, setShakingPcNumber] = useState<number | null>(null);
  const [blockedAlertMessage, setBlockedAlertMessage] = useState<string | null>(null);

  const isOnline = useOnlineStatus();

  // Hydrate from Android IndexedDB & request persistent storage
  useEffect(() => {
    let mounted = true;
    hydrateFromIndexedDB().then((hydrated) => {
      if (!mounted) return;
      if (hydrated.computers) setComputers(hydrated.computers);
      if (hydrated.history) setHistory(hydrated.history);
      if (hydrated.settings) setSettings(hydrated.settings);
    });
    requestAndroidPersistentStorage().then((persisted) => {
      if (mounted) setIsStoragePersisted(persisted);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Listen to system dark mode preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDarkActive =
    settings.themeMode === 'dark' ||
    (settings.themeMode === 'system' && systemPrefersDark);

  // Sync .dark class & Android status bar theme-color
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkActive) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDarkActive ? '#0f172a' : '#f1f5f9');
    }
  }, [isDarkActive]);

  // Real-time 1s timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist locally
  useEffect(() => {
    saveComputers(computers);
  }, [computers]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const activeComputers = useMemo(() => computers.filter((c) => c.isOut), [computers]);
  const outsideCount = activeComputers.length;
  const isAtLimit = outsideCount >= settings.maxAllowedOutside;

  const completedExitsToday = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startMs = startOfDay.getTime();
    return history.filter((h) => h.startTime >= startMs).length;
  }, [history]);

  const hasActiveFilters = onlyOutFilter || searchQuery.trim().length > 0;

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

  const matchingNumbers = useMemo(
    () => new Set(filteredComputers.map((c) => c.number)),
    [filteredComputers]
  );

  const handleReturn = useCallback(
    (pcNumber: number) => {
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

        setHistory((prevHistory) => [newRecord, ...prevHistory]);
        playReturnSound(settings.soundEnabled);

        return prev.map((c) =>
          c.number === pcNumber
            ? {
                ...c,
                isOut: false,
                activeExitId: undefined,
                startTime: undefined,
                reason: undefined,
                customReasonNote: undefined,
              }
            : c
        );
      });
    },
    [settings.soundEnabled]
  );

  const handleReturnAll = useCallback(() => {
    const now = Date.now();
    const recordsToAdd: ExitRecord[] = [];

    setComputers((prev) =>
      prev.map((c) => {
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
      })
    );

    if (recordsToAdd.length > 0) {
      setHistory((prev) => [...recordsToAdd, ...prev]);
      playReturnSound(settings.soundEnabled);
    }
  }, [settings.soundEnabled]);

  const handleToggle = useCallback(
    (pcNumber: number) => {
      const target = computers.find((c) => c.number === pcNumber);
      if (!target) return;

      if (target.isOut) {
        handleReturn(pcNumber);
      } else {
        if (outsideCount >= settings.maxAllowedOutside) {
          setShakingPcNumber(pcNumber);
          setTimeout(() => setShakingPcNumber(null), 500);
          playBlockedSound(settings.soundEnabled);

          setBlockedAlertMessage(
            `No se puede autorizar la salida de la PC-${pcNumber
              .toString()
              .padStart(2, '0')}. El cupo máximo de ${
              settings.maxAllowedOutside
            } estudiantes ya está ocupado.`
          );

          setTimeout(() => {
            setBlockedAlertMessage(null);
          }, 5000);
        } else {
          setModalPcNumber(pcNumber);
        }
      }
    },
    [computers, outsideCount, settings.maxAllowedOutside, settings.soundEnabled, handleReturn]
  );

  const handleConfirmExit = useCallback(
    (pcNumber: number, reason: ExitReason, customNote?: string) => {
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
        prev.map((c) =>
          c.number === pcNumber
            ? {
                ...c,
                isOut: true,
                activeExitId: newExitId,
                startTime: now,
                reason,
                customReasonNote: customNote,
              }
            : c
        )
      );

      playExitSound(settings.soundEnabled);
      setModalPcNumber(null);
      setBlockedAlertMessage(null);
    },
    [computers, settings.maxAllowedOutside, settings.soundEnabled]
  );

  const handleRestoreBackup = useCallback((payload: LocalBackupPayload) => {
    setComputers(payload.computers);
    setHistory(payload.history);
    setSettings(payload.settings);
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setSettings((prev) => ({ ...prev, viewMode: mode }));
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
      <Header
        totalComputers={computers.length}
        outsideCount={outsideCount}
        maxLimit={settings.maxAllowedOutside}
        completedExitsToday={completedExitsToday}
        settings={settings}
        isDarkActive={isDarkActive}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyOutFilter={onlyOutFilter}
        onToggleOnlyOut={() => setOnlyOutFilter((prev) => !prev)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={() =>
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onToggleTheme={() =>
          setSettings((prev) => ({
            ...prev,
            themeMode: isDarkActive ? 'light' : 'dark',
          }))
        }
        onReturnAll={handleReturnAll}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* Blocked Limit Alert */}
        <AnimatePresence>
          {blockedAlertMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-600 dark:bg-rose-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 border border-rose-500"
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-200 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold">{blockedAlertMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setBlockedAlertMessage(null)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-rose-100 hover:text-white rounded-lg hover:bg-rose-700/60"
                aria-label="Cerrar alerta"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Exit Passes */}
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

        {/* Workstations Section */}
        <section aria-labelledby="computers-grid-heading" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2
                id="computers-grid-heading"
                className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight"
              >
                Puestos de Trabajo (34 Computadoras)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                {filteredComputers.length} de {computers.length} mostradas ·{' '}
                {settings.viewMode === 'croquis'
                  ? 'Vista Croquis del Laboratorio'
                  : settings.viewMode === 'classroom'
                  ? 'Vista Filas de Aula'
                  : 'Vista Cuadrícula'}
              </p>
            </div>

            {/* Quick View Mode Segmented Switcher */}
            <div
              className="inline-flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl self-start sm:self-auto"
              role="group"
              aria-label="Organización Visual"
            >
              <button
                type="button"
                onClick={() => handleViewModeChange('croquis')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  settings.viewMode === 'croquis'
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Croquis</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  settings.viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cuadrícula</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('classroom')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  settings.viewMode === 'classroom'
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span>Filas</span>
              </button>
            </div>
          </div>

          {filteredComputers.length === 0 && settings.viewMode !== 'croquis' ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
              <Monitor className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                No se encontraron puestos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No hay computadoras que coincidan con los filtros aplicados.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setOnlyOutFilter(false);
                }}
                className="mt-4 min-h-[44px] px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-indigo-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <ComputerGrid
              computers={filteredComputers}
              allComputers={computers}
              matchingNumbers={matchingNumbers}
              hasActiveFilters={hasActiveFilters}
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

      {/* Offline Local Mode Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Modo sin conexión · Guardado local activo</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-6 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span>
              <strong className="text-slate-700 dark:text-slate-200">Regla Institucional:</strong>{' '}
              Máximo {settings.maxAllowedOutside} estudiantes simultáneos fuera del aula.
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Laboratorio de Computación · 34 Estaciones · Guardado Local
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExitReasonModal
        isOpen={modalPcNumber !== null}
        pcNumber={modalPcNumber}
        onClose={() => setModalPcNumber(null)}
        onConfirm={handleConfirmExit}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        computers={computers}
        history={history}
        isStoragePersisted={isStoragePersisted}
        onSave={setSettings}
        onRestoreBackup={handleRestoreBackup}
      />
    </div>
  );
}
