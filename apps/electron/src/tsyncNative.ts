/* eslint-disable @typescript-eslint/no-empty-function */
import type { TsyncNativeMethods } from '@shared/core';
import { getBatteryStatus } from './utils/battery';

const unsupported = (method: string) => () => {
  console.warn(`tsyncNative.${method}() is not supported on desktop`);
};

export const tsyncNativeElectronImpl: TsyncNativeMethods = {
  reloadApp: async () => {
    window.location.reload();
  },
  isIgnoringBatteryOptimizations: () => true,
  disableBatteryOptimizations: unsupported('disableBatteryOptimizations'),
  startConnectionWorker: () => {},
  startBatteryWorker: () => {},
  openTS: unsupported('openTS'),
  connectTS: unsupported('connectTS'),
  disconnectTS: unsupported('disconnectTS'),
  isRooted: () => false,
  openTSRoot: unsupported('openTSRoot'),
  connectTSRoot: () => {},
  disableOptimizationsRoot: () => {
    unsupported('disableOptimizationsRoot')();
    return false;
  },
  blockNotificationsRoot: () => {
    unsupported('blockNotificationsRoot')();
    return false;
  },
  retrieveBatteryStatus: async () => getBatteryStatus(),
  isNotificationListenerEnabled: () => false,
  startNotificationListenerService: unsupported('startNotificationListenerService'),
  retrieveApps: () => {
    unsupported('retrieveApps')();
    return '[]';
  },
};
