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
  retrieveApps: () => {
    unsupported('retrieveApps')();
    return '[]';
  },

  isIgnoringBatteryOptimizations: () => true,
  disableBatteryOptimizations: unsupported('disableBatteryOptimizations'),
  disableOptimizationsRoot: () => {
    unsupported('disableOptimizationsRoot')();
    return false;
  },
  retrieveBatteryStatus: async () => getBatteryStatus(),

  startConnectionWorker: () => {},
  startBatteryWorker: () => {},

  isNotificationListenerEnabled: () => false,
  startNotificationListenerService: unsupported('startNotificationListenerService'),
  blockNotificationsRoot: () => {
    unsupported('blockNotificationsRoot')();
    return false;
  },

  openTS: unsupported('openTS'),
  connectTS: unsupported('connectTS'),
  disconnectTS: unsupported('disconnectTS'),

  getWirelessAdbPort: () => null,
  setWirelessAdbPort: () => false,
  reloadWirelessAdbPort: () => null,

  isRooted: () => false,
  rebootDevice: unsupported('rebootDevice'),
  zipFileContent: () => null,
  isZipMagiskModule: () => false,
  installMagiskModuleViaPath: () => {
    unsupported('installMagiskModuleViaPath')();
    return null;
  },
};
