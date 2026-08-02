import { NativeModule, requireNativeModule } from 'expo';

import { tsyncnativeModuleEvents } from './tsyncnative.types';

declare class tsyncnativeModule extends NativeModule<tsyncnativeModuleEvents> {
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
  retrieveBatteryStatus(): Promise<string>;

  isNotificationListenerEnabled(): boolean;
  startNotificationListenerService(): void;

  retrieveApps(): string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<tsyncnativeModule>('tsyncnative');
