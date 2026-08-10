import * as Notifications from 'expo-notifications';

export async function checkNotificationAccess(request: boolean): Promise<boolean> {
  let res: boolean = false;

  let fp = await Notifications.getPermissionsAsync();
  if (fp.canAskAgain && !fp.granted) {
    if (request) fp = await Notifications.requestPermissionsAsync();
  }

  res = fp.granted;

  return res;
}
