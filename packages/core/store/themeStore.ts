import { storage } from '@/utils/storage';
import { create } from 'zustand';
import { Platform } from 'react-native';

export interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (() => {
    const cache =
      Platform.OS === 'web'
        ? typeof window !== 'undefined'
          ? localStorage.getItem('theme')
          : 'dark'
        : storage.getString('theme');
    if (cache) return cache as 'light' | 'dark';
    return 'dark';
  })(),
  setTheme: (theme) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    } else if (Platform.OS !== 'web') {
      storage.set('theme', theme);
    }
    set({ theme });
  },
}));
