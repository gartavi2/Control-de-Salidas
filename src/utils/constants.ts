import { ExitReason, ExitReasonInfo, AppSettings } from '../types';

export const TOTAL_COMPUTERS = 34;
export const MAX_OUTSIDE_LIMIT = 3;

export const EXIT_REASONS: Record<ExitReason, ExitReasonInfo> = {
  baño: {
    id: 'baño',
    label: 'Ir al Baño',
    icon: '🚻',
    color: '#0284c7', // sky-600
    bgLight: 'bg-sky-50 text-sky-700',
    borderLight: 'border-sky-200',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  agua: {
    id: 'agua',
    label: 'Tomar Agua',
    icon: '💧',
    color: '#06b6d4', // cyan-500
    bgLight: 'bg-cyan-50 text-cyan-700',
    borderLight: 'border-cyan-200',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  enfermeria: {
    id: 'enfermeria',
    label: 'Enfermería',
    icon: '🏥',
    color: '#e11d48', // rose-600
    bgLight: 'bg-rose-50 text-rose-700',
    borderLight: 'border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  biblioteca: {
    id: 'biblioteca',
    label: 'Biblioteca',
    icon: '📚',
    color: '#8b5cf6', // violet-500
    bgLight: 'bg-violet-50 text-violet-700',
    borderLight: 'border-violet-200',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-300',
  },
  coordinacion: {
    id: 'coordinacion',
    label: 'Coordinación / Dirección',
    icon: '📋',
    color: '#f59e0b', // amber-500
    bgLight: 'bg-amber-50 text-amber-700',
    borderLight: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  otro: {
    id: 'otro',
    label: 'Otra Salida',
    icon: '📍',
    color: '#64748b', // slate-500
    bgLight: 'bg-slate-100 text-slate-700',
    borderLight: 'border-slate-300',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  maxAllowedOutside: MAX_OUTSIDE_LIMIT,
  warningTimeMinutes: 5,
  criticalTimeMinutes: 10,
  soundEnabled: true,
  viewMode: 'croquis',
  themeMode: 'light',
  classroomName: 'Laboratorio de Informática',
};

/**
 * Exact spatial arrangement from the classroom sketch (excluding teacher PC):
 * - Left Wall (top to bottom): 12 -> 7, [Puerta], 6 -> 1
 * - Center Table (Mesa Central):
 *     Left side (top to bottom): 13 -> 18
 *     Right side (top to bottom): 24 -> 19
 * - Right Wall (top to bottom): 25 -> 34
 * - Front (bottom): Pizarra & Zona Docente (no clickable PC)
 */
export const CROQUIS_LAYOUT = {
  leftWallBack: [12, 11, 10, 9, 8, 7],
  leftWallFront: [6, 5, 4, 3, 2, 1],
  mesaCentralLeft: [13, 14, 15, 16, 17, 18],
  mesaCentralRight: [24, 23, 22, 21, 20, 19],
  rightWall: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
} as const;
