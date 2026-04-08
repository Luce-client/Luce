import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthManager } from './AuthManager';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    frame: false,
    resizable: false,
    backgroundColor: '#0d0d0d',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Auto Updater
  autoUpdater.checkForUpdatesAndNotify().catch(() => {});

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

// ===== Window Controls =====
ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window-close', () => {
  app.exit(0);
});

// ===== Auth: Popup Login =====
ipcMain.handle('auth-microsoft', async () => {
  try {
    if (!mainWindow) throw new Error('No main window');
    const mcProfile = await AuthManager.loginMicrosoft(mainWindow);
    return { success: true, profile: mcProfile };
  } catch (err: any) {
    console.error('[Auth Error]', err?.message || err);
    return { success: false, error: String(err?.message || err) };
  }
});

// ===== Auth: Device Code (Link) Login =====
ipcMain.handle('auth-microsoft-link-start', async () => {
  try {
    const codeInfo = await AuthManager.startDeviceCodeFlow();
    return { success: true, ...codeInfo };
  } catch (err: any) {
    console.error('[Device Code Error]', err?.message || err);
    return { success: false, error: String(err?.message || err) };
  }
});

ipcMain.handle('auth-microsoft-link-poll', async (_event, deviceCode: string, interval: number, expiresIn: number) => {
  try {
    const mcProfile = await AuthManager.pollDeviceCodeToken(deviceCode, interval, expiresIn);
    return { success: true, profile: mcProfile };
  } catch (err: any) {
    console.error('[Device Code Poll Error]', err?.message || err);
    return { success: false, error: String(err?.message || err) };
  }
});

// ===== Open External Link =====
ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url);
});

// ===== Launch Game =====
ipcMain.handle('launch-game', async (_event, profile) => {
  console.log(`[Luce Launcher] Starting Minecraft for ${profile.name} (${profile.version})`);
  // TODO: 실제 자바 실행 로직 추가
  return { success: true };
});

// ===== Auto Updater Events =====
autoUpdater.on('update-available', () => {
  console.log('[Updater] Update available, downloading...');
});
autoUpdater.on('update-downloaded', () => {
  console.log('[Updater] Update downloaded. Will install on restart.');
  autoUpdater.quitAndInstall();
});
