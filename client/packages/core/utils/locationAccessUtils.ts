import * as Location from 'expo-location';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { Linking } from 'react-native';

export const locationAction = async (locationAccess: LocationAccessResultType[]) => {
  if (locationAccess[0].needManualConfiguration || !locationAccess[0].access) {
    await Linking.openSettings();
    return;
  } else if (locationAccess[1].needManualConfiguration) {
    await startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
  } else if (locationAccess[2].needManualConfiguration) {
    await Linking.openSettings();
  }
};

async function checkLocationPermission(): Promise<Location.LocationPermissionResponse | null> {
  try {
    return await Location.getForegroundPermissionsAsync();
  } catch (error) {
    return null;
  }
}

async function requestLocationPermission(): Promise<Location.LocationPermissionResponse | null> {
  try {
    return await Location.requestForegroundPermissionsAsync();
  } catch (error) {
    return null;
  }
}

async function checkLocationService(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    return false;
  }
}

async function checkPreciseLocation(): Promise<boolean> {
  const currLoc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });
  return currLoc.coords.accuracy ? currLoc.coords.accuracy < 50 : false;
}

export interface LocationAccessResultType {
  access: boolean;
  needManualConfiguration: boolean;
}
export const LOCATION_ACCESS_DEFAULT_VALUE = [
  {
    access: false,
    needManualConfiguration: false,
  },
  {
    access: false,
    needManualConfiguration: false,
  },
  {
    access: false,
    needManualConfiguration: false,
  },
];
export async function checkLocationAccess(): Promise<LocationAccessResultType[]> {
  let permissionRes = {
    access: false,
    needManualConfiguration: false,
  };
  let serviceRes = {
    access: false,
    needManualConfiguration: false,
  };
  let preciseRes = {
    access: false,
    needManualConfiguration: false,
  };

  const initPermissionCheck = await checkLocationPermission();
  if (initPermissionCheck?.granted === true) {
    permissionRes.access = true;
    permissionRes.needManualConfiguration = false;
  } else if (!initPermissionCheck?.granted && initPermissionCheck?.canAskAgain === true) {
    const permissionRequest = await requestLocationPermission();
    if (!permissionRequest?.granted) permissionRes.access = false;
    if (!permissionRequest?.canAskAgain) permissionRes.needManualConfiguration = true;
  }

  const initServiceCheck = await checkLocationService();
  if (initServiceCheck === true) {
    serviceRes.access = true;
    serviceRes.needManualConfiguration = false;
  } else {
    serviceRes.access = false;
    serviceRes.needManualConfiguration = true;
  }

  if (permissionRes.access === true && serviceRes.access === true) {
    const initPreciseCheck = await checkPreciseLocation();
    if (initPreciseCheck === true) {
      preciseRes.access = true;
      preciseRes.needManualConfiguration = false;
    } else {
      preciseRes.access = false;
      preciseRes.needManualConfiguration = true;
    }
  }

  let result = [permissionRes, serviceRes, preciseRes];
  if (__DEV__)
    console.log(
      'checkLocationAccess CHECKED'
      // JSON.stringify(result, null, 2)
    );
  return result;
}

export async function requestBgPermission(): Promise<boolean> {
  const accessFg = await checkLocationAccess();
  if (accessFg.every((l) => l.access !== true)) return false;

  let res: boolean = false;

  let fp = await Location.getBackgroundPermissionsAsync();
  res = fp.granted;
  if (fp.canAskAgain && !fp.granted) {
    fp = await Location.requestBackgroundPermissionsAsync();
  }
  res = fp.granted;

  return res;
}
