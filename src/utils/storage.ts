import { ComputerState, ExitRecord, AppSettings } from '../types';
import { TOTAL_COMPUTERS, DEFAULT_SETTINGS } from './constants';

const STORAGE_KEYS = {
  COMPUTERS: 'exit_control_computers_v1',
  HISTORY: 'exit_control_history_v1',
  SETTINGS: 'exit_control_settings_v1',
};

export function getInitialComputers(): ComputerState[] {
  if (typeof window === 'undefined') {
    return Array.from({ length: TOTAL_COMPUTERS }, (_, i) => ({
      number: i + 1,
      isOut: false,
    }));
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPUTERS);
    if (saved) {
      const parsed: ComputerState[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === TOTAL_COMPUTERS) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading saved computers state:', e);
  }

  return Array.from({ length: TOTAL_COMPUTERS }, (_, i) => ({
    number: i + 1,
    isOut: false,
  }));
}

export function saveComputers(computers: ComputerState[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPUTERS, JSON.stringify(computers));
  } catch (e) {
    console.error('Error saving computers state:', e);
  }
}

export function getHistory(): ExitRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading history:', e);
  }
  return [];
}

export function saveHistory(history: ExitRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history:', e);
  }
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}
