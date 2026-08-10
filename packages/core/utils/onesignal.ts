import { OneSignal, NotificationClickEvent } from 'react-native-onesignal';
import Constants from 'expo-constants';

export function initializeOneSignal() {
  const appId = Constants.expoConfig?.extra?.EXPO_PUBLIC_ONESIGNAL_APPID;
  if (appId) {
    OneSignal.initialize(appId);
    OneSignal.setConsentRequired(false);
    OneSignal.setConsentGiven(true);
  }
}

export function setupOneSignalUser(deviceId: string) {
  OneSignal.login(deviceId);
}

export function addNotificationClickListener(handler: (e: NotificationClickEvent) => void) {
  OneSignal.Notifications.addEventListener('click', handler);
  return () => {
    OneSignal.Notifications.removeEventListener('click', handler);
  };
}

export async function requestNotificationPermission() {
  const hasPermission = await OneSignal.Notifications.getPermissionAsync();
  if (!hasPermission) {
    await OneSignal.Notifications.requestPermission(true);
  }
  OneSignal.User.pushSubscription.optIn();
}
