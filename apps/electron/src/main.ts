import { app, BrowserWindow, ipcMain, screen, powerMonitor, Tray, Menu, nativeImage, nativeTheme } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { AppStateStatus } from './types/types';

const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

let currentAppState: AppStateStatus = 'active';
const setAppState = (newState: AppStateStatus) => {
  if (currentAppState !== newState && mainWindow && !mainWindow.isDestroyed()) {
    currentAppState = newState;
    mainWindow.webContents.send('app-state:changed', currentAppState);
  }
};

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

ipcMain.handle('get-battery-status', async () => {
  try {
    const { stdout } = await execAsync('pmset -g batt');
    const percentMatch = stdout.match(/(\d+)%/);
    if (!percentMatch) throw new Error('No battery');
    const level: number = parseInt(percentMatch[1], 10);
    const isCharging: boolean = stdout.includes('charging') && !stdout.includes('discharging');

    return { level, isCharging };
  } catch (err) {
    console.error('Failed to get battery status:', err);
    return null;
  }
});

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

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const scrWidth = primaryDisplay.bounds.width;

  // Create the browser window.
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
powerMonitor.on('resume', () => setAppState(mainWindow?.isFocused() ? 'active' : 'inactive'));
powerMonitor.on('unlock-screen', () => setAppState(mainWindow?.isFocused() ? 'active' : 'inactive'));

ipcMain.handle('app-state:get', () => currentAppState);

const createTray = () => {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets/icon.png')
    : path.resolve(__dirname, '../../../packages/core/assets/icon.png');

  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
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

  app.setLoginItemSettings({
    openAtLogin: true,
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  isQuitting = true;
});
