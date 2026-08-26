import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Volume2, VolumeX, Shield, Clock, LayoutGrid, RotateCcw } from 'lucide-react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_SETTINGS });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          id="settings-modal"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Configuración del Aula</h3>
                <p className="text-xs text-slate-400">Reglas de cupos y alertas de tiempo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Max Students Limit */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Límite Máximo de Estudiantes Afuera (Cupos)</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={form.maxAllowedOutside}
                  onChange={(e) => setForm({ ...form, maxAllowedOutside: Number(e.target.value) })}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />
                <span className="w-12 text-center py-1 font-bold text-base bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg">
                  {form.maxAllowedOutside}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Regla institucional: Máximo {form.maxAllowedOutside} estudiante(s) fuera a la vez.
              </p>
            </div>

            {/* Time Alert Thresholds */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Aviso Preventivo (Minutos)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.warningTimeMinutes}
                  onChange={(e) => setForm({ ...form, warningTimeMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 block">Resalta la tarjeta en amarillo</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Alerta Crítica (Minutos)</span>
                </label>
                <input
                  type="number"
                  min={2}
                  max={60}
                  value={form.criticalTimeMinutes}
                  onChange={(e) => setForm({ ...form, criticalTimeMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 block">Alerta roja por tiempo excesivo</span>
              </div>
            </div>

            {/* Sound toggle & View Mode */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Efectos Sonoros</span>
                  <span className="text-[11px] text-slate-500">
                    Sonidos de confirmación y timbre al salir/regresar
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, soundEnabled: !form.soundEnabled })}
                  className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                    form.soundEnabled
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {form.soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 text-indigo-600" />
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

              {/* Classroom Layout Style */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Organización Visual</span>
                  <span className="text-[11px] text-slate-500">Distribución de las 34 computadoras</span>
                </div>
                <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, viewMode: 'grid' })}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      form.viewMode === 'grid'
                        ? 'bg-white shadow-2xs text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cuadrícula
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, viewMode: 'classroom' })}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      form.viewMode === 'classroom'
                        ? 'bg-white shadow-2xs text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Filas de Aula
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
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
