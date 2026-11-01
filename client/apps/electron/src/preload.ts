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
  storage: {
    getString: (key: string): string | null => ipcRenderer.sendSync('storage:get', key),
    setString: (key: string, value: string): void => ipcRenderer.sendSync('storage:set', key, value),
    delete: (key: string): void => ipcRenderer.sendSync('storage:delete', key),
    getAllKeys: (): string[] => ipcRenderer.sendSync('storage:getAllKeys'),
    clearAll: (): void => ipcRenderer.sendSync('storage:clearAll'),
  },
});

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
});
