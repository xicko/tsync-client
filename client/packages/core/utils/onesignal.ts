import { OneSignal, NotificationClickEvent } from 'react-native-onesignal';
import Constants from 'expo-constants';

let isInitialized = false;

export function initializeOneSignal() {
  const appId = Constants.expoConfig?.extra?.EXPO_PUBLIC_ONESIGNAL_APPID;
  if (appId) {
    OneSignal.initialize(appId);
    OneSignal.setConsentRequired(false);
    OneSignal.setConsentGiven(true);
    isInitialized = true;
  }
}

export function setupOneSignalUser(deviceId: string) {
  if (!isInitialized) return;
  OneSignal.login(deviceId);
}

export function addNotificationClickListener(handler: (e: NotificationClickEvent) => void) {
  if (!isInitialized) return () => {};
  OneSignal.Notifications.addEventListener('click', handler);
  return () => {
    OneSignal.Notifications.removeEventListener('click', handler);
  };
}

export async function requestNotificationPermission() {
  if (!isInitialized) return;
  const hasPermission = await OneSignal.Notifications.getPermissionAsync();
  if (!hasPermission) {
    await OneSignal.Notifications.requestPermission(true);
  }
  OneSignal.User.pushSubscription.optIn();
}
