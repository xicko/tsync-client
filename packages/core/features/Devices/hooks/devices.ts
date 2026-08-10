import { getDevices } from '@/features/Devices/controller/devicesController';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { storage } from '@/utils/storage';
import { useQuery } from '@tanstack/react-query';

// contains side effects
export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const data = await getDevices();

      const devicesArr = data?.devices || [];
      useDeviceStore.getState().setDevices(devicesArr);

      if (devicesArr.length > 0) storage.set('tailscaleDevices', JSON.stringify(devicesArr));
      const thisDevice = devicesArr.find((device) => device.isThisDevice === true);
      if (thisDevice) {
        const current = useDeviceStore.getState().thisTailscaleDevice;
        if (JSON.stringify(current) !== JSON.stringify(thisDevice)) {
          useDeviceStore.getState().setThisTailscaleDevice(thisDevice);
          storage.set('thisTailscaleDevice', JSON.stringify(thisDevice));
        }
      }

      if (!data) return null;
      return data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
