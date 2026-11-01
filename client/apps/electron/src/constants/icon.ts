import path from 'node:path';
import { app } from 'electron';

export const defaultTrayIcon = app.isPackaged
  ? path.join(process.resourcesPath, 'assets/icon-transparent.png')
  : path.resolve(app.getAppPath(), '../../packages/core/assets/icon-transparent.png');

export const hiddenTrayIcon = app.isPackaged
  ? path.join(process.resourcesPath, 'assets/transparent-blank.png')
  : path.resolve(app.getAppPath(), '../../packages/core/assets/transparent-blank.png');
