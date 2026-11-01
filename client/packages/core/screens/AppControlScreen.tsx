import { Button, ScrollView, Switch, Text, View, YGroup, YStack } from 'tamagui';
import { getTsyncNative } from '@/store/tsyncNativeStore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState, Platform } from 'react-native';
import {
  checkLocationAccess,
  LOCATION_ACCESS_DEFAULT_VALUE,
  LocationAccessResultType,
  locationAction,
} from '@/utils/locationAccessUtils';
import {
  AppWindow,
  Battery,
  Bell,
  BellOff,
  ExternalLink,
  Key,
  MessageSquare,
  MessageSquareDot,
  Navigation,
  Plug,
  RefreshCcw,
  RefreshCw,
  Smartphone,
  SmartphoneCharging,
  Wifi,
  X,
} from '@tamagui/lucide-icons';
import { checkNotificationAccess } from '@/utils/notification';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { IconProps } from '@tamagui/helpers-icon';
import { Section } from '@/components';
import { showToast } from '@/utils/toast';
import { SheetManager } from 'react-native-actions-sheet';
import * as Updates from 'expo-updates';
import { fetchLatestRelease } from '@/features/Devices/controller/adbController';
import { useStorageDependencyStore } from '@/features/Storage/store/storageDependencyStore';
import * as Sharing from 'expo-sharing';
import { useWorkerStore } from '@/store';

interface AppControlRow {
  label: string;
  options: {
    label: string;
    shown: boolean;
    disabled?: boolean;
    toggle?: boolean;
    icon: React.ComponentType<IconProps>;
    onPress: () => void | Promise<void>;
  }[];
}

