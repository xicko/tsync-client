/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  electronAPI: {
    platform: string;
    getBatteryStatus: () => Promise<{ level: number; isCharging: boolean } | null>;
    appState: {
      get: () => Promise<import('./types/types').AppStateStatus>;
      subscribe: (callback: (state: import('./types/types').AppStateStatus) => void) => () => void;
    };
    storage: {
      getString: (key: string) => string | null;
      setString: (key: string, value: string) => void;
      delete: (key: string) => void;
      getAllKeys: () => string[];
      clearAll: () => void;
    };
  };
  darkMode: {
    toggle: () => void;
    system: () => void;
  };
}

declare module 'react-native-web';
