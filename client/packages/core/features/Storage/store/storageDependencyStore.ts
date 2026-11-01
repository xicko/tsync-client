import { create } from 'zustand';
import { UploadFileInput } from '../types/upload-file-input';
import { DownloadFileInput, DownloadFileResult } from '../types/download-file-input';
import { uploadFn, downloadFn } from '../utils/storageUtils';

interface StorageDependencyStoreState {
  uploadFn: (url: string, fileInput: UploadFileInput) => Promise<{ status: number } | Response>;
  downloadFn: (options: DownloadFileInput) => Promise<DownloadFileResult | null>;
}

export const useStorageDependencyStore = create<StorageDependencyStoreState>((set, get) => ({
  uploadFn: uploadFn,
  downloadFn: downloadFn,
}));
