import { storage } from '@/utils/storage';
import { create } from 'zustand';
import { Platform } from 'react-native';

export type WorkerId = 'connection' | 'battery';

export interface WorkerOptions {
  showNotifications: boolean;
}

export type WorkersConfig = Record<WorkerId, WorkerOptions>;

export const DEFAULT_WORKERS_CONFIG: WorkersConfig = {
  connection: { showNotifications: true },
  battery: { showNotifications: true },
};

const STORAGE_KEY = 'workers_config';

function loadStoredConfig(): WorkersConfig {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        raw = localStorage.getItem(STORAGE_KEY);
      }
    } else {
      raw = storage.getString(STORAGE_KEY) ?? null;
    }

    if (!raw) return DEFAULT_WORKERS_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      connection: {
        ...DEFAULT_WORKERS_CONFIG.connection,
        ...(parsed?.connection || {}),
      },
      battery: {
        ...DEFAULT_WORKERS_CONFIG.battery,
        ...(parsed?.battery || {}),
      },
    };
  } catch {
    return DEFAULT_WORKERS_CONFIG;
  }
}

function persistConfig(config: WorkersConfig) {
  try {
    const raw = JSON.stringify(config);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, raw);
      }
    } else {
      storage.set(STORAGE_KEY, raw);
    }
  } catch (err) {
    console.error('Failed to persist workers config:', err);
  }
}

export interface WorkerState {
  config: WorkersConfig;
  setWorkerOptions: (workerId: WorkerId, options: Partial<WorkerOptions>) => void;
  toggleWorkerNotifications: (workerId: WorkerId) => void;
}

export const useWorkerStore = create<WorkerState>((set) => ({
  config: loadStoredConfig(),
  setWorkerOptions: (workerId, options) => {
    set((state) => {
      const updated = {
        ...state.config,
        [workerId]: {
          ...state.config[workerId],
          ...options,
        },
      };
      persistConfig(updated);
      return { config: updated };
    });
  },
  toggleWorkerNotifications: (workerId) => {
    set((state) => {
      const current = state.config[workerId] ?? DEFAULT_WORKERS_CONFIG[workerId];
      const updated = {
        ...state.config,
        [workerId]: {
          ...current,
          showNotifications: !current.showNotifications,
        },
      };
      persistConfig(updated);
      return { config: updated };
    });
  },
}));
