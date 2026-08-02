import { useDomainStore } from '@/store/domainStore';
import { BatteryStatus, TailscaleDevicesResponse } from '@shared/types';

// =========================================
export async function getDevices(): Promise<TailscaleDevicesResponse | null> {
  const domain = useDomainStore.getState().domainAddress;

  try {
    const response = await fetch(`${domain}/api/devices`);
    const data = (await response.json()) as Partial<TailscaleDevicesResponse>;

    if (!data.devices) return null;

    return data as TailscaleDevicesResponse;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return null;
  }
}

// =========================================
export async function wakeOnLan(tailscaleId: string): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const url = new URL(`${domain}/api/devices/${tailscaleId}/wol`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    const data = (await response.json()) as { success: boolean };
    clearTimeout(timeoutId);
    return data?.success || false;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

// =========================================
export async function setWindowsMacAddress(tailscaleId: string, macAddress: string | null): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${domain}/api/devices/${tailscaleId}/mac-address`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        macAddress,
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

// =========================================
export async function updateBatteryStatus(tailscaleId: string, body: BatteryStatus): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${domain}/api/devices/${tailscaleId}/update-battery-status`, {
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
