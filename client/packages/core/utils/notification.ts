import * as Notifications from 'expo-notifications';

export async function checkNotificationAccess(request: boolean): Promise<boolean> {
  try {
    let res: boolean = false;

    let fp = await Notifications.getPermissionsAsync();
    if (fp.canAskAgain && !fp.granted) {
      if (request) fp = await Notifications.requestPermissionsAsync();
    }

    res = fp.granted;

    return res;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.warn(error.message);
    return false;
  }
}
