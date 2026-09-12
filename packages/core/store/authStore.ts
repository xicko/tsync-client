import { storage } from '@/utils/storage';
import { create } from 'zustand';
import { Platform } from 'react-native';

export interface AuthState {
  localAuth: boolean;
  setLocalAuth: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  localAuth: (() => {
    const cache =
      Platform.OS === 'web'
        ? typeof window !== 'undefined'
          ? localStorage.getItem('auth') === 'true'
            ? true
            : false
          : false
        : storage.getBoolean('auth');
    if (cache) return cache;
    return false;
  })(),
  setLocalAuth: (state) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem('auth', state ? 'true' : 'false');
    } else if (Platform.OS !== 'web') {
      storage.set('auth', state);
    }
    set({ localAuth: state });
  },
}));
