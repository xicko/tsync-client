import { useNotificationsSyncList } from '@/features/NotificationsSync/hooks/notifications-sync';
import { eventEmit } from '@/utils/eventEmit';
import { Filter, Settings } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, RefreshControl } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { View, ScrollView, YGroup, Button, Text, YStack, Spinner, Image } from 'tamagui';
import { useNotificationsSyncListFilterStore } from '@/features/NotificationsSync/store/notificationsSyncListFilterStore';
import { NotificationsActiveFilters } from '@/features/NotificationsSync/components/NotificationsActiveFilters';

import relativeTime from 'dayjs/plugin/relativeTime';
import { useSocketStore } from '@/store/socketStore';
import { CollectedNotificationItemType } from '../controller/notificationsSyncController';
dayjs.extend(relativeTime);

const NotificationsListScreen = () => {
  const isWeb = Platform.OS === 'web';
  const now = dayjs();
  const socket = useSocketStore((s) => s.socket);
  const activeFilters = useNotificationsSyncListFilterStore((s) => s.activeFilters);

  const {
    data: globalNotifications,
    refetch: refetchNotificationsSync,
    fetchNextPage: fetchNextPageNotificationsSync,
    hasNextPage: hasNextPageNotificationsSync,
    isFetchingNextPage: isFetchingNextPageNotificationsSync,
    isRefetching: isRefetchingNotificationsSync,
    isLoading: isLoadingNotificationsSync,
  } = useNotificationsSyncList(activeFilters);
  const [localNotifications, setLocalNotifications] = useState<CollectedNotificationItemType[]>([]);
  const globalNotifs = useMemo(() => {
    const flattened = globalNotifications?.pages?.flatMap((page) => page?.data || []) || [];
    const merged = [...flattened, ...localNotifications];
    const seen = new Set<string>();
    const deduplicated = merged.filter((item) => {
      const duplicate = seen.has(item._id);
      seen.add(item._id);
      return !duplicate;
    });
    return deduplicated.sort((a, b) => b.timestamp - a.timestamp);
  }, [globalNotifications, localNotifications]);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom && hasNextPageNotificationsSync && !isFetchingNextPageNotificationsSync)
      fetchNextPageNotificationsSync();
  };

  const onRefresh = () => {
    setLocalNotifications([]);
    refetchNotificationsSync();
  };

  useEffect(() => {
    const callback = () => onRefresh();
    eventEmit.on('refreshNotificationsSyncList', callback);
    return () => {
      eventEmit.off('refreshNotificationsSyncList', callback);
    };
  }, []);

  useEffect(
    function listenToSocket() {
      if (!socket) return;
      const callback = (message: object) => {
        setLocalNotifications((prev) => [message as CollectedNotificationItemType, ...prev]);
      };
      socket.on('receiveNotification', callback);
      return () => {
        socket.off('receiveNotification', callback);
      };
    },
    [socket]
  );

  return (
    <View flex={1} bg="$background" gap="$3" px="$3">
      {/* Filters */}
      <NotificationsActiveFilters />

      <View flex={1} gap="$2">
        {/* Notifications list */}
        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={isRefetchingNotificationsSync} onRefresh={onRefresh} />}>
          <YGroup gap="$0.5">
            {(() => {
              if (globalNotifs.length === 0 && !isLoadingNotificationsSync) {
                return (
                  <View justify="center" items="center" py="$8">
                    <Text color="$color9">No notifications.</Text>
                  </View>
                );
              }

              return globalNotifs.map((notif, i) => {
                const isFirst = i === 0;
                const isLast = i === globalNotifs.length - 1;
                const timestamp = dayjs(notif.timestamp);
                let format = 'MM/DD - HH:mm:ss';
                if (timestamp.year() !== now.year()) format = 'YYYY/MM/DD - HH:mm:ss';
                return (
                  <Button
                    key={notif._id}
                    height={'auto'}
                    py="$3"
                    width={'100%'}
                    items="flex-start"
                    gap={'$1'}
                    style={{
                      borderTopLeftRadius: isFirst ? 8 : 0,
                      borderTopRightRadius: isFirst ? 8 : 0,
                      borderBottomLeftRadius: isLast ? 8 : 0,
                      borderBottomRightRadius: isLast ? 8 : 0,
                    }}>
                    {notif?.icon ? (
                      <Image
                        source={{
                          uri: notif.icon,
                        }}
                        width={40}
                        height={40}
                        borderRadius={8}
                      />
                    ) : (
                      <View width={40} height={40} bg="$color3" rounded={8} />
                    )}

                    <YStack flex={1} items="flex-start">
                      <Text fontSize={'$4'} fontWeight={600} style={{ textAlign: 'left' }}>
                        {notif.android.title}
                      </Text>

                      {notif.android.text ? (
                        <Text fontSize={'$4'} fontWeight={500} style={{ textAlign: 'left' }}>
                          {notif.android.text || 'No text.'}
                        </Text>
                      ) : null}

                      {notif.tailscaleDevice?.name ? (
                        <Text color="$color8">{notif?.tailscaleDevice?.name?.split('.')[0] || ''}</Text>
                      ) : null}

                      <Text color="$color8">{notif.android.packageName}</Text>

                      <Text color="$color8">
                        {timestamp.format(format)} ({timestamp.fromNow()})
                      </Text>
                    </YStack>
                  </Button>
                );
              });
            })()}

            {isFetchingNextPageNotificationsSync ? (
              <View height={160} width={'100%'} justify="center" items="center">
                <Spinner size={'large'} color="$color10" />
              </View>
            ) : (
              <View height={160} />
            )}
          </YGroup>
        </ScrollView>

        {isLoadingNotificationsSync || isRefetchingNotificationsSync ? (
          <View
            position="absolute"
            t={0}
            b={0}
            l={0}
            r={0}
            justify={'center'}
            items="center"
            bg={'$background'}
            opacity={0.3}
            pointerEvents="none">
            <Spinner color={'$color12'} size="large" />
          </View>
        ) : null}
      </View>

      <YGroup position="absolute" r={24} b={24}>
        <Button
          themeInverse
          aspectRatio={1}
          icon={<Settings scale={isWeb ? 2 : undefined} />}
          onPress={(e) => {
            e.stopPropagation();
            SheetManager.show('denylist-list-sheet');
          }}
        />

        <Button
          themeInverse
          aspectRatio={1}
          icon={<Filter scale={isWeb ? 2 : undefined} />}
          onPress={(e) => {
            e.stopPropagation();
            SheetManager.show('notifications-sync-list-filter-sheet');
          }}
        />
      </YGroup>
    </View>
  );
};

export default NotificationsListScreen;
