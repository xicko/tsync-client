import { create } from 'zustand';

export interface NotificationsSyncListActiveFiltersType {
  search: string;
  os: 'all' | 'android' | 'ios' | 'windows' | 'linux' | 'macos';
  tailscaleId: string[];
  startDate: number | null;
  endDate: number | null;
}

export const DEFAULT_FILTERS_NOTIFICATIONS_SYNC: NotificationsSyncListActiveFiltersType = {
  search: '',
  os: 'all',
  tailscaleId: [],
  startDate: null,
  endDate: null,
};

interface NotificationsSyncListFilterStoreState {
  activeFilters: NotificationsSyncListActiveFiltersType;
  setActiveFilters: (val: NotificationsSyncListActiveFiltersType) => void;

  resetFilters: () => void;
}

export const useNotificationsSyncListFilterStore = create<NotificationsSyncListFilterStoreState>((set, get) => ({
  activeFilters: DEFAULT_FILTERS_NOTIFICATIONS_SYNC,
  setActiveFilters: (val) => {
    set({ activeFilters: val });
  },

  resetFilters: () => {
    set({ activeFilters: DEFAULT_FILTERS_NOTIFICATIONS_SYNC });
  },
}));
