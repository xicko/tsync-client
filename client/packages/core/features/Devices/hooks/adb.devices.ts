import { fetchLatestRelease, getConnectedAdbDevices } from '@/features/Devices/controller/adbController';
import { FetchLatestReleaseParams, GitHubRelease } from '../types/github-release.interface';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Platform } from 'react-native';

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

export function useWirelessAdbRelease(
  params?: FetchLatestReleaseParams,
  options?: Omit<UseQueryOptions<GitHubRelease | null>, 'queryKey' | 'queryFn'>
) {
  const repoKey = params?.repoFullName || `${params?.owner ?? 'xicko'}/${params?.repo ?? 'wireless-adb-magisk'}`;

  const query = useQuery({
    queryKey: ['wireless-adb-release', repoKey],
    queryFn: () => fetchLatestRelease(params),
    enabled: Platform.OS === 'android' && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 15,
    ...options,
  });

  return query;
}
