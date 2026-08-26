export type ExitReason = 'baño' | 'agua' | 'enfermeria' | 'biblioteca' | 'coordinacion' | 'otro';

export interface ExitReasonInfo {
  id: ExitReason;
  label: string;
  icon: string;
  color: string;
  bgLight: string;
  borderLight: string;
  badgeClass: string;
}

export interface ExitRecord {
  id: string;
  computerNumber: number;
  reason: ExitReason;
  customReasonNote?: string;
  startTime: number; // timestamp in ms
  endTime?: number;   // timestamp in ms
  durationSeconds?: number;
}

export interface ComputerState {
  number: number;
  isOut: boolean;
  activeExitId?: string;
  startTime?: number;
  reason?: ExitReason;
  customReasonNote?: string;
}

export interface AppSettings {
  maxAllowedOutside: number;
  warningTimeMinutes: number;
  criticalTimeMinutes: number;
  soundEnabled: boolean;
  viewMode: 'grid' | 'classroom';
  classroomName: string;
}
