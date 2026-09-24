import { useDomainStore } from '@/store';
import { FetchLatestReleaseParams, GitHubRelease } from '../types/github-release.interface';

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

export async function fetchLatestRelease(params?: FetchLatestReleaseParams): Promise<GitHubRelease | null> {
  const { owner = 'xicko', repo = 'wireless-adb-magisk', repoFullName, timeoutMs = 5000 } = params ?? {};

  const targetRepo = repoFullName || `${owner}/${repo}`;
  const endpoint = `https://api.github.com/repos/${targetRepo}/releases/latest`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'tsync-client',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = (await response.json()) as GitHubRelease;

    if (Array.isArray(data.assets)) {
      data.assets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return data;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.warn(error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
