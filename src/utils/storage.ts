import { ComputerState, ExitRecord, AppSettings } from '../types';
import { TOTAL_COMPUTERS, DEFAULT_SETTINGS } from './constants';

const STORAGE_KEYS = {
  COMPUTERS: 'exit_control_computers_v1',
  HISTORY: 'exit_control_history_v1',
  SETTINGS: 'exit_control_settings_v1',
};

const IDB_NAME = 'ControlSalidasLocalDB';
const IDB_VERSION = 1;
const IDB_STORE = 'app_state';

function createDefaultComputers(): ComputerState[] {
  return Array.from({ length: TOTAL_COMPUTERS }, (_, i) => ({
    number: i + 1,
    isOut: false,
  }));
}

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function requestAndroidPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false;
  }
  try {
    const alreadyPersisted = await navigator.storage.persisted();
    if (alreadyPersisted) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function hydrateFromIndexedDB(): Promise<{
  computers: ComputerState[] | null;
  history: ExitRecord[] | null;
  settings: AppSettings | null;
}> {
  const [idbComputers, idbHistory, idbSettings] = await Promise.all([
    idbGet<ComputerState[]>(STORAGE_KEYS.COMPUTERS),
    idbGet<ExitRecord[]>(STORAGE_KEYS.HISTORY),
    idbGet<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS),
  ]);

  // Seed IndexedDB if localStorage has data from an earlier session
  if (!idbComputers) {
    const lsComputers = getInitialComputers();
    void idbSet(STORAGE_KEYS.COMPUTERS, lsComputers);
  }
  if (!idbHistory) {
    const lsHistory = getHistory();
    if (lsHistory.length > 0) void idbSet(STORAGE_KEYS.HISTORY, lsHistory);
  }
  if (!idbSettings) {
    const lsSettings = getSettings();
    void idbSet(STORAGE_KEYS.SETTINGS, lsSettings);
  }

  return {
    computers:
      Array.isArray(idbComputers) && idbComputers.length === TOTAL_COMPUTERS
        ? idbComputers
        : null,
    history: Array.isArray(idbHistory) ? idbHistory : null,
    settings: idbSettings ? { ...DEFAULT_SETTINGS, ...idbSettings } : null,
  };
}

export function getInitialComputers(): ComputerState[] {
  if (typeof window === 'undefined') {
    return createDefaultComputers();
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

  return createDefaultComputers();
}

export function saveComputers(computers: ComputerState[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPUTERS, JSON.stringify(computers));
  } catch (e) {
    console.error('Error saving computers state:', e);
  }
  void idbSet(STORAGE_KEYS.COMPUTERS, computers);
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
  void idbSet(STORAGE_KEYS.HISTORY, history);
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
  void idbSet(STORAGE_KEYS.SETTINGS, settings);
}

export interface LocalBackupPayload {
  version: number;
  exportedAt: string;
  computers: ComputerState[];
  history: ExitRecord[];
  settings: AppSettings;
}

export function exportLocalBackup(
  computers: ComputerState[],
  history: ExitRecord[],
  settings: AppSettings
): void {
  const payload: LocalBackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    computers,
    history,
    settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `respaldo_salidas_aula_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseLocalBackup(rawJson: string): LocalBackupPayload | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<LocalBackupPayload>;
    if (
      !Array.isArray(parsed.computers) ||
      parsed.computers.length !== TOTAL_COMPUTERS ||
      !Array.isArray(parsed.history) ||
      !parsed.settings
    ) {
      return null;
    }
    return {
      version: parsed.version || 1,
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      computers: parsed.computers,
      history: parsed.history,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch {
    return null;
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
