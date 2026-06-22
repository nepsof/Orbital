const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork, spawn } = require('child_process');

let serverProcess = null;
let nextProcess = null;
let tray = null;
let mainWindow = null;

const SERVER_PORT = process.env.SERVER_PORT || 2831;
const NEXT_PORT = 3000;
const USER_DATA = app.getPath('userData');
const CONFIG_PATH = path.join(USER_DATA, 'config.json');

if (!fs.existsSync(USER_DATA)) {
  fs.mkdirSync(USER_DATA, { recursive: true });
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch {}
  return { autoLaunch: true };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch {}
}

function startServer() {
  const serverPath = path.join(__dirname, '..', 'server', 'server.js');
  console.log('[electron] Starting server:', serverPath);

  serverProcess = fork(serverPath, [], {
    cwd: path.join(__dirname, '..', 'server'),
    env: { ...process.env, PORT: String(SERVER_PORT) },
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  });

  serverProcess.on('error', (err) => {
    console.error('[electron] Failed to start server:', err.message);
  });

  serverProcess.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log('[server]', msg);
  });

  serverProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error('[server]', msg);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`[electron] Server exited (code=${code}, signal=${signal})`);
    serverProcess = null;
  });
}

function startNextDev() {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  console.log('[electron] Starting Next.js dev server in', frontendDir);

  const nextBin = path.join(frontendDir, 'node_modules', '.bin', 'next');
  nextProcess = spawn(nextBin, ['dev', '-p', String(NEXT_PORT)], {
    cwd: frontendDir,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  nextProcess.on('error', (err) => {
    console.error('[electron] Failed to start Next.js:', err.message);
  });

  nextProcess.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log('[next]', msg);
  });

  nextProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error('[next]', msg);
  });

  nextProcess.on('exit', (code, signal) => {
    console.log(`[electron] Next.js exited (code=${code}, signal=${signal})`);
    nextProcess = null;
  });
}

function createTrayIcon() {
  const icon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARpJREFUOI3N1LErRVEcx/HPvfeoG8lgMEhZFJNklCKxUFJWNhZmk5WN/4BMJhPJIiWlZFAWuRKDgSiKoofX4Hd1er3j3uv9zqnf9pxzfr9z7j33nHuIv+QbYFw+AgC9dtVqWR3bqM+INpAJQb9dBVzGNWzBBvowhC4MogMf6MERHOI9tuQMYA+70Y527GEbXrCbGvQcOpCLd2MZx9GAZfSgjlUM4gN9qEtaAgbDUCbqMiaqhm1pCdiHhXDUmZhCPZb8j6Nqw16eA9RBv7QX+up3mxt4Yr2Fx5VfHV85vu1v/qrPtRd8YgWrmMUIJjGAMQzhErOYwj3uwo0W0IoBdDT5WgykQjuSktUUMOw7rH/RhfYAkC/rJ1v9V19Hk3A0LQqfm21o6Gj6BX6TF/85OelDAAAAAElFTkSuQmCC',
      'base64'
    ),
    { width: 22, height: 22 }
  );
  return icon;
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('Orbital');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Orbital', click: showMainWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', showMainWindow);
}

function createMainWindow() {
  const appUrl = `http://localhost:${NEXT_PORT}`;
  let loadAttempts = 0;
  let loadTimer = null;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Orbital',
    titleBarStyle: 'hidden',
    show: true,
    vibrancy: 'fullscreen-ui',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });

  function load() {
    if (!mainWindow) return;
    loadAttempts++;
    console.log(`[electron] Loading ${appUrl} (attempt ${loadAttempts})`);
    mainWindow.loadURL(appUrl).catch(() => {});
  }

  // Retry when the page fails to load (e.g. dev server not ready yet)
  mainWindow.webContents.on('did-fail-load', () => {
    if (loadTimer) clearTimeout(loadTimer);
    loadTimer = setTimeout(load, 2000);
  });

  // Show devtools in dev mode for debugging
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  load();

  mainWindow.on('closed', () => {
    if (loadTimer) clearTimeout(loadTimer);
    mainWindow = null;
  });
}

function showMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

// IPC: from renderer (frontend) requests
ipcMain.on('focus-search', () => {
  if (mainWindow) {
    mainWindow.webContents.send('focus-search');
  }
});

ipcMain.on('open-file', async (_event, filePath) => {
  const { exec } = require('child_process');
  const platform = process.platform;
  const cmd = platform === 'darwin' ? `open "${filePath}"` :
              platform === 'win32' ? `start "" "${filePath}"` :
              `xdg-open "${filePath}"`;
  exec(cmd, () => {});
});

ipcMain.handle('get-api-base', () => `http://localhost:${SERVER_PORT}`);

app.whenReady().then(() => {
  console.log('[electron] Starting Orbital...');

  // Start both servers
  startServer();
  startNextDev();

  // Open window immediately (page loads once Next.js compiles)
  createMainWindow();

  // System tray
  createTray();

  // Auto-launch at login
  const config = loadConfig();
  if (config.autoLaunch !== false) {
    try {
      app.setLoginItemSettings({ openAtLogin: true });
      console.log('[electron] Set launch at login');
    } catch (e) {
      console.error('[electron] Failed to set auto-launch:', e);
    }
  }

  app.on('activate', () => {
    if (!mainWindow) {
      createMainWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit - keep in tray
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
  console.log('[electron] Quit complete');
});
