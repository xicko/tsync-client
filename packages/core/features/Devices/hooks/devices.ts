import { getDevices } from '@/features/Devices/controller/devicesController';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { useSocketStore, useStorageStore } from '@/store';
import { queryClient } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

// contains side effects
export function useDevices() {
  const query = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const data = await getDevices();

      const devicesArr = data?.devices || [];
      useDeviceStore.getState().setDevices(devicesArr);

      if (devicesArr.length > 0) useStorageStore.getState().setString('tailscaleDevices', JSON.stringify(devicesArr));
      const thisDevice = devicesArr.find((device) => device.isThisDevice === true);
      if (thisDevice) {
        const current = useDeviceStore.getState().thisTailscaleDevice;
        if (JSON.stringify(current) !== JSON.stringify(thisDevice)) {
          useDeviceStore.getState().setThisTailscaleDevice(thisDevice);
          useStorageStore.getState().setString('thisTailscaleDevice', JSON.stringify(thisDevice));
        }
      }

      if (!data) return null;
      return data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (query.dataUpdatedAt) useDeviceStore.getState().setLastDeviceUpdate(query.dataUpdatedAt);
  }, [query.dataUpdatedAt]);

  const socket = useSocketStore((s) => s.socket);
  useEffect(() => {
    if (!socket) return;
    const callback = () => queryClient.invalidateQueries({ queryKey: ['devices'] });
    socket.on('devicesUpdate', callback);
    return () => {
      socket.off('devicesUpdate', callback);
    };
  }, [socket]);

  return query;
}
