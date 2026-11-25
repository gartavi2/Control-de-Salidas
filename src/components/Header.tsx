import React, { useState, useEffect } from 'react';
import {
  Users,
  History,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Sun,
  Moon,
  Download,
} from 'lucide-react';
import { AppSettings } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  totalComputers: number;
  outsideCount: number;
  maxLimit: number;
  completedExitsToday: number;
  settings: AppSettings;
  isDarkActive: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onlyOutFilter: boolean;
  onToggleOnlyOut: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onReturnAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalComputers,
  outsideCount,
  maxLimit,
  completedExitsToday,
  settings,
  isDarkActive,
  searchQuery,
  onSearchChange,
  onlyOutFilter,
  onToggleOnlyOut,
  onOpenHistory,
  onOpenSettings,
  onToggleSound,
  onToggleTheme,
  onReturnAll,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showConfirmReturnAll, setShowConfirmReturnAll] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isFull = outsideCount >= maxLimit;

  return (
    <header
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-2xs"
      id="app-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Brand */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight leading-tight truncate">
                Control de Salidas de Aula
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {totalComputers} PCs · Máx. {maxLimit} alumnos afuera
              </p>
            </div>
          </div>

          {/* Controls Cluster */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Live Clock */}
            <div className="hidden lg:flex bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl items-center space-x-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <div className="leading-tight">
                <span className="font-mono tabular-nums font-bold text-slate-800 dark:text-slate-100 block">
                  {currentTime}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {currentDate}
                </span>
              </div>
            </div>

            {/* Capacity Status */}
            <div
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs ${
                isFull
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : outsideCount > 0
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              {isFull ? (
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="font-bold tabular-nums block leading-tight">
                  {outsideCount}/{maxLimit} Afuera
                </span>
                <span className="text-[10px] opacity-85 hidden sm:inline">
                  {isFull
                    ? 'Cupo completo'
                    : `${maxLimit - outsideCount} libre(s)`}
                </span>
              </div>
            </div>

            {/* Install App Button on Android/Tablet */}
            {!isInstalled && isInstallable && (
              <button
                type="button"
                onClick={install}
                className="min-h-[44px] px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Instalar App</span>
              </button>
            )}

            {/* Theme Quick Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isDarkActive ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Cambiar tema claro u oscuro"
            >
              {isDarkActive ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-colors ${
                settings.soundEnabled
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={settings.soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
              aria-label="Alternar sonido"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* History Modal Trigger */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap shrink-0"
              id="btn-history-open"
            >
              <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Historial</span>
              {completedExitsToday > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full">
                  {completedExitsToday}
                </span>
              )}
            </button>

            {/* Settings Modal Trigger */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
              title="Configuración"
              aria-label="Configuración"
              id="btn-settings-open"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Search, Filter & Return All */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar PC (ej. 12, 05)..."
                className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={onToggleOnlyOut}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                onlyOutFilter
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="tabular-nums">Solo Afuera ({outsideCount})</span>
            </button>
          </div>

          {outsideCount > 0 && (
            <div className="flex items-center space-x-2">
              {showConfirmReturnAll ? (
                <div className="flex items-center space-x-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-1 rounded-xl">
                  <span className="text-xs text-rose-800 dark:text-rose-200 font-medium px-2">
                    ¿Regresar a los {outsideCount}?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onReturnAll();
                      setShowConfirmReturnAll(false);
                    }}
                    className="min-h-[38px] px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                  >
                    Sí, Regresar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReturnAll(false)}
                    className="min-h-[38px] px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmReturnAll(true)}
                  className="min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Marcar Regreso a Todos</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
