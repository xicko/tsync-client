import { DOMAIN_KEY } from '@/constants';
import { create } from 'zustand';
import { useStorageStore } from './storageStore';

export interface DomainState {
  initialDomain: string;
  domainAddress: string;
  initDomain: (initialDomain: string) => void;
  setDomainAddress: (val: string) => void;
}

export const useDomainStore = create<DomainState>((set, get) => ({
  initialDomain: '',
  domainAddress: '',
  initDomain: (initialDomain: string) => {
    const storage = useStorageStore.getState();
    let cache = storage.getString(DOMAIN_KEY);

    if (cache === 'undefined' || cache === 'null' || !cache) {
      cache = null;
      storage.delete(DOMAIN_KEY);
    }

    const domainAddress = cache || initialDomain || '';
    if (!cache && initialDomain && initialDomain !== 'undefined' && initialDomain !== 'null') {
      storage.setString(DOMAIN_KEY, initialDomain);
    }
    set({ initialDomain, domainAddress });
  },
  setDomainAddress: (val) => {
    const storage = useStorageStore.getState();
    storage.setString(DOMAIN_KEY, val);
    set({ domainAddress: val });
  },
}));
