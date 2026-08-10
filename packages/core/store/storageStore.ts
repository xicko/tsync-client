import { create } from 'zustand';

export interface StorageState {
  getAllKeys: () => string[];
  getString: (key: string) => string | null;
  setString: (key: string, value: string) => void;
  delete: (key: string) => void;
  clearAll: () => void;
}

const isBrowser = typeof localStorage !== 'undefined';

export const useStorageStore = create<StorageState>((set) => ({
  getAllKeys: isBrowser ? () => Object.keys(localStorage) : () => [],
  getString: isBrowser ? (key) => localStorage.getItem(key) : () => null,
  setString: isBrowser ? (key, value) => localStorage.setItem(key, value) : () => {},
  delete: isBrowser ? (key) => localStorage.removeItem(key) : () => {},
  clearAll: isBrowser ? () => localStorage.clear() : () => {},
}));
