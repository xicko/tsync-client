import type { BatteryStatus } from '@shared/types';

export async function fetchBatteryStatus(
  domainAddress: string,
  tailscaleId: string,
  body: BatteryStatus
): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${domainAddress}/api/devices/${tailscaleId}/battery`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to update battery status:', error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
