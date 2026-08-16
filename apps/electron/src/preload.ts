// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { AppStateStatus } from './types/types';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  getBatteryStatus: () => ipcRenderer.invoke('get-battery-status'),
  appState: {
    get: (): Promise<AppStateStatus> => ipcRenderer.invoke('app-state:get'),
    subscribe: (callback: (state: AppStateStatus) => void) => {
      const handler = (_event: IpcRendererEvent, state: AppStateStatus) => callback(state);
      ipcRenderer.on('app-state:changed', handler);

      return () => {
        ipcRenderer.removeListener('app-state:changed', handler);
      };
    },
  },
});

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
});
