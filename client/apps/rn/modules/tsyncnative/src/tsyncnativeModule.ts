import { NativeModule, requireNativeModule } from 'expo';

import { tsyncnativeModuleEvents } from './tsyncnative.types';

declare class tsyncnativeModule extends NativeModule<tsyncnativeModuleEvents> {
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

export default requireNativeModule<tsyncnativeModule>('tsyncnative');
