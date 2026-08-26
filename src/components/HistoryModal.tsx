import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Trash2, Filter, History, Clock, Award, CheckCircle2 } from 'lucide-react';
import { ExitRecord, ExitReason } from '../types';
import { EXIT_REASONS } from '../utils/constants';
import { formatTime, formatTimestamp, formatDate } from '../utils/storage';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ExitRecord[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  const [filterReason, setFilterReason] = useState<string>('all');
  const [filterPc, setFilterPc] = useState<string>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = history.length;
    if (total === 0) {
      return { total: 0, avgSeconds: 0, longestSeconds: 0, mostActivePc: '-' };
    }

    const totalSeconds = history.reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
    const avgSeconds = Math.round(totalSeconds / total);
    const longestSeconds = Math.max(...history.map((h) => h.durationSeconds || 0), 0);

    const pcCounts: Record<number, number> = {};
    history.forEach((h) => {
      pcCounts[h.computerNumber] = (pcCounts[h.computerNumber] || 0) + 1;
    });

    let maxPc = 1;
    let maxCount = 0;
    Object.entries(pcCounts).forEach(([pc, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxPc = Number(pc);
      }
    });

    return {
      total,
      avgSeconds,
      longestSeconds,
      mostActivePc: maxCount > 0 ? `PC-${maxPc.toString().padStart(2, '0')} (${maxCount}x)` : '-',
    };
  }, [history]);

  // Filtered records
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filterReason !== 'all' && item.reason !== filterReason) {
        return false;
      }
      if (filterPc !== 'all' && item.computerNumber !== Number(filterPc)) {
        return false;
      }
      return true;
    });
  }, [history, filterReason, filterPc]);

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ['ID', 'Fecha', 'Puesto (PC)', 'Motivo', 'Detalle', 'Hora Salida', 'Hora Regreso', 'Duración (seg)', 'Duración Formato'];
    const rows = history.map((record) => [
      record.id,
      formatDate(record.startTime),
      `PC-${record.computerNumber.toString().padStart(2, '0')}`,
      EXIT_REASONS[record.reason]?.label || record.reason,
      record.customReasonNote || '',
      formatTimestamp(record.startTime),
      record.endTime ? formatTimestamp(record.endTime) : 'En curso',
      record.durationSeconds ?? '',
      record.durationSeconds ? formatTime(record.durationSeconds) : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registro_salidas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
          id="history-modal"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Historial de Salidas</h2>
                <p className="text-xs text-slate-400">
                  Registro de actividad y tiempos fuera del aula
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Salidas</span>
              <span className="text-lg font-bold text-slate-800">{stats.total}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Tiempo Promedio</span>
              <span className="text-lg font-bold text-indigo-700 font-mono">
                {stats.total > 0 ? formatTime(stats.avgSeconds) : '00:00'}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Mayor Duración</span>
              <span className="text-lg font-bold text-amber-700 font-mono">
                {stats.total > 0 ? formatTime(stats.longestSeconds) : '00:00'}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Puesto + Frecuente</span>
              <span className="text-sm font-bold text-slate-700 truncate block mt-1">
                {stats.mostActivePc}
              </span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar:</span>
              </div>

              {/* Reason Filter */}
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Todos los motivos</option>
                {(Object.keys(EXIT_REASONS) as ExitReason[]).map((r) => (
                  <option key={r} value={r}>
                    {EXIT_REASONS[r].icon} {EXIT_REASONS[r].label}
                  </option>
                ))}
              </select>

              {/* PC Filter */}
              <select
                value={filterPc}
                onChange={(e) => setFilterPc(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Todas las Computadoras (1-34)</option>
                {Array.from({ length: 34 }, (_, i) => i + 1).map((pc) => (
                  <option key={pc} value={pc}>
                    PC-{pc.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions: CSV Export & Clear */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={history.length === 0}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>

              {confirmClear ? (
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                  >
                    Confirmar Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  disabled={history.length === 0}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Table of Records */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">Sin registros de salidas</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Las salidas concluidas de los puestos aparecerán aquí detalladas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3.5 py-2.5">Puesto</th>
                      <th className="px-3.5 py-2.5">Motivo</th>
                      <th className="px-3.5 py-2.5">Salida</th>
                      <th className="px-3.5 py-2.5">Regreso</th>
                      <th className="px-3.5 py-2.5 text-right">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map((item) => {
                      const reason = EXIT_REASONS[item.reason] || EXIT_REASONS.baño;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3.5 py-2.5 font-bold text-slate-900">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono">
                              PC-{item.computerNumber.toString().padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${reason.badgeClass}`}
                            >
                              <span>{reason.icon}</span>
                              <span>{item.customReasonNote || reason.label}</span>
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600 font-mono">
                            {formatTimestamp(item.startTime)}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600 font-mono">
                            {item.endTime ? formatTimestamp(item.endTime) : (
                              <span className="text-amber-700 font-semibold">En curso</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">
                            {item.durationSeconds ? formatTime(item.durationSeconds) : '--:--'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              Mostrando {filteredHistory.length} de {history.length} registros
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
