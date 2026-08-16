import { useDomainStore } from '@/store';
import { GlobalAlertSettings } from '../types/settings.interface';

// =========================================
export async function getAlertSettings(): Promise<{ success: boolean; data: GlobalAlertSettings | null } | null> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${domain}/api/settings/alert`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    const data = await response.json();
    clearTimeout(timeoutId);
    return data;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// =========================================
export async function saveAlertSettings(body: Partial<GlobalAlertSettings>): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${domain}/api/settings/alert`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = (await response.json()) as { success: boolean };
    clearTimeout(timeoutId);
    return data.success;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
