import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock } from 'lucide-react';
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          id="exit-reason-modal"
        >
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-lg tabular-nums">
                #{pcNumber.toString().padStart(2, '0')}
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">Autorizar Salida</h3>
                <p className="text-xs text-slate-400">
                  Computadora PC-{pcNumber.toString().padStart(2, '0')}
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

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2.5">
                Motivo de salida del estudiante
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(EXIT_REASONS) as ExitReason[]).map((reasonKey) => {
                  const info = EXIT_REASONS[reasonKey];
                  const isSelected = selectedReason === reasonKey;
                  return (
                    <button
                      key={reasonKey}
                      type="button"
                      onClick={() => setSelectedReason(reasonKey)}
                      className={`min-h-[54px] flex items-center p-3 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 font-semibold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-2xl mr-2.5 select-none">{info.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm leading-snug truncate">{info.label}</p>
                        {reasonKey === 'baño' && (
                          <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold">
                            Principal
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedReason === 'otro' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Especificar motivo (opcional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ej. Buscar material con prof. Carlos"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  maxLength={60}
                />
              </motion.div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/70 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-900 dark:text-amber-200">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">El temporizador iniciará inmediatamente.</span>
                <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  El cupo se liberará automáticamente al marcar su regreso.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                id="btn-confirm-exit"
              >
                Registrar Salida
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
