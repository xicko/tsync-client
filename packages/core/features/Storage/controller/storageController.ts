import { useDomainStore } from '@/store';
import { StorageFile } from '../types/storage-file.interface';
import { PaginationResponse } from '@shared/types';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { UploadFileInput } from '../types/upload-file-input';
import { useStorageDependencyStore } from '../store/storageDependencyStore';

// =========================================
export async function getFilesList(
  page: number,
  limit: number,
  search?: string
): Promise<{ data: StorageFile[]; pagination: PaginationResponse } | null> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const url = new URL(`${domain}/api/storage`);

  url.searchParams.append('page', page.toString());
  url.searchParams.append('limit', limit.toString());
  if (search) url.searchParams.append('search', search.toString());

  try {
    const response = await fetch(url, {
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
export async function uploadFile(fileInput: UploadFileInput, expiry?: Date): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;

  const url = new URL(`${domain}/api/storage`);

  if (expiry) url.searchParams.append('expiry', String(expiry.getTime()));

  try {
    const response = await useStorageDependencyStore.getState().uploadFn(url.toString(), fileInput);

    return response.status === 201 || response.status === 200;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  }
}

// =========================================
export function getFileDownloadUrl(id: string): string {
  const domain = useDomainStore.getState().domainAddress;
  return `${domain}/api/storage/${id}`;
}

export async function downloadFile(id: string, fileName?: string): Promise<boolean> {
  const downloadUrl = getFileDownloadUrl(id);

  try {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = downloadUrl;
      if (fileName) link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    await Linking.openURL(downloadUrl);
    return true;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  }
}

// =========================================
export async function deleteFile(id: string): Promise<boolean> {
  const domain = useDomainStore.getState().domainAddress;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${domain}/api/storage/${id}`, {
      method: 'DELETE',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.status === 204 || response.status === 200 || response.ok;
  } catch (error) {
    if (error instanceof Error && __DEV__) console.log(error.message);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
