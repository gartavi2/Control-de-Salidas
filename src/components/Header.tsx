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
  Filter
} from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  totalComputers: number;
  outsideCount: number;
  maxLimit: number;
  completedExitsToday: number;
  settings: AppSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onlyOutFilter: boolean;
  onToggleOnlyOut: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onReturnAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalComputers,
  outsideCount,
  maxLimit,
  completedExitsToday,
  settings,
  searchQuery,
  onSearchChange,
  onlyOutFilter,
  onToggleOnlyOut,
  onOpenHistory,
  onOpenSettings,
  onToggleSound,
  onReturnAll,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showConfirmReturnAll, setShowConfirmReturnAll] = useState(false);

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="app-header">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Classroom Context */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
                  Control de Salidas de Aula
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {totalComputers} PCs
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Pases de salida al baño y pasillo • Máx. {maxLimit} alumnos afuera
              </p>
            </div>
          </div>

          {/* Center Status Indicators & Live Clock */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            {/* Clock Widget */}
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <div className="leading-tight">
                <span className="font-mono font-bold text-slate-800 block text-xs">{currentTime}</span>
                <span className="text-[10px] text-slate-500 capitalize">{currentDate}</span>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs ${
                isFull
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : outsideCount > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {isFull ? (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="font-bold block leading-tight">
                  {outsideCount}/{maxLimit} Afuera
                </span>
                <span className="text-[10px] opacity-80">
                  {isFull
                    ? 'Cupo Completo'
                    : `${maxLimit - outsideCount} cupo(s) libre(s)`}
                </span>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                settings.soundEnabled
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
              }`}
              title={settings.soundEnabled ? 'Sonido Activado' : 'Sonido Silenciado'}
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
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              id="btn-history-open"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Historial</span>
              {completedExitsToday > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {completedExitsToday}
                </span>
              )}
            </button>

            {/* Settings Modal Trigger */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Configuración"
              aria-label="Configuración"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Search, Filter, and Return All Shortcut */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar PC (ej. 12, 05)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={onToggleOnlyOut}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1 whitespace-nowrap transition-colors ${
                onlyOutFilter
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Solo Afuera ({outsideCount})</span>
            </button>
          </div>

          {/* Return All Confirmation Button */}
          {outsideCount > 0 && (
            <div className="flex items-center space-x-2">
              {showConfirmReturnAll ? (
                <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                  <span className="text-[11px] text-rose-800 font-medium px-1">¿Regresar a los {outsideCount}?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onReturnAll();
                      setShowConfirmReturnAll(false);
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-2xs"
                  >
                    Sí, Regresar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReturnAll(false)}
                    className="px-1.5 py-0.5 text-[11px] text-slate-600 hover:bg-rose-100 rounded"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmReturnAll(true)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center space-x-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
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
