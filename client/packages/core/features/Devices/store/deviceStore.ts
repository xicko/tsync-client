import { updateBatteryStatus } from '@/features/Devices/controller/devicesController';
import { getTsyncNative } from '@/store/tsyncNativeStore';
import { DeviceListItem, TailscaleDevice } from '@shared/types';
import { create } from 'zustand';
import { useStorageStore } from '@/store';
import { Platform } from 'react-native';
import * as Battery from 'expo-battery';

interface DeviceStoreState {
  devices: TailscaleDevice[];
  setDevices: (devices: TailscaleDevice[]) => void;

  selectedDevice: DeviceListItem | null;
  setSelectedDevice: (device: DeviceListItem) => void;
  clearSelectedDevice: () => void;

  lastDeviceUpdate: Date | number | null;
  setLastDeviceUpdate: (date: Date | number) => void;

  thisTailscaleDevice: TailscaleDevice | null;
  setThisTailscaleDevice: (device: TailscaleDevice) => void;

  isRooted: boolean;
  updateIsRooted: () => boolean;

  updateBatteryStatus: () => Promise<boolean>;
}

export const useDeviceStore = create<DeviceStoreState>((set, get) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),

  selectedDevice: null,
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  clearSelectedDevice: () => set({ selectedDevice: null }),

  lastDeviceUpdate: null,
  setLastDeviceUpdate: (date) => set({ lastDeviceUpdate: date }),

  thisTailscaleDevice: (() => {
    try {
      const cached = useStorageStore.getState().getString('thisTailscaleDevice');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  })(),
  setThisTailscaleDevice: (device) => set({ thisTailscaleDevice: device }),

  isRooted: false,
  updateIsRooted: () => {
    let res = false;
    try {
      if (Platform.OS !== 'android') throw new Error('Platform not supported');
      res = getTsyncNative().isRooted();
    } catch (error) {
      if (error instanceof Error && __DEV__) console.log('isRooted', error.message);
    }

    set({ isRooted: res });

    return res;
  },

  updateBatteryStatus: async () => {
    try {
      const thisTailscaleDevice = get().thisTailscaleDevice;

      let res: string | null = await getTsyncNative().retrieveBatteryStatus();

      if (!res) {
        const isBatterySupported = await Battery?.isAvailableAsync?.();
        if (isBatterySupported) {
          try {
            const level = await Battery.getBatteryLevelAsync();
            const isCharging = (await Battery.getBatteryStateAsync()) === Battery.BatteryState.CHARGING;
            res = `${Math.round(level * 100)}:${String(isCharging)}:${Date.now()}`;
          } catch {}
        }
      }

      if (!res) return false;

      const [l, p, t] = res?.split(':');

      const level = Number(l);
      const isPlugged = p === 'true';
      const timestamp = Number(t);

      if (!thisTailscaleDevice?.id || isNaN(level) || isNaN(timestamp)) return false;

      const result = await updateBatteryStatus(thisTailscaleDevice?.id, {
        level,
        isPlugged,
        timestamp,
      });

      return result;
    } catch {
      return false;
    }
  },
}));
