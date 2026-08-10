import { useDomainStore } from '@/store';

// =========================================
export async function getConnectedAdbDevices(): Promise<string[]> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${domain}/api/adb/connected`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    const data = (await response.json()) as string[];
    clearTimeout(timeoutId);
    return data;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

// =========================================
export async function setAdbDeviceIdentifier(tailscaleId: string, identifier: string | null): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${domain}/api/adb/devices/${tailscaleId}/identifier`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
      }),
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
