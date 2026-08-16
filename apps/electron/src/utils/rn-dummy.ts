import React from 'react';

// react-native-screens mocks
interface ContainerProps {
  children?: unknown;
}
export const ScreenContainer = ({ children }: ContainerProps): unknown => children;
export const Screen = ({ children }: ContainerProps): unknown => children;
export const ScreenStack = ({ children }: ContainerProps): unknown => children;
export const enableScreens = (): void => {
  // empty implementation
};

// expo-router mocks
export const router = {
  push: (path: string): void => {
    void path;
  },
  replace: (path: string): void => {
    void path;
  },
  back: (): void => {
    // empty
  },
};

export const useRouter = (): typeof router => router;
export const usePathname = (): string => '/';
export const useLocalSearchParams = <T extends Record<string, string>>(): T => ({}) as T;
export const useFocusEffect = (callback: () => void): void => {
  React.useEffect(() => {
    callback();
  }, [callback]);
};

export const Tabs = ({ children }: ContainerProps): unknown => children;
export const Stack = ({ children }: ContainerProps): unknown => children;
export const Redirect = (): null => null;

// expo mocks
export const registerWebModule = <T>(moduleClass: new () => T): T => new moduleClass();
export const requireNativeModule = (): Record<string, unknown> => ({});
export const requireOptionalNativeModule = (): null => null;
export const isRunningInExpoGo = (): boolean => false;

export enum PermissionStatus {
  UNDETERMINED = 'undetermined',
  GRANTED = 'granted',
  DENIED = 'denied',
}

export class SharedRef {}
export class SharedObject {}
export class EventEmitter {
  addListener(): { remove: () => void } {
    return {
      remove: (): void => {
        // empty implementation
      },
    };
  }
  emit(): void {
    // empty implementation
  }
  removeAllListeners(): void {
    // empty implementation
  }
}

export class NativeModule<T = unknown> {
  // silence generic type check
  _events?: T;
}

// CodedError / UnavailabilityError mocks
export class CodedError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class UnavailabilityError extends CodedError {
  constructor(moduleName: string, methodName: string) {
    super('ERR_UNAVAILABLE', `The method or property ${moduleName}.${methodName} is not available.`);
  }
}

// Platform mock
export const Platform = {
  OS: 'web',
  select: <T>(obj: { web?: T; default?: T }): T | undefined => obj.web ?? obj.default,
};

// react-native internal shims
export const customDirectEventTypes = {};
export const getInternalInstanceHandleFromPublicInstance = (): null => null;
export const PressabilityDebugView = (): null => null;

// expo-image mock
interface ImageProps {
  source?: unknown;
  style?: Record<string, unknown>;
}
export const Image = ({ source, style, ...props }: ImageProps): unknown => {
  let src: string | undefined;
  if (typeof source === 'string') {
    src = source;
  } else if (source && typeof source === 'object') {
    const srcObj = source as Record<string, unknown>;
    src = (srcObj.uri as string) || (srcObj.default as string) || undefined;
  }

  const mergedStyle: React.CSSProperties = {
    objectFit: 'contain',
    ...(style as React.CSSProperties),
  };

  return React.createElement('img', {
    src,
    style: mergedStyle,
    ...props,
  });
};

// expo-location mocks
export const useForegroundPermissions = (): [unknown, () => Promise<void>] => [
  null,
  async (): Promise<void> => {
    // empty implementation
  },
];
export const requestForegroundPermissionsAsync = (): Promise<{ status: string }> =>
  Promise.resolve({ status: 'granted' });

// expo-notifications mocks
export const requestPermissionsAsync = (): Promise<{ status: string }> => Promise.resolve({ status: 'granted' });
export const scheduleNotificationAsync = (): Promise<string> => Promise.resolve('mock-id');
export const cancelAllScheduledNotificationsAsync = (): Promise<void> => Promise.resolve();

// expo-clipboard mocks
export const setStringAsync = (): Promise<boolean> => Promise.resolve(true);
export const getStringAsync = (): Promise<string> => Promise.resolve('');

// expo-secure-store mocks
export const setItemAsync = (): Promise<void> => Promise.resolve();
export const getItemAsync = (): Promise<null> => Promise.resolve(null);
export const deleteItemAsync = (): Promise<void> => Promise.resolve();

// expo-intent-launcher mocks
export enum ActivityAction {
  ACTION_SETTINGS = 'android.settings.SETTINGS',
}
export const startActivityAsync = (): Promise<void> => Promise.resolve();

// expo-device mocks
export const brand = 'Desktop';
export const modelName = 'Electron';
export const osVersion = '1.0';
export const osName = 'macOS';

// expo-application mocks
export const applicationId = 'com.tsync.client';
export const nativeApplicationVersion = '1.0.0';

interface DummyConfig {
  (): null;
  expoConfig?: { name: string; version: string };
}
const dummy: DummyConfig = (): null => null;
dummy.expoConfig = { name: 'tsync', version: '1.0.0' };
export default dummy;
