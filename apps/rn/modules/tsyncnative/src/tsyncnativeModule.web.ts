import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './tsyncnative.types';

type tsyncnativeModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

class tsyncnativeModule extends NativeModule<tsyncnativeModuleEvents> {
  async reloadApp(): Promise<void> {
    window.location.reload();
  }
  retrieveApps(): string {
    return '[]';
  }

  isIgnoringBatteryOptimizations(): boolean {
    return true;
  }
  disableBatteryOptimizations(packageName?: string): void {}
  disableOptimizationsRoot(packageName?: string): boolean {
    return false;
  }
  async retrieveBatteryStatus(): Promise<string | null> {
    return null;
  }

  startConnectionWorker(): void {}
  startBatteryWorker(): void {}

  isNotificationListenerEnabled(): boolean {
    return false;
  }
  startNotificationListenerService(): void {}
  blockNotificationsRoot(packageName?: string): boolean {
    return false;
  }

  openTS(): void {}
  connectTS(): void {}
  disconnectTS(): void {}

  getWirelessAdbPort(): number | null {
    return null;
  }
  setWirelessAdbPort(port: number): boolean {
    return false;
  }
  reloadWirelessAdbPort(): string | null {
    return null;
  }

  isRooted(): boolean {
    return false;
  }
  rebootDevice(): void {}
  zipFileContent(filePath: string): string[] | null {
    return null;
  }
  isZipMagiskModule(filePath: string): boolean {
    return false;
  }
  installMagiskModuleViaPath(filePath: string): string | null {
    return null;
  }
}

export default registerWebModule(tsyncnativeModule, 'tsyncnativeModule');
