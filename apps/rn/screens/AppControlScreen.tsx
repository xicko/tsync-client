import { Button, ScrollView, View, YGroup, YStack } from 'tamagui';
import tsyncnativeModule from '@/modules/tsyncnative';
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
import Section from '@/components/Section';
import { showToast } from '@/utils/toast';
import { SheetManager } from 'react-native-actions-sheet';

interface AppControlRow {
  label: string;
  options: {
    label: string;
    shown: boolean;
    disabled?: boolean;
    icon: React.ComponentType<IconProps>;
    onPress: () => void | Promise<void>;
  }[];
}

const AppControlScreen = () => {
  const isRooted = useDeviceStore((s) => s.isRooted);

  const [isIgnoringBatteryOptimizations, setIsIgnoringBatteryOptimizations] = useState<boolean>(false);

  const [isNotificationListenerEnabled, setIsNotificationListenerEnabled] = useState<boolean>(false);

  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  const updateNotificationListenerState = () => {
    const res = tsyncnativeModule.isNotificationListenerEnabled();
    setIsNotificationListenerEnabled(res);
  };

  const updateBatteryState = () => {
    const res = tsyncnativeModule.isIgnoringBatteryOptimizations();
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
              const res = tsyncnativeModule.disableOptimizationsRoot();
              if (__DEV__) console.log('disableOptimizationsRoot', res);

              tsyncnativeModule.disableBatteryOptimizations();
            },
          },
        ],
      },
      {
        label: 'Location',
        options: [
          {
            label: 'Location: permission',
            shown: Platform.OS === 'android' || Platform.OS === 'web',
            disabled: haveLocationAccess.permission,
            icon: Navigation,
            onPress: async () => {
              await locationAction(locationAccess);
            },
          },
          {
            label: 'Location: service',
            shown: Platform.OS === 'android' || Platform.OS === 'web',
            disabled: haveLocationAccess.service,
            icon: Navigation,
            onPress: async () => {
              await locationAction(locationAccess);
            },
          },
          {
            label: 'Location: precise',
            shown: Platform.OS === 'android',
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
            shown: Platform.OS === 'android',
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
            onPress: () => tsyncnativeModule.openTS(),
          },
          {
            label: 'Open Tailscale (Root)',
            shown: Platform.OS === 'android' && isRooted,
            icon: ExternalLink,
            onPress: () => tsyncnativeModule.openTSRoot(),
          },
          {
            label: 'Connect Tailscale',
            shown: Platform.OS === 'android',
            icon: Plug,
            onPress: () => tsyncnativeModule.connectTS(),
          },
          {
            label: 'Disconnect Tailscale',
            shown: Platform.OS === 'android',
            icon: X,
            onPress: () => tsyncnativeModule.disconnectTS(),
          },
        ],
      },
      {
        label: 'Services',
        options: [
          {
            label: 'Start Connection Service/Worker',
            shown: Platform.OS === 'android',
            icon: Wifi,
            onPress: () => {
              tsyncnativeModule.startConnectionWorker();
            },
          },
          {
            label: 'Start Battery Service/Worker',
            shown: Platform.OS === 'android',
            icon: Battery,
            onPress: () => {
              tsyncnativeModule.startBatteryWorker();
            },
          },
          {
            label: 'Start Notification Listener Service',
            shown: Platform.OS === 'android',
            disabled: isNotificationListenerEnabled,
            icon: MessageSquare,
            onPress: () => {
              tsyncnativeModule.startNotificationListenerService();
            },
          },
        ],
      },
      {
        label: 'Diagnostics / Tests / Debug',
        options: [
          {
            label: 'Reload',
            shown: Platform.OS === 'android' || Platform.OS === 'web',
            icon: RefreshCcw,
            onPress: () => tsyncnativeModule.reloadApp(),
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
                  if (!opt.shown) return null;
                  return (
                    <Button
                      key={opt.label}
                      justify="flex-start"
                      icon={opt.icon}
                      disabled={opt.disabled}
                      opacity={opt.disabled ? 0.5 : 1}
                      onPress={opt.onPress}>
                      {opt.label}
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
