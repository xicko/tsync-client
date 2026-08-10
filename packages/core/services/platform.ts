import { create } from 'zustand';

export interface PlatformAPI {
  isRooted: () => boolean;
  getBatteryStatus: () => Promise<{ level: number; isPlugged: boolean; timestamp: number } | null>;
  connectTS: () => void;
}

export const usePlatformAPI = create<{
  api: PlatformAPI | null;
  register: (api: PlatformAPI) => void;
}>((set) => ({
  api: null,
  register: (api) => set({ api }),
}));
