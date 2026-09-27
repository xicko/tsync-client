import { useDomainStore } from '@/store';

// =========================================
export async function pingServer(): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${domain}/api/sys/ping`, { signal: controller.signal });

    return response.ok;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

// =========================================
export async function getIpServer(): Promise<string | null> {
  const domain = useDomainStore.getState().domainAddress;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${domain}/api/sys/ip`, { signal: controller.signal });
    if (!response.ok) return null;
    const data = (await response.json()) as { ip: string };

    return data.ip;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
