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

  getWirelessAdbPort(): number | null;
  setWirelessAdbPort(port: number): boolean;
  reloadWirelessAdbPort(): string | null;

  isRooted(): boolean;
  rebootDevice(): void;
  zipFileContent(filePath: string): string[] | null;
  isZipMagiskModule(filePath: string): boolean;
  installMagiskModuleViaPath(filePath: string): string | null;
}

export default requireNativeModule<tsyncnativeModule>('tsyncnative');