const AppControlScreen = () => {
  const isRooted = useDeviceStore((s) => s.isRooted);
  const showConnectionNotifications = useWorkerStore((s) => s.config.connection.showNotifications);
  const toggleWorkerNotifications = useWorkerStore((s) => s.toggleWorkerNotifications);

  const [isIgnoringBatteryOptimizations, setIsIgnoringBatteryOptimizations] = useState<boolean>(false);

  const [isNotificationListenerEnabled, setIsNotificationListenerEnabled] = useState<boolean>(false);

  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  const updateNotificationListenerState = () => {
    if (Platform.OS !== 'android') return;
    const res = getTsyncNative().isNotificationListenerEnabled();
    setIsNotificationListenerEnabled(res);
  };

  const updateBatteryState = () => {
    if (Platform.OS !== 'android') return;
    const res = getTsyncNative().isIgnoringBatteryOptimizations();
    setIsIgnoringBatteryOptimizations(res);
  };

  const updateNotifState = async () => {
    const res = await checkNotificationAccess(false);
    setNotificationPermission(res);
  };

  const updateStates = () => {
    updateNotificationListenerState();
    updateBatteryState();
    updateNotifState();
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', (e) => {
      if (e === 'active') updateStates();
    });

    return () => {
      sub.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      updateStates();

      return () => {
        updateStates();
      };
    }, [])
  );

  const [locationAccess, setLocationAccess] = useState<LocationAccessResultType[]>(LOCATION_ACCESS_DEFAULT_VALUE);
  const isLocationAccessChecking = useRef<boolean>(false);
  useEffect(function checkLocationAccessOnInit() {
    async function check() {
      if (isLocationAccessChecking.current) return;

      isLocationAccessChecking.current = true;
      const res = await checkLocationAccess();
      setLocationAccess(res);
      isLocationAccessChecking.current = false;
    }
    check();
    let listener = AppState.addEventListener('change', (e) => {
      if (e === 'active') check();
    });
    return () => {
      listener?.remove();
    };
  }, []);
  const haveLocationAccess = useMemo(() => {
    return {
      permission: locationAccess[0]?.access || false,
      service: locationAccess[1]?.access || false,
      precise: locationAccess[2]?.access || false,
    };
  }, [locationAccess]);

  const appControls: AppControlRow[] = useMemo(() => {
    return [
      {
        label: 'Power',
        options: [
          {
            label: 'Disable Battery Optimizations',
            shown: Platform.OS === 'android',
            disabled: isIgnoringBatteryOptimizations,
            icon: SmartphoneCharging,
            onPress: () => {
              const res = getTsyncNative().disableOptimizationsRoot();
              if (__DEV__) console.log('disableOptimizationsRoot', res);

              getTsyncNative().disableBatteryOptimizations();
            },
          },
        ],
      },
      {
        label: 'Location',
        options: [
          {
            label: 'Location: permission',
            shown: Platform.OS === 'android' || Platform.OS === 'web' || Platform.OS === 'ios',
            disabled: haveLocationAccess.permission,
            icon: Navigation,
            onPress: async () => {
              await locationAction(locationAccess);
            },
          },
          {
            label: 'Location: service',
            shown: Platform.OS === 'android' || Platform.OS === 'web' || Platform.OS === 'ios',
            disabled: haveLocationAccess.service,
            icon: Navigation,
            onPress: async () => {
              await locationAction(locationAccess);
            },
          },
          {
            label: 'Location: precise',
            shown: Platform.OS === 'android' || Platform.OS === 'ios',
            disabled: haveLocationAccess.precise,
            icon: Navigation,
            onPress: async () => {
              await locationAction(locationAccess);
            },
          },
        ],
      },
      {
        label: 'Notification',
        options: [
          {
            label: 'Notification Permission',
            shown: Platform.OS === 'android' || Platform.OS === 'ios',
            disabled: notificationPermission,
            icon: MessageSquareDot,
            onPress: async () => {
              const res = await checkNotificationAccess(true);
              setNotificationPermission(res);
            },
          },
        ],
      },
      {
        label: 'Tailscale',
        options: [
          {
            label: 'Open Tailscale',
            shown: Platform.OS === 'android',
            icon: ExternalLink,
            onPress: () => getTsyncNative().openTS(),
          },
          {
            label: 'Connect Tailscale',
            shown: Platform.OS === 'android',
            icon: Plug,
            onPress: () => getTsyncNative().connectTS(),
          },
          {
            label: 'Disconnect Tailscale',
            shown: Platform.OS === 'android',
            icon: X,
            onPress: () => getTsyncNative().disconnectTS(),
          },
        ],
      },
      {
        label: 'Connection Worker',
        options: [
          {
            label: `Start Worker`,
            shown: Platform.OS === 'android',
            icon: Wifi,
            onPress: () => {
              getTsyncNative().startConnectionWorker();
            },
          },
          {
            label: `Show Notifications`,
            shown: Platform.OS === 'android',
            toggle: showConnectionNotifications,
            icon: showConnectionNotifications ? Bell : BellOff,
            onPress: () => {
              toggleWorkerNotifications('connection');
            },
          },
        ],
      },
      {
        label: 'Other Services',
        options: [
          {
            label: 'Start Battery Service/Worker',
            shown: Platform.OS === 'android',
            icon: Battery,
            onPress: () => {
              getTsyncNative().startBatteryWorker();
            },
          },
          {
            label: 'Start Notification Listener Service',
            shown: Platform.OS === 'android',
            disabled: isNotificationListenerEnabled,
            icon: MessageSquare,
            onPress: () => {
              getTsyncNative().startNotificationListenerService();
            },
          },
        ],
      },
      {
        label: 'Diagnostics / Tests / Debug',
        options: [
          {
            label: 'Reload',
            shown: Platform.OS === 'android' || Platform.OS === 'web' || Platform.OS === 'ios',
            icon: RefreshCcw,
            onPress: async () => {
              if (Platform.OS === 'ios') {
                await Updates.reloadAsync();
                return;
              }
              getTsyncNative().reloadApp();
            },
          },
          {
            label: 'Update isRooted (Root)',
            shown: Platform.OS === 'android',
            icon: Key,
            onPress: () => {
              const isRooted = useDeviceStore.getState().updateIsRooted();
              showToast({
                text1: 'Root check result',
                text2: isRooted ? 'TRUE' : 'FALSE',
              });
            },
          },
          {
            label: 'Query installed apps',
            shown: Platform.OS === 'android',
            icon: Smartphone,
            onPress: () => {
              SheetManager.show('installed-apps-sheet');
            },
          },
          {
            label: 'Wireless ADB Module (Magisk)',
            shown: Platform.OS === 'android',
            icon: Wifi,
            onPress: async () => {
              const latest = await fetchLatestRelease();

              const fileName = latest?.assets[0]?.name;
              const downloadUrl = latest?.assets[0]?.browser_download_url;
              if (!downloadUrl || !fileName) return;

              const downloadRes = await useStorageDependencyStore.getState().downloadFn({
                url: downloadUrl,
                fileName,
              });

              if (!downloadRes?.localFilePath) return;
              const isRooted = getTsyncNative().isRooted();

              if (isRooted) {
                const isMagiskModule = getTsyncNative().isZipMagiskModule(downloadRes.localFilePath);
                if (!isMagiskModule) return;

                // TODO
                return;
              }

              await Sharing.shareAsync(downloadRes.uri!, {
                mimeType: 'application/zip',
                dialogTitle: 'Install with Magisk',
              });
            },
          },
        ],
      },
    ];
  }, [
    locationAccess,
    isIgnoringBatteryOptimizations,
    notificationPermission,
    haveLocationAccess,
    isNotificationListenerEnabled,
    isRooted,
    showConnectionNotifications,
  ]);

  return (
    <ScrollView flex={1} p={'$3'} bg={'$background'}>
      <YStack gap={'$4'}>
        {appControls.map((row) => {
          const hasOptions = row.options.length !== 0 && row.options.some((o) => o.shown === true);
          if (!hasOptions) return;
          return (
            <Section label={row.label} key={row.label}>
              <YGroup gap={'$0.5'}>
                {row.options.map((opt) => {
                  const isToggle = opt.toggle !== undefined;
                  if (!opt.shown) return null;
                  return (
                    <Button
                      key={opt.label}
                      justify="flex-start"
                      items="center"
                      width="100%"
                      height="auto"
                      px="$4"
                      py="$3"
                      icon={opt.icon}
                      disabled={opt.disabled}
                      opacity={opt.disabled ? 0.5 : 1}
                      onPress={opt.onPress}>
                      <Text flex={isToggle ? 1 : undefined}>{opt.label}</Text>

                      {isToggle ? (
                        <Switch
                          ml="auto"
                          size={'$3'}
                          themeInverse={opt.toggle}
                          checked={opt.toggle}
                          onCheckedChange={opt.onPress}>
                          <Switch.Thumb animation="medium" />
                        </Switch>
                      ) : null}
                    </Button>
                  );
                })}
              </YGroup>
            </Section>
          );
        })}
      </YStack>

      <View height={180} />
    </ScrollView>
  );
};

export default AppControlScreen;
