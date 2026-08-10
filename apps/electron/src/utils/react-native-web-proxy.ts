export * from 'react-native-web';

// Missing exports for native packages on Web/Electron
export const DrawerLayoutAndroid = {};
export const TurboModuleRegistry = {
  get: (): null => null,
  getEnforcing: (): null => null,
};
