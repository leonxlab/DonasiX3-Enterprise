const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('path');

let adminWindow;
let displayWindow;

function createWindows() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    Menu.setApplicationMenu(null);

  // … konfigurasi adminWindow seperti biasa …
  adminWindow = new BrowserWindow({
    width, height,
    autoHideMenuBar: true,
    menuBarVisible: false,  
    frame: true,
    icon: path.join(__dirname, 'assets', 'logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  adminWindow.loadFile('admin.html');

  // … konfigurasi displayWindow …
  displayWindow = new BrowserWindow({
    width, height,
    autoHideMenuBar: true,
    menuBarVisible: false,  
    frame: true,
    fullscreenable: true,
    icon: path.join(__dirname, 'assets', 'logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  displayWindow.loadFile('display.html');

  // ————— Zamannya BEFORE-INPUT-EVENT untuk AdminWindow —————
  adminWindow.webContents.on('before-input-event', (event, input) => {
    if (!input.control) return;

    const wc = adminWindow.webContents;
    let lvl = wc.getZoomLevel();

    if (input.key === '+' || input.code === 'NumpadAdd' || input.key === '=') {
      wc.setZoomLevel(lvl + 1);
      event.preventDefault();
    } else if (input.key === '-' || input.code === 'NumpadSubtract') {
      wc.setZoomLevel(lvl - 1);
      event.preventDefault();
    }
  });

  // ————— Sama untuk DisplayWindow jika mau —————
  displayWindow.webContents.on('before-input-event', (event, input) => {
    if (!input.control) return;

    const wc = displayWindow.webContents;
    let lvl = wc.getZoomLevel();

    if (input.key === '+' || input.code === 'NumpadAdd' || input.key === '=') {
      wc.setZoomLevel(lvl + 1);
      event.preventDefault();
    } else if (input.key === '-' || input.code === 'NumpadSubtract') {
      wc.setZoomLevel(lvl - 1);
      event.preventDefault();
    }
  });

  // ————— Handlers Fullscreen —————
  ipcMain.on('masuk-fullscreen', () => {
    displayWindow.setFullScreen(true);
  });
  ipcMain.on('keluar-fullscreen', () => {
    displayWindow.setFullScreen(false);
  });
}

const ffmpegPath = path.join(process.resourcesPath, 'ffmpeg.dll');
app.commandLine.appendSwitch('ffmpeg-path', ffmpegPath);

app.whenReady().then(createWindows);

app.on('window-all-closed', () => app.quit());
