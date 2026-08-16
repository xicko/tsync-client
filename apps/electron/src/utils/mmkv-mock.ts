export enum Mode {
  SINGLE_PROCESS = 0,
  MULTI_PROCESS = 1,
}

export class MMKV {
  constructor(options?: { id?: string; mode?: Mode }) {
    void options;
  }

  set(key: string, value: string | number | boolean | Uint8Array) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, String(value));
    }
  }

  getString(key: string): string | undefined {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) ?? undefined;
    }
    return undefined;
  }

  delete(key: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  clearAll() {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  }

  getAllKeys(): string[] {
    if (typeof localStorage !== 'undefined') {
      return Object.keys(localStorage);
    }
    return [];
  }
}
