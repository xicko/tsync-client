import { updateBatteryStatus } from '@/features/Devices/controller/devicesController';
import tsyncnativeModule from '@/modules/tsyncnative';
import { DeviceListItem, TailscaleDevice } from '@shared/types';
import { create } from 'zustand';

interface DeviceStoreState {
  devices: TailscaleDevice[];
  setDevices: (devices: TailscaleDevice[]) => void;

  selectedDevice: DeviceListItem | null;
  setSelectedDevice: (device: DeviceListItem) => void;
  clearSelectedDevice: () => void;

  lastDeviceUpdate: Date | null;
  setLastDeviceUpdate: (date: Date) => void;

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

  thisTailscaleDevice: null,
  setThisTailscaleDevice: (device) => set({ thisTailscaleDevice: device }),

  isRooted: false,
  updateIsRooted: () => {
    let res = false;
    try {
      res = tsyncnativeModule.isRooted();
    } catch (error) {
      if (error instanceof Error && __DEV__) console.log('isRooted', error.message);
    }

    set({ isRooted: res });

    return res;
  },

  updateBatteryStatus: async () => {
    const thisTailscaleDevice = get().thisTailscaleDevice;

    const res = await tsyncnativeModule.retrieveBatteryStatus();

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
  },
}));
