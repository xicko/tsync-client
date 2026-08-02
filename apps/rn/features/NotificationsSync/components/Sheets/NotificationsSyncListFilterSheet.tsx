import { Button, Input, Separator, Text, View, XStack, YStack, useTheme, useWindowDimensions } from 'tamagui';
import ActionSheet, { SheetManager, SheetProps, ScrollView } from 'react-native-actions-sheet';
import {
  DEFAULT_FILTERS_NOTIFICATIONS_SYNC,
  NotificationsSyncListActiveFiltersType,
  useNotificationsSyncListFilterStore,
} from '@/features/NotificationsSync/store/notificationsSyncListFilterStore';
import { useState } from 'react';
import { Check } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';
import { Image as ExpoImage } from 'expo-image';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';

const OS_ARRAY = [
  {
    value: 'all' as const,
    label: 'All',
  },
  {
    value: 'android' as const,
    label: 'Android',
    icon: <ExpoImage source={require('@/assets/images/android600.png')} style={{ width: 16, height: 16 }} />,
  },
  {
    value: 'ios' as const,
    label: 'iOS',
    icon: <ExpoImage source={require('@/assets/images/apple600.png')} style={{ width: 16, height: 16 }} />,
  },
  {
    value: 'windows' as const,
    label: 'Windows',
    icon: <ExpoImage source={require('@/assets/images/windows600.png')} style={{ width: 16, height: 16 }} />,
  },
  {
    value: 'linux' as const,
    label: 'Linux',
    icon: <ExpoImage source={require('@/assets/images/linux600.png')} style={{ width: 16, height: 16 }} />,
  },
  {
    value: 'macos' as const,
    label: 'macOS',
    icon: <ExpoImage source={require('@/assets/images/apple600.png')} style={{ width: 16, height: 16 }} />,
  },
];

const NotificationsSyncListFilterSheet: React.FC<SheetProps<'notifications-sync-list-filter-sheet'>> = ({
  sheetId,
  payload,
}) => {
  const tamaguiTheme = useTheme();
  const activeFilters = useNotificationsSyncListFilterStore((s) => s.activeFilters);
  const devices = useDeviceStore((s) => s.devices);
  const dimensions = useWindowDimensions();

  const [localFilters, setLocalFilters] = useState<NotificationsSyncListActiveFiltersType>(activeFilters);

  return (
    <ActionSheet id={sheetId} gestureEnabled containerStyle={{ backgroundColor: tamaguiTheme.background.val }}>
      <View p="$5">
        <ScrollView
          style={{
            maxHeight: dimensions.height * 0.7,
          }}>
          <YStack gap="$4">
            {/* Search */}
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="300" color="$color9">
                Search
              </Text>

              <Input
                value={localFilters.search}
                onChangeText={(text) => setLocalFilters({ ...localFilters, search: text })}
                placeholder="Search..."
              />
            </YStack>

            {/* OS Platform */}
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="300" color="$color9">
                OS Platform
              </Text>

              <XStack gap="$3" flexWrap="wrap">
                {OS_ARRAY.map((os) => (
                  <Button
                    key={os.value}
                    size={'$3'}
                    themeInverse={localFilters.os === os.value}
                    icon={os.icon}
                    onPress={() => setLocalFilters((prev) => ({ ...prev, os: os.value }))}>
                    <Text textTransform="capitalize">{os.label}</Text>
                  </Button>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="300" color="$color9" mt="$2">
                Devices
              </Text>

              <XStack gap="$3" flexWrap="wrap">
                {(devices || [])
                  .filter((f) => f.os === 'android')
                  .map((device) => (
                    <Button
                      key={device.id}
                      size={'$3'}
                      themeInverse={localFilters.tailscaleId.includes(device.id)}
                      onPress={() => {
                        if (localFilters.tailscaleId.includes(device.id)) {
                          setLocalFilters((prev) => ({
                            ...prev,
                            tailscaleId: prev.tailscaleId.filter((id) => id !== device.id),
                          }));
                        } else {
                          setLocalFilters((prev) => ({
                            ...prev,
                            tailscaleId: [...prev.tailscaleId, device.id],
                          }));
                        }
                      }}>
                      <Text>{device?.name?.split('.')[0] || device.id}</Text>
                    </Button>
                  ))}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="300" color="$color9" mt="$2">
                Time Range
              </Text>

              <XStack gap="$3" flexWrap="wrap">
                {(['any', 'today', 'yesterday', 'week'] as const).map((range) => {
                  const isSelected = (() => {
                    if (range === 'any') return localFilters.startDate === null && localFilters.endDate === null;
                    if (range === 'today') {
                      const todayStart = dayjs().startOf('day').valueOf();
                      return localFilters.startDate === todayStart;
                    }
                    if (range === 'yesterday') {
                      const yesterdayStart = dayjs().subtract(1, 'day').startOf('day').valueOf();
                      return localFilters.startDate === yesterdayStart;
                    }
                    if (range === 'week') {
                      const weekStart = dayjs().subtract(7, 'day').startOf('day').valueOf();
                      return localFilters.startDate === weekStart;
                    }
                    return false;
                  })();

                  const label = {
                    any: 'Any Time',
                    today: 'Today',
                    yesterday: 'Yesterday',
                    week: 'Past 7 Days',
                  }[range];

                  return (
                    <Button
                      key={range}
                      size={'$3'}
                      themeInverse={isSelected}
                      onPress={() => {
                        if (range === 'any') {
                          setLocalFilters((prev) => ({ ...prev, startDate: null, endDate: null }));
                        } else if (range === 'today') {
                          setLocalFilters((prev) => ({
                            ...prev,
                            startDate: dayjs().startOf('day').valueOf(),
                            endDate: dayjs().endOf('day').valueOf(),
                          }));
                        } else if (range === 'yesterday') {
                          setLocalFilters((prev) => ({
                            ...prev,
                            startDate: dayjs().subtract(1, 'day').startOf('day').valueOf(),
                            endDate: dayjs().subtract(1, 'day').endOf('day').valueOf(),
                          }));
                        } else if (range === 'week') {
                          setLocalFilters((prev) => ({
                            ...prev,
                            startDate: dayjs().subtract(7, 'day').startOf('day').valueOf(),
                            endDate: dayjs().endOf('day').valueOf(),
                          }));
                        }
                      }}>
                      <Text>{label}</Text>
                    </Button>
                  );
                })}
              </XStack>
            </YStack>
          </YStack>

          <View height={40} />
        </ScrollView>

        <Separator my="$2" />

        <XStack gap="$3">
          <Button
            onPress={() => {
              setLocalFilters(DEFAULT_FILTERS_NOTIFICATIONS_SYNC);
            }}>
            <Text>Reset</Text>
          </Button>

          <Button
            flex={1}
            icon={Check}
            themeInverse
            onPress={() => {
              useNotificationsSyncListFilterStore.getState().setActiveFilters(localFilters);
              SheetManager.hide(sheetId);
            }}>
            <Text>Apply</Text>
          </Button>
        </XStack>
      </View>
    </ActionSheet>
  );
};

export default NotificationsSyncListFilterSheet;
