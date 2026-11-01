import { Platform } from './platform';

export async function getBatteryStatus(): Promise<string | null> {
  if (Platform.OS === 'macos') {
    if (window.electronAPI?.getBatteryStatus) {
      const data = await window.electronAPI.getBatteryStatus();
      if (!data) return null;
      return `${data.level}:${String(data.isCharging)}:${Date.now()}`;
    }
  }
  return null;
}
