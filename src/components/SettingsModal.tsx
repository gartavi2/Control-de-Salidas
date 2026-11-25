import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Shield,
  Clock,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Map as MapIcon,
  LayoutGrid,
  Rows3,
  HardDrive,
  Download,
  Upload,
} from 'lucide-react';
import { AppSettings, ComputerState, ExitRecord, ThemeMode, ViewMode } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';
import { exportLocalBackup, parseLocalBackup, LocalBackupPayload } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  computers: ComputerState[];
  history: ExitRecord[];
  isStoragePersisted: boolean;
  onSave: (settings: AppSettings) => void;
  onRestoreBackup: (payload: LocalBackupPayload) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  computers,
  history,
  isStoragePersisted,
  onSave,
  onRestoreBackup,
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [restoreFeedback, setRestoreFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...settings });
      setRestoreFeedback(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_SETTINGS });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseLocalBackup(content);
      if (!parsed) {
        setRestoreFeedback({
          type: 'error',
          text: 'El archivo seleccionado no es un respaldo válido.',
        });
        return;
      }
      onRestoreBackup(parsed);
      setForm(parsed.settings);
      setRestoreFeedback({
        type: 'success',
        text: `Respaldo restaurado (${parsed.history.length} registros).`,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const viewOptions: { id: ViewMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'croquis',
      label: 'Croquis del Lab',
      desc: 'Según mapa real (34 PCs)',
      icon: <MapIcon className="w-4 h-4" />,
    },
    {
      id: 'grid',
      label: 'Cuadrícula',
      desc: 'Orden numérico 01–34',
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      id: 'classroom',
      label: 'Filas de Aula',
      desc: 'Grupos de 6 estaciones',
      icon: <Rows3 className="w-4 h-4" />,
    },
  ];

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Claro', icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', label: 'Oscuro', icon: <Moon className="w-4 h-4" /> },
    { id: 'system', label: 'Sistema', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
          id="settings-modal"
        >
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Configuración del Aula</h3>
                <p className="text-xs text-slate-400">
                  Organización visual, tema oscuro y almacenamiento local
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Organización Visual (Croquis / Cuadrícula / Filas) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                Organización Visual
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Elige cómo distribuir las 34 computadoras en la pantalla
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {viewOptions.map((opt) => {
                  const active = form.viewMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, viewMode: opt.id })}
                      id={`setting-view-${opt.id}`}
                      className={`min-h-[60px] p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 active:scale-[0.98] ${
                        active
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span
                        className={`mt-0.5 shrink-0 ${
                          active
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {opt.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="text-xs font-bold block leading-tight">{opt.label}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {opt.desc}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apariencia / Modo Oscuro */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    Apariencia (Modo Oscuro)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Ajusta el contraste para iluminación del aula
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {themeOptions.map((t) => {
                    const active = form.themeMode === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm({ ...form, themeMode: t.id })}
                        className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          active
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {t.icon}
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Max Students Limit */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Límite máximo de estudiantes afuera (Cupos)</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={form.maxAllowedOutside}
                  onChange={(e) => setForm({ ...form, maxAllowedOutside: Number(e.target.value) })}
                  className="flex-1 h-8 accent-indigo-600 cursor-pointer"
                />
                <span className="w-12 py-1.5 text-center font-bold text-base tabular-nums bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl">
                  {form.maxAllowedOutside}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regla institucional · Máximo {form.maxAllowedOutside} estudiante(s) fuera a la vez.
              </p>
            </div>

            {/* Time Alert Thresholds */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Aviso preventivo (min)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.warningTimeMinutes}
                  onChange={(e) => setForm({ ...form, warningTimeMinutes: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3 py-2 text-sm tabular-nums bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Alerta crítica (min)</span>
                </label>
                <input
                  type="number"
                  min={2}
                  max={60}
                  value={form.criticalTimeMinutes}
                  onChange={(e) => setForm({ ...form, criticalTimeMinutes: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3 py-2 text-sm tabular-nums bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                  Efectos sonoros
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Timbre de confirmación al salir, regresar o bloquear cupo
                </span>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, soundEnabled: !form.soundEnabled })}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl border transition-colors flex items-center gap-2 text-xs font-semibold shrink-0 ${
                  form.soundEnabled
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {form.soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Activado</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span>Silenciado</span>
                  </>
                )}
              </button>
            </div>

            {/* Local Android Persistence & Backup */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      Guardado local en el dispositivo (sin nube)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      IndexedDB + Almacenamiento local · {history.length} registro(s) guardados
                      {isStoragePersisted ? ' · Protección persistente activa' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => exportLocalBackup(computers, history, form)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Guardar respaldo (.json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restaurar respaldo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>

              {restoreFeedback && (
                <p
                  className={`text-xs font-medium ${
                    restoreFeedback.type === 'success'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {restoreFeedback.text}
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[44px] px-3 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restablecer</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
