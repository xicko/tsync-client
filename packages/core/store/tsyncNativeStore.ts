import { create } from 'zustand';

export interface TsyncNativeMethods {
  reloadApp(): Promise<void>;
  retrieveApps(): string;

  isIgnoringBatteryOptimizations(): boolean;
  disableBatteryOptimizations(packageName?: string): void;
  disableOptimizationsRoot(packageName?: string): boolean;
  retrieveBatteryStatus(): Promise<string | null>;

  startConnectionWorker(): void;
  startBatteryWorker(): void;

  isNotificationListenerEnabled(): boolean;
  startNotificationListenerService(): void;
  blockNotificationsRoot(packageName?: string): boolean;

  openTS(): void;
  connectTS(): void;
  disconnectTS(): void;

  isRooted(): boolean;
}

const noopImpl: TsyncNativeMethods = {
  reloadApp: () => Promise.resolve(),
  retrieveApps: () => '[]',

  isIgnoringBatteryOptimizations: () => true,
  disableBatteryOptimizations: () => {},
  disableOptimizationsRoot: () => false,
  retrieveBatteryStatus: () => Promise.resolve(null),

  startConnectionWorker: () => {},
  startBatteryWorker: () => {},

  isNotificationListenerEnabled: () => false,
  startNotificationListenerService: () => {},
  blockNotificationsRoot: () => false,

  openTS: () => {},
  connectTS: () => {},
  disconnectTS: () => {},

  isRooted: () => false,
};

interface TsyncNativeStoreState {
  impl: TsyncNativeMethods;
  setImpl: (impl: TsyncNativeMethods) => void;
}

export const useTsyncNativeStore = create<TsyncNativeStoreState>((set) => ({
  impl: noopImpl,
  setImpl: (impl) => set({ impl }),
}));

export const getTsyncNative = (): TsyncNativeMethods => useTsyncNativeStore.getState().impl;
