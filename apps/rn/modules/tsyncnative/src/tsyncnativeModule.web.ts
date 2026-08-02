import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './tsyncnative.types';

type tsyncnativeModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

class tsyncnativeModule extends NativeModule<tsyncnativeModuleEvents> {
  reloadApp() {
    window.location.reload();
  }

  isIgnoringBatteryOptimizations() {}
  disableBatteryOptimizations() {}

  startConnectionWorker(): void {}
  startBatteryWorker(): void {}

  openTS(): void {}
  connectTS(): void {}
  disconnectTS(): void {}

  isRooted(): boolean {
    return false;
  }
  openTSRoot(): void {}
  connectTSRoot(): void {}

  disableOptimizationsRoot(packageName?: string): boolean {
    return false;
  }
  blockNotificationsRoot(packageName?: string): boolean {
    return false;
  }
  retrieveBatteryStatus(): string {
    return '';
  }

  isNotificationListenerEnabled(): boolean {
    return false;
  }
  startNotificationListenerService(): void {}

  retrieveApps(): string {
    return '';
  }
}

export default registerWebModule(tsyncnativeModule, 'tsyncnativeModule');
