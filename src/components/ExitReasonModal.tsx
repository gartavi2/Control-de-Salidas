import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { ExitReason } from '../types';
import { EXIT_REASONS } from '../utils/constants';

interface ExitReasonModalProps {
  isOpen: boolean;
  pcNumber: number | null;
  onClose: () => void;
  onConfirm: (pcNumber: number, reason: ExitReason, customNote?: string) => void;
}

export const ExitReasonModal: React.FC<ExitReasonModalProps> = ({
  isOpen,
  pcNumber,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<ExitReason>('baño');
  const [customNote, setCustomNote] = useState('');

  if (!isOpen || pcNumber === null) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(pcNumber, selectedReason, customNote.trim() ? customNote.trim() : undefined);
    setCustomNote('');
    setSelectedReason('baño');
  };

  const handleQuickSelect = (reason: ExitReason) => {
    setSelectedReason(reason);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          id="exit-reason-modal"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                #{pcNumber.toString().padStart(2, '0')}
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">Autorizar Salida</h3>
                <p className="text-xs text-slate-400">Computadora PC-{pcNumber.toString().padStart(2, '0')}</p>
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

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
                Motivo de Salida del Estudiante
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(EXIT_REASONS) as ExitReason[]).map((reasonKey) => {
                  const info = EXIT_REASONS[reasonKey];
                  const isSelected = selectedReason === reasonKey;
                  return (
                    <button
                      key={reasonKey}
                      type="button"
                      onClick={() => handleQuickSelect(reasonKey)}
                      className={`flex items-center p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="text-2xl mr-2.5 select-none">{info.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm leading-snug truncate">{info.label}</p>
                        {reasonKey === 'baño' && (
                          <span className="text-[10px] text-indigo-700 uppercase font-semibold">Principal</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom note if needed */}
            {selectedReason === 'otro' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1"
              >
                <label className="block text-xs font-medium text-slate-700">
                  Especificar motivo (opcional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ej. Buscar material con prof. Carlos"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={60}
                />
              </motion.div>
            )}

            {/* Rules reminder info badge */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">El temporizador iniciará inmediatamente.</span>
                <p className="text-amber-800/90 mt-0.5">
                  El cupo se liberará automáticamente en cuanto marques su regreso en la pantalla.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-2"
                id="btn-confirm-exit"
              >
                <span>Registrar Salida</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
