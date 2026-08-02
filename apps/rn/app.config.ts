import { ExpoConfig } from 'expo/config';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import * as tsyncNativePlugin from './modules/tsyncnative/app.plugin.cjs';

dotenv.config();

export default ({ config }: { config: ExpoConfig }) => {
  // google-services.json
  const gsPath = path.resolve(__dirname, 'google-services.json');
  let hasGoogleServices = fs.existsSync(gsPath);
  if (!hasGoogleServices && process.env.GOOGLE_SERVICES_JSON_B64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_SERVICES_JSON_B64, 'base64').toString('utf8');
      fs.writeFileSync(gsPath, decoded);
      hasGoogleServices = true;
    } catch (e) {
      console.warn('Could not decode GOOGLE_SERVICES_JSON_B64 base64 string', e);
    }
  }
  const androidConfig = { ...config.android };
  if (hasGoogleServices) androidConfig.googleServicesFile = './google-services.json';

  return {
    ...config,
    android: androidConfig,
    extra: {
      ...config?.extra,
      EXPO_PUBLIC_HEADLESS_STR: process.env.EXPO_PUBLIC_HEADLESS_STR || '',
      EXPO_PUBLIC_BASE_API_URL: process.env.EXPO_PUBLIC_BASE_API_URL || '',
      EXPO_PUBLIC_ONESIGNAL_APPID: process.env.EXPO_PUBLIC_ONESIGNAL_APPID || '',
    },
    plugins: [...(config?.plugins || []), tsyncNativePlugin.default],
  };
};
