import { showToast } from './toast';
import * as IntentLauncher from 'expo-intent-launcher';

export async function onDisableBatteryOptimization() {
  try {
    const bgLocation = await import('xicko-background-location' as any);
    const isIgnoringBatteryOptimizations: any = bgLocation.default.isIgnoringBatteryOptimizations;

    let res = null;

    const isIgnoringBO: boolean = isIgnoringBatteryOptimizations();
    if (isIgnoringBO) {
      showToast({
        text1: 'Already disabled',
      });
      return;
    }

    if (!res) {
      if (__DEV__) console.log('onDisableBatteryOptimization');
      res = await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
    }

    if (__DEV__) console.log(JSON.stringify(res, null, 2));

    showToast({
      text1: 'Disabled',
    });
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error);
    showToast({
      text1: 'Failed to disable battery optimization',
    });
  }
}
