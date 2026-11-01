import { create } from 'zustand';
import { UploadFileInput } from '../types/upload-file-input';
import { uploadFn } from '../utils/storageUtils';

interface StorageDependencyStoreState {
  uploadFn: (url: string, fileInput: UploadFileInput) => Promise<{ status: number } | Response>;
}

export const useStorageDependencyStore = create<StorageDependencyStoreState>((set, get) => ({
  uploadFn: uploadFn,
}));
