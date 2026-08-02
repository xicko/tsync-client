import { getConnectedAdbDevices } from '@/features/Devices/controller/adbController';
import { useQuery } from '@tanstack/react-query';

export function useAdbDevices() {
  return useQuery({
    queryKey: ['adb-devices'],
    queryFn: async () => {
      const data = await getConnectedAdbDevices();

      if (!data) return null;
      return data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
