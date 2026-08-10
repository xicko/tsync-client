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
  };
}

declare module 'react-native-web';
