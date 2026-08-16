import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { useDomainStore } from './domainStore';
import { Platform } from 'react-native';

export interface SocketState {
  socket: Socket | null;
  setSocket: (val: Socket | null) => void;

  isConnected: boolean;
  setIsConnected: (val: boolean) => void;

  connectSocket: (device?: any) => Promise<void>;

  disconnectSocket: () => Promise<void>;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  setSocket: (val) => set({ socket: val }),

  isConnected: false,
  setIsConnected: (val) => set({ isConnected: val }),

  connectSocket: async (device?: any) => {
    if (get().socket?.connected) {
      if (__DEV__) console.log('Socket already connected.');
      return;
    }

    if (!device && Platform.OS !== 'web') {
      if (__DEV__) console.log('No device provided for non-web connection.');
      return;
    }

    const domain = useDomainStore.getState().domainAddress;

    const newSocket = io(domain, {
      timeout: 30000,
      reconnection: true,
      secure: true,
      query: {
        ...device,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      if (__DEV__) console.warn('IO Chat Socket connected successfully.');
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      if (__DEV__) console.warn('IO Chat Socket disconnected.');
      set({ isConnected: false });
    });

    newSocket.on('connect_error', (reason) => {
      if (__DEV__) console.warn('IO Chat Socket connection error:', reason);
      set({ isConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: async () => {
    const socket = get().socket;

    if (socket?.connected) {
      socket.disconnect();
    }
    set({ socket: null, isConnected: false });
  },
}));
