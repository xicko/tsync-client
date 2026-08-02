import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { AppState, Platform } from 'react-native';
import { TamaguiProvider, useTheme } from 'tamagui';
import { tamaguiConfig } from '@/theme/tamagui.config';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils/query';
import { headerTextStyle } from '@/constants/theme.constants';
import { StackNavDefaultBackButton } from '@/components/StackNavDefaultBackButton';
import { StatusBar } from 'expo-status-bar';
import { useSocketStore } from '@/store/socketStore';
import { useEffect, useState } from 'react';
import { showToast } from '@/utils/toast';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/theme/toastConfig';
import { SheetProvider } from 'react-native-actions-sheet';
import { Sheets } from '@/components/Sheets/Sheets';
import { NotificationClickEvent, OneSignal } from 'react-native-onesignal';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import tsyncnativeModule from '@/modules/tsyncnative';
import Constants from 'expo-constants';
import { useThemeStore } from '@/store/themeStore';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { pingServer } from '@/controller/sysController';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';

setBackgroundColorAsync('black');

OneSignal.initialize(Constants.expoConfig?.extra?.EXPO_PUBLIC_ONESIGNAL_APPID);
OneSignal.setConsentRequired(false);
OneSignal.setConsentGiven(true);

function RootLayoutContent() {
  const pathname = usePathname();
  if (__DEV__) console.log(pathname);

  const thisTailscaleDevice = useDeviceStore((s) => s.thisTailscaleDevice);

  // THEME
  const theme = useThemeStore((s) => s.theme);
  const tamaguiTheme = useTheme();

  // FONT
  const [loaded] = useFonts({
    Inter_100Thin: require('../assets/fonts/Inter/Inter_Thin.ttf'),
    Inter_200ExtraLight: require('../assets/fonts/Inter/Inter_ExtraLight.ttf'),
    Inter_300Light: require('../assets/fonts/Inter/Inter_Light.ttf'),
    Inter_400Regular: require('../assets/fonts/Inter/Inter_Regular.ttf'),
    Inter_500Medium: require('../assets/fonts/Inter/Inter_Medium.ttf'),
    Inter_600SemiBold: require('../assets/fonts/Inter/Inter_SemiBold.ttf'),
    Inter_700Bold: require('../assets/fonts/Inter/Inter_Bold.ttf'),
    Inter_800ExtraBold: require('../assets/fonts/Inter/Inter_ExtraBold.ttf'),
    Inter_900Black: require('../assets/fonts/Inter/Inter_Black.ttf'),
    Inter_100ThinItalic: require('../assets/fonts/Inter/Inter_ThinItalic.ttf'),
    Inter_200ExtraLightItalic: require('../assets/fonts/Inter/Inter_ExtraLightItalic.ttf'),
    Inter_300LightItalic: require('../assets/fonts/Inter/Inter_LightItalic.ttf'),
    Inter_400RegularItalic: require('../assets/fonts/Inter/Inter_Italic.ttf'),
    Inter_500MediumItalic: require('../assets/fonts/Inter/Inter_MediumItalic.ttf'),
    Inter_600SemiBoldItalic: require('../assets/fonts/Inter/Inter_SemiBoldItalic.ttf'),
    Inter_700BoldItalic: require('../assets/fonts/Inter/Inter_BoldItalic.ttf'),
    Inter_800ExtraBoldItalic: require('../assets/fonts/Inter/Inter_ExtraBoldItalic.ttf'),
    Inter_900BlackItalic: require('../assets/fonts/Inter/Inter_BlackItalic.ttf'),
  });

  // SOCKET
  const socket = useSocketStore((s) => s.socket);
  const connectSocket = useSocketStore((s) => s.connectSocket);
  const disconnectSocket = useSocketStore((s) => s.disconnectSocket);
  useEffect(function initConnectSocket() {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);
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

  // PUSH NOTIFICATION
  const [canOneSignalLogin, setCanOneSignalLogin] = useState(false);
  useEffect(function initOneSignal() {
    const handleNotificationClick = (e: NotificationClickEvent) => {
      const customData = e.notification.additionalData as Record<string, any>;
      // TODO
    };

    OneSignal.Notifications.addEventListener('click', handleNotificationClick);

    (async () => {
      if (Platform.OS === 'web') return;
      const hasPermission = await OneSignal.Notifications.getPermissionAsync();
      if (!hasPermission) {
        await OneSignal.Notifications.requestPermission(true);
      }
      OneSignal.User.pushSubscription.optIn();
      await new Promise((resolve) => setTimeout(resolve, 100));
      setCanOneSignalLogin(true);
    })();

    return () => {
      OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
    };
  }, []);
  useEffect(() => {
    if (Platform.OS === 'web' || !canOneSignalLogin) return;
    const id = thisTailscaleDevice?.id;
    if (!id) return;
    OneSignal.login(id);
  }, [thisTailscaleDevice?.id, canOneSignalLogin]);

  // Ping server
  useEffect(function pingServerListener() {
    let isMounted = true;
    let prevIsConnected = false;
    let failCount = 0;

    const interval = setInterval(async () => {
      if (!isMounted) return;
      const isConnected = await pingServer();

      if (!isConnected) {
        failCount++;
        if (failCount >= 10) tsyncnativeModule.connectTS();
      } else {
        failCount = 0;
      }

      const connected = isConnected && !prevIsConnected;
      const disconnected = !isConnected && prevIsConnected;

      if (connected) {
        showToast({
          text1: 'Connected to server',
        });
        connectSocket();
      } else if (disconnected) {
        showToast({
          text1: 'Disconnected from server',
        });
      }
      prevIsConnected = isConnected;
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(function appStateListener() {
    const callback = () => {
      useDeviceStore.getState().updateIsRooted();
      useDeviceStore.getState().updateBatteryStatus();
    };
    callback();
    const sub = AppState.addEventListener('change', (e) => {
      if (e === 'active') callback();
    });
    return () => sub.remove();
  }, []);

  // UI
  const headerTitleStyle = { ...headerTextStyle, color: tamaguiTheme.color.val };
  const headerStyle = { backgroundColor: tamaguiTheme.background.val };

  if (!loaded) return null;

  return (
    <KeyboardProvider>
      <SheetProvider>
        {Platform.OS === 'android' ? <StatusBar style="auto" /> : null}

        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: tamaguiTheme.background.val,
            },
          }}>
          <Stack.Screen name="tabs" options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen
            name="device-info"
            options={{
              headerShown: true,
              animation: 'fade',
              headerTitle: '',
              headerTitleStyle: headerTitleStyle,
              headerTitleAlign: 'center',
              headerStyle: headerStyle,
              headerShadowVisible: false,
              headerLeft: () => StackNavDefaultBackButton(),
            }}
          />

          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              animation: 'fade',
              headerTitle: 'Settings',
              headerTitleStyle: headerTitleStyle,
              headerTitleAlign: 'center',
              headerStyle: headerStyle,
              headerShadowVisible: false,
              headerLeft: () => StackNavDefaultBackButton(),
            }}
          />
        </Stack>

        <Sheets />

        <Toast config={toastConfig} />
      </SheetProvider>
    </KeyboardProvider>
  );
}

export default function RootLayout() {
  // THEME
  const theme = useThemeStore((s) => s.theme);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        <RootLayoutContent />
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
