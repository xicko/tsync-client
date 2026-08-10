import { DeviceCard } from '@/features/Devices/components/DeviceCard';
import { useDevices } from '@/features/Devices/hooks/devices';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { useSocketStore } from '@/store';
import { DeviceListItem, TailscaleDevice } from '@shared/types';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, Platform, RefreshControl, ScrollView } from 'react-native';
import { Button, Spinner, Text, View, XStack, YStack } from 'tamagui';
import dayjs from 'dayjs';
import { eventEmit } from '@/utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ACTIVE_THRESHOLD_MS = 2.5 * 60 * 1_000;
function resolveIsActive(device: TailscaleDevice): boolean {
  if (!device.connectedToControl) return false;
  if (!device.lastSeen) return false;
  return Date.now() - new Date(device.lastSeen).getTime() < ACTIVE_THRESHOLD_MS;
}
function toDeviceListItem(device: TailscaleDevice): DeviceListItem {
  return {
    ...device,
    isActive: resolveIsActive(device),
  };
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function DevicesListScreen() {
  const isWeb = Platform.OS === 'web';
  const { data, isLoading, isError, refetch, isRefetching } = useDevices();
  const socket = useSocketStore((s) => s.socket);
  const setSelectedDevice = useDeviceStore((s) => s.setSelectedDevice);
  const setLastDeviceUpdate = useDeviceStore((s) => s.setLastDeviceUpdate);
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

  const devicesList = useMemo<DeviceListItem[]>(() => {
    if (!data?.devices) return [];
    const items = data.devices.map(toDeviceListItem).sort((a, b) => {
      const aLevel = a.battery?.level;
      const bLevel = b.battery?.level;

      if (aLevel == null && bLevel == null) {
        const aTime = dayjs(a.lastSeen).unix();
        const bTime = dayjs(b.lastSeen).unix();
        return bTime - aTime;
      }

      if (aLevel == null) return 1;
      if (bLevel == null) return -1;

      return aLevel - bLevel;
    });
    if (filter === 'online') return items.filter((d) => d.isActive);
    if (filter === 'offline') return items.filter((d) => !d.isActive);
    return items;
  }, [data, filter]);

  const onlineCount = useMemo(() => (data?.devices ?? []).filter((d) => resolveIsActive(d)).length, [data?.devices]);

  // Auto-refresh every 60 seconds while screen is focused
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useFocusEffect(
    useCallback(() => {
      intervalRef.current = setInterval(() => {
        refetch();
      }, 60_000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [refetch])
  );

  useEffect(function listenToRemoteRefresh() {
    const callback = () => {
      refetch();
      setLastDeviceUpdate(new Date());
    };
    eventEmit.on('refreshDevices', callback);
    return () => {
      eventEmit.off('refreshDevices', callback);
    };
  }, []);

  useEffect(
    function listenToSocket() {
      if (!socket) return;
      const callback = () => {
        refetch();
        setLastDeviceUpdate(new Date());
      };

      socket.on('devicesUpdate', callback);

      return () => {
        socket.off('devicesUpdate', callback);
      };
    },
    [socket]
  );

  const handlePress = useCallback(
    (device: DeviceListItem) => {
      setSelectedDevice(device);
      router.push({ pathname: '/device-info', params: { id: device.id } });
    },
    [router, setSelectedDevice]
  );

  const renderItem = ({ item }: ListRenderItemInfo<DeviceListItem>) => <DeviceCard item={item} onPress={handlePress} />;

  const keyExtractor = (item: DeviceListItem) => item.id;

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View flex={1} justify="center" items="center" bg="$background">
        <Spinner size="large" />
        <Text mt="$3" color="$color10">
          Fetching devices…
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View flex={1} justify="center" items="center" bg="$background">
        <Text color="$red10" fontSize="$5" fontWeight="700">
          Failed to load devices
        </Text>
        <Button mt="$4" onPress={() => refetch()}>
          Retry
        </Button>
      </View>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <View flex={1} bg="$background">
      {/* Header */}
      <XStack px="$4" py="$4" pb="$2" justify="space-between" items="flex-end">
        <YStack>
          <Text fontSize="$2" color="$color10">
            {onlineCount} online · {devicesList.length} shown
          </Text>
        </YStack>

        {/* Filter pills */}
        <XStack gap="$2">
          {(['all', 'online', 'offline'] as const).map((f) => (
            <Button key={f} size="$2" themeInverse={filter === f} onPress={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </XStack>
      </XStack>

      {/* List */}
      {isWeb ? (
        <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
          <View
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
              padding: 16,
              maxWidth: 1800,
              width: '100%',
            }}>
            {devicesList.map((item) => (
              <DeviceCard key={item.id} item={item} onPress={handlePress} />
            ))}
          </View>
          {devicesList.length === 0 && (
            <View p="$6" items="center">
              <Text color="$color10">No devices match the current filter.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList<DeviceListItem>
          data={devicesList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          ListEmptyComponent={
            <View p="$6" items="center">
              <Text color="$color10">No devices match the current filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
