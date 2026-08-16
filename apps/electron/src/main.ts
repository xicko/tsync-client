import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  powerMonitor,
  Tray,
  Menu,
  nativeImage,
  nativeTheme,
  powerSaveBlocker,
  Notification,
} from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { AppStateStatus } from './types/types';
import { store } from './utils/electron-store';
import { defaultTrayIcon, hiddenTrayIcon } from './constants/icon';
import { getBatteryNative } from './shell/battery';
import { fetchBatteryStatus } from './api/battery-status';

type TrayIconInterface = { type: 'default'; path: string } | { type: 'hidden'; path: string };

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let trayIcon: TrayIconInterface = { type: 'default', path: defaultTrayIcon };
let batterySyncJobInterval: ReturnType<typeof setInterval> | null = null;
let hasBattery: boolean | null = null;
let blockerId: number | null = null;

let currentAppState: AppStateStatus = 'active';
const setAppState = (newState: AppStateStatus) => {
  if (currentAppState !== newState && mainWindow && !mainWindow.isDestroyed()) {
    currentAppState = newState;
    mainWindow.webContents.send('app-state:changed', currentAppState);
  }
};
ipcMain.handle('app-state:get', () => currentAppState);

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized() || !mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

(function batteryIPC() {
  ipcMain.handle('get-battery-status', async () => {
    return await getBatteryNative();
  });
})();

(function themeIPC() {
  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light';
    } else {
      nativeTheme.themeSource = 'dark';
    }
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system';
  });
})();

(function storageIPC() {
  ipcMain.on('storage:get', (event, key: string) => {
    event.returnValue = (store.get(key) as string) ?? null;
  });

  ipcMain.on('storage:set', (event, key: string, value: string) => {
    store.set(key, value);
    event.returnValue = true;
  });

  ipcMain.on('storage:delete', (event, key: string) => {
    store.delete(key);
    event.returnValue = true;
  });

  ipcMain.on('storage:getAllKeys', (event) => {
    event.returnValue = Object.keys(store.store);
  });

  ipcMain.on('storage:clearAll', (event) => {
    store.clear();
    event.returnValue = true;
  });
})();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

const runBatterySyncJob = async () => {
  console.log('Bg job called');

  try {
    if (hasBattery === false) {
      if (blockerId) powerSaveBlocker.stop(blockerId);
      return;
    }
    const battery = await getBatteryNative();
    if (!battery) {
      hasBattery = false;
      return;
    }
    hasBattery = true;
    blockerId = powerSaveBlocker.start('prevent-app-suspension');

    const domain = store.get('domain') as string | undefined;
    const rawDevice = store.get('thisTailscaleDevice') as string | undefined;
    let tailscaleId: string | undefined;
    if (rawDevice) {
      try {
        const parsed = JSON.parse(rawDevice);
        tailscaleId = parsed?.id;
      } catch {
        tailscaleId = rawDevice;
      }
    }

    if (!domain || !tailscaleId) {
      console.log('Bg job waiting for domain and device setup');
      return;
    }

    const result = await fetchBatteryStatus(domain, tailscaleId, {
      level: battery.level,
      isPlugged: battery.isCharging,
      timestamp: Date.now(),
    });

    new Notification({
      title: 'Battery Sync',
      body: result ? 'Successful' : 'Unsuccessul',
    }).show();
  } catch (error) {
    console.error('Bg job error:', error);
  }
};

const startPersistentBatterySyncWorker = (intervalMs = 600_000) => {
  if (batterySyncJobInterval) clearInterval(batterySyncJobInterval);

  runBatterySyncJob(); // initial run

  batterySyncJobInterval = setInterval(runBatterySyncJob, intervalMs);
};

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const scrWidth = primaryDisplay.bounds.width;

  mainWindow = new BrowserWindow({
    width: scrWidth,
    height: Math.round(scrWidth / (16 / 9)),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('focus', () => setAppState('active'));
  mainWindow.on('blur', () => setAppState('inactive'));

  mainWindow.on('minimize', () => setAppState('background'));
  mainWindow.on('hide', () => setAppState('background'));
  mainWindow.on('restore', () => setAppState(mainWindow?.isFocused() ? 'active' : 'inactive'));
  mainWindow.on('show', () => setAppState(mainWindow?.isFocused() ? 'active' : 'inactive'));

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
};

powerMonitor.on('suspend', () => setAppState('background'));
powerMonitor.on('lock-screen', () => setAppState('background'));
powerMonitor.on('resume', () => {
  setAppState(mainWindow?.isFocused() ? 'active' : 'inactive');
  startPersistentBatterySyncWorker();
});
powerMonitor.on('unlock-screen', () => setAppState(mainWindow?.isFocused() ? 'active' : 'inactive'));
powerMonitor.on('on-ac', () => runBatterySyncJob());
powerMonitor.on('on-battery', () => runBatterySyncJob());

const createTray = () => {
  const icon = nativeImage
    .createFromPath(trayIcon.type === 'default' ? defaultTrayIcon : hiddenTrayIcon)
    .resize({ width: 16, height: 16 });
  icon.setTemplateImage(true);

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: 'Open',
      click: () => mainWindow?.show(),
    },
    {
      type: 'separator',
    },
    {
      type: 'normal',
      label: trayIcon.type === 'default' ? 'Hide tray icon' : 'Show tray icon',
      click: () => {
        trayIcon =
          trayIcon.type === 'default'
            ? {
                type: 'hidden',
                path: hiddenTrayIcon,
              }
            : {
                type: 'default',
                path: defaultTrayIcon,
              };
        tray?.destroy();
        tray = null;
        createTray();
      },
    },
    {
      type: 'separator',
    },
    {
      type: 'normal',
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('xd');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  createTray();

  startPersistentBatterySyncWorker();

  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  isQuitting = true;
});
