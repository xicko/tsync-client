import { router, Tabs } from 'expo-router';
import { headerTextStyle } from '@/constants/theme.constants';
import { useSocketStore } from '@/store';
import { RefreshCcw, Settings } from '@tamagui/lucide-icons';
import { Button, useTheme } from 'tamagui';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import { useState, useEffect, useRef } from 'react';
import { SheetManager } from 'react-native-actions-sheet';
import CustomTabBar from '@/components/CustomTabBar';
import { useDevices } from '@/features/Devices/hooks/devices';
import { getTsyncNative } from '@/store/tsyncNativeStore';
import { AppState, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Constants from 'expo-constants';
import { eventEmit, showToast } from '@/utils';
import DevicesHeaderRight from '@/features/Devices/components/Header/SocketConnectionHeader';
import { pingServer } from '@/controller/sysController';

export default function TabsLayout() {
  const lastDeviceUpdate = useDeviceStore((s) => s.lastDeviceUpdate);
  const tamaguiTheme = useTheme();
  const thisTailscaleDevice = useDeviceStore((s) => s.thisTailscaleDevice);

  useDevices();

  // SOCKET
  const socket = useSocketStore((s) => s.socket);
  const connectSocket = useSocketStore((s) => s.connectSocket);
  const disconnectSocket = useSocketStore((s) => s.disconnectSocket);
  const deviceId = thisTailscaleDevice?.id;
  const deviceRef = useRef(thisTailscaleDevice);
  useEffect(() => {
    deviceRef.current = thisTailscaleDevice;
  }, [thisTailscaleDevice]);
  useEffect(
    function initConnectSocket() {
      const currentDevice = deviceRef.current;
      if (currentDevice) connectSocket(currentDevice);
      return () => {
        disconnectSocket();
      };
    },
    [deviceId, connectSocket, disconnectSocket]
  );
  useEffect(
    function socketToast() {
      if (socket) {
        showToast({
          text1: 'Connected to server',
        });
      } else {
        showToast({
          text1: 'Disconnected from server',
        });
      }
    },
    [socket]
  );
  useEffect(
    function pingServerListener() {
      let isMounted = true;
      let prevIsConnected = false;
      let failCount = 0;

      const interval = setInterval(async () => {
        if (!isMounted) return;
        const isConnected = await pingServer();

        if (!isConnected) {
          failCount++;
          if (failCount >= 10) getTsyncNative().connectTS();
        } else {
          failCount = 0;
        }

        const connected = isConnected && !prevIsConnected;
        const disconnected = !isConnected && prevIsConnected;

        if (connected) {
          showToast({
            text1: 'Connected to server',
          });
          const currentDevice = deviceRef.current;
          if (currentDevice) connectSocket(currentDevice);
        } else if (disconnected) {
          showToast({
            text1: 'Disconnected from server',
          });
        }
        prevIsConnected = isConnected;
      }, 5000);

      return () => clearInterval(interval);
    },
    [deviceId, connectSocket]
  );

  useEffect(function checkBatteryOptimizations() {
    const callback = async () => {
      if (Platform.OS === 'web' || Platform.OS === 'ios') return;
      await new Promise((resolve) => setTimeout(resolve, 500));
      const res = getTsyncNative().isIgnoringBatteryOptimizations();
      if (!res) {
        SheetManager.show('ignore-battery-optimizations-sheet');
      } else {
        SheetManager.hide('ignore-battery-optimizations-sheet');
        getTsyncNative().startConnectionWorker();
        getTsyncNative().startBatteryWorker();
      }
    };
    callback();
    const sub = AppState.addEventListener('change', (e) => {
      if (e === 'active') callback();
    });
    return () => sub.remove();
  }, []);

  // UI styles
  const headerTitleStyle = { ...headerTextStyle, color: tamaguiTheme.color.val };
  const headerStyle = { backgroundColor: tamaguiTheme.background.val };

  // Block UI if headless
  const [isHeadless] = useState<boolean>(
    (() => {
      const HEADLESS = Constants.default.expoConfig?.extra?.EXPO_PUBLIC_HEADLESS_STR;
      return !!(HEADLESS && String(Device.modelName).toLowerCase().includes(HEADLESS));
    })()
  );
  useEffect(
    function handleHeadless() {
      if (isHeadless) getTsyncNative().connectTSRoot();
    },
    [isHeadless]
  );
  if (isHeadless) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Devices',
          headerTitleStyle: headerTitleStyle,
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
          headerShadowVisible: false,

          headerRight: () => <DevicesHeaderRight socket={socket} lastDeviceUpdate={lastDeviceUpdate} />,
          headerLeft: () => {
            return (
              <Button
                aspectRatio={1}
                icon={Settings}
                self={'center'}
                justify="center"
                items="center"
                m={'$3'}
                p={0}
                onPress={() => router.push('/settings')}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="crons"
        options={{
          headerShown: true,
          headerTitle: 'Crons',
          headerTitleStyle: headerTitleStyle,
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
          headerShadowVisible: false,
        }}
      />

      <Tabs.Screen
        name="shell"
        options={{
          headerShown: true,
          headerTitle: 'Shell',
          headerTitleStyle: headerTitleStyle,
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
          headerShadowVisible: false,
        }}
      />

      <Tabs.Screen
        name="appcontrol"
        options={{
          headerShown: true,
          headerTitle: 'App Control',
          headerTitleStyle: headerTitleStyle,
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
          headerShadowVisible: false,
        }}
      />

      <Tabs.Screen
        name="message"
        options={{
          headerShown: true,
          headerTitle: 'Message',
          headerTitleStyle: headerTitleStyle,
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
          headerShadowVisible: false,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: true,
          headerTitle: 'Notifications',
          headerTitleStyle: headerTitleStyle,
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
          headerShadowVisible: false,

          headerLeft: () => {
            return (
              <Button
                aspectRatio={1}
                icon={RefreshCcw}
                self={'center'}
                justify="center"
                items="center"
                m={'$3'}
                p={0}
                onPress={() => eventEmit.emit('refreshNotificationsSyncList')}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="storage"
        options={{
          headerShown: true,
          headerTitle: 'Storage',
          headerTitleStyle: headerTitleStyle,
          headerTitleAlign: 'center',
          headerStyle: headerStyle,
          headerShadowVisible: false,
        }}
      />
    </Tabs>
  );
}
