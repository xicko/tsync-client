import { create } from 'zustand';

export interface TsyncNativeMethods {
  reloadApp(): Promise<void>;
  isIgnoringBatteryOptimizations(): boolean;
  disableBatteryOptimizations(packageName?: string): void;
  startConnectionWorker(): void;
  startBatteryWorker(): void;
  openTS(): void;
  connectTS(): void;
  disconnectTS(): void;
  isRooted(): boolean;
  openTSRoot(): void;
  connectTSRoot(): void;
  disableOptimizationsRoot(packageName?: string): boolean;
  blockNotificationsRoot(packageName?: string): boolean;
  retrieveBatteryStatus(): Promise<string | null>;
  isNotificationListenerEnabled(): boolean;
  startNotificationListenerService(): void;
  retrieveApps(): string;
}

const noopImpl: TsyncNativeMethods = {
  reloadApp: () => Promise.resolve(),
  isIgnoringBatteryOptimizations: () => true,
  disableBatteryOptimizations: () => {},
  startConnectionWorker: () => {},
  startBatteryWorker: () => {},
  openTS: () => {},
  connectTS: () => {},
  disconnectTS: () => {},
  isRooted: () => false,
  openTSRoot: () => {},
  connectTSRoot: () => {},
  disableOptimizationsRoot: () => false,
  blockNotificationsRoot: () => false,
  retrieveBatteryStatus: () => Promise.resolve(null),
  isNotificationListenerEnabled: () => false,
  startNotificationListenerService: () => {},
  retrieveApps: () => '[]',
};

interface TsyncNativeStoreState {
  impl: TsyncNativeMethods;
  setImpl: (impl: TsyncNativeMethods) => void;
}

export const useTsyncNativeStore = create<TsyncNativeStoreState>((set) => ({
  impl: noopImpl,
  setImpl: (impl) => set({ impl }),
}));

// Non-reactive accessor for call sites that just invoke a method.
export const getTsyncNative = (): TsyncNativeMethods => useTsyncNativeStore.getState().impl;
