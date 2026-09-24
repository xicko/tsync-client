import { useFonts } from 'expo-font';
import { router, Stack, usePathname, useRootNavigationState } from 'expo-router';
import { AppState, Platform } from 'react-native';
import { TamaguiProvider, useTheme } from 'tamagui';
import { tamaguiConfig } from '@/theme/tamagui.config';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils';
import { headerTextStyle } from '@/constants/theme.constants';
import { StackNavDefaultBackButton } from '@/components/StackNavDefaultBackButton';
import { StatusBar } from 'expo-status-bar';
import { useDomainStore, useStorageStore } from '@/store';
import { useEffect, useState, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/theme/toastConfig';
import { SheetProvider } from 'react-native-actions-sheet';
import { Sheets } from '@/components/Sheets/Sheets';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useThemeStore } from '@/store/themeStore';
import * as SystemUI from 'expo-system-ui';
import { useDeviceStore } from '@/features/Devices/store/deviceStore';
import {
  initializeOneSignal,
  setupOneSignalUser,
  addNotificationClickListener,
  requestNotificationPermission,
} from '@/utils/onesignal';
import { NotificationClickEvent } from 'react-native-onesignal';
import { storage } from '@/utils/storage';
import Constants from 'expo-constants';
import { useStorageDependencyStore } from '@/features/Storage/store/storageDependencyStore';
import { nativeDownloadFn, nativeUploadFn } from '../adapters';
import * as SplashScreen from 'expo-splash-screen';

(() => {
  SystemUI.setBackgroundColorAsync('black');

  SplashScreen.preventAutoHideAsync();

  const isWeb = Platform.OS === 'web';

  if (!isWeb) {
    useStorageStore.setState({
      getAllKeys: () => storage.getAllKeys(),
      getString: (key) => storage.getString(key) ?? null,
      setString: (key, value) => storage.set(key, value),
      delete: (key) => storage.delete(key),
      clearAll: () => storage.clearAll(),
    });
  }

  // initialize domain store
  useDomainStore.getState().initDomain(Constants.expoConfig?.extra?.EXPO_PUBLIC_BASE_API_URL || '');

  initializeOneSignal();
})();

function RootLayoutContent() {
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const isNavigationReady = !!rootNavigationState?.key;
  const thisTailscaleDevice = useDeviceStore((s) => s.thisTailscaleDevice);
  if (__DEV__) console.log(pathname);

  // THEME
  const tamaguiTheme = useTheme();
  const theme = useThemeStore((s) => s.theme);

  // FONT
  const [loaded] = useFonts({
    Inter_100Thin: require('../../../packages/core/assets/fonts/Inter/Inter_Thin.ttf'),
    Inter_200ExtraLight: require('../../../packages/core/assets/fonts/Inter/Inter_ExtraLight.ttf'),
    Inter_300Light: require('../../../packages/core/assets/fonts/Inter/Inter_Light.ttf'),
    Inter_400Regular: require('../../../packages/core/assets/fonts/Inter/Inter_Regular.ttf'),
    Inter_500Medium: require('../../../packages/core/assets/fonts/Inter/Inter_Medium.ttf'),
    Inter_600SemiBold: require('../../../packages/core/assets/fonts/Inter/Inter_SemiBold.ttf'),
    Inter_700Bold: require('../../../packages/core/assets/fonts/Inter/Inter_Bold.ttf'),
    Inter_800ExtraBold: require('../../../packages/core/assets/fonts/Inter/Inter_ExtraBold.ttf'),
    Inter_900Black: require('../../../packages/core/assets/fonts/Inter/Inter_Black.ttf'),
    Inter_100ThinItalic: require('../../../packages/core/assets/fonts/Inter/Inter_ThinItalic.ttf'),
    Inter_200ExtraLightItalic: require('../../../packages/core/assets/fonts/Inter/Inter_ExtraLightItalic.ttf'),
    Inter_300LightItalic: require('../../../packages/core/assets/fonts/Inter/Inter_LightItalic.ttf'),
    Inter_400RegularItalic: require('../../../packages/core/assets/fonts/Inter/Inter_Italic.ttf'),
    Inter_500MediumItalic: require('../../../packages/core/assets/fonts/Inter/Inter_MediumItalic.ttf'),
    Inter_600SemiBoldItalic: require('../../../packages/core/assets/fonts/Inter/Inter_SemiBoldItalic.ttf'),
    Inter_700BoldItalic: require('../../../packages/core/assets/fonts/Inter/Inter_BoldItalic.ttf'),
    Inter_800ExtraBoldItalic: require('../../../packages/core/assets/fonts/Inter/Inter_ExtraBoldItalic.ttf'),
    Inter_900BlackItalic: require('../../../packages/core/assets/fonts/Inter/Inter_BlackItalic.ttf'),
  });

  useEffect(() => {
    if (loaded && isNavigationReady) void SplashScreen.hideAsync();
  }, [isNavigationReady, loaded]);

  // lololol
  useEffect(function injectAtRuntime() {
    const isWeb = Platform.OS === 'web';
    if (!isWeb)
      useStorageDependencyStore.setState({
        uploadFn: nativeUploadFn,
        downloadFn: nativeDownloadFn,
      });
  }, []);

  // PUSH NOTIFICATION
  const [canOneSignalLogin, setCanOneSignalLogin] = useState(false);
  const pendingNotificationTarget = useRef<{ pathname: string; params?: any } | null>(null);
  useEffect(
    function initOneSignal() {
      const handleNotificationClick = (e: NotificationClickEvent) => {
        const customData = e.notification.additionalData as {
          type: string;
          data?: unknown;
        };

        if (customData.type === 'STORAGE_UPLOAD') {
          const target = {
            pathname: '/tabs/storage' as const,
            params:
              typeof customData.data === 'object'
                ? {
                    file: JSON.stringify(customData.data),
                  }
                : undefined,
          };

          if (!isNavigationReady) {
            pendingNotificationTarget.current = target;
          } else {
            router.push(target);
          }

          return;
        }
      };

      const removeListener = addNotificationClickListener(handleNotificationClick);

      (async () => {
        if (Platform.OS === 'web') return;
        await requestNotificationPermission();
        setCanOneSignalLogin(true);
      })();

      return () => {
        removeListener?.();
      };
    },
    [isNavigationReady]
  );
  useEffect(
    function loginOneSignal() {
      if (Platform.OS === 'web' || !canOneSignalLogin) return;
      const id = thisTailscaleDevice?.id;
      if (!id) return;
      setupOneSignalUser(id);
    },
    [thisTailscaleDevice?.id, canOneSignalLogin]
  );
  useEffect(
    function routeAfterNavReadyPN() {
      if (isNavigationReady && pendingNotificationTarget.current) {
        const target = pendingNotificationTarget.current;
        pendingNotificationTarget.current = null;
        setTimeout(() => {
          router.push(target as any);
        }, 200);
      }
    },
    [isNavigationReady]
  );

  useEffect(function appStateListener() {
    const callback = () => {
      useDeviceStore.getState().updateIsRooted();
      useDeviceStore.getState().updateBatteryStatus();
    };
    callback();
    const sub = AppState.addEventListener('change', (e) => {
      const isFocused = e === 'active';
      if (isFocused) callback();
      focusManager.setFocused(isFocused);
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
        {Platform.OS === 'android' ? <StatusBar style={theme === 'light' ? 'dark' : 'light'} /> : null}

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
