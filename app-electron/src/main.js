require('dotenv').config();
const { app, BrowserWindow } = require('electron/main')

require('electron-reload')(process.cwd(), {
  electron: require(`${process.cwd()}/node_modules/electron`)
});

require('./backend/ipc/IPCusuarios.js')

const db = require('./backend/db/supabaseClient.js');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    frame: true,
    minWidth: 830,
    minHeight: 730,
    maxWidth: 1920,
    maxHeight: 1080,
    icon: path.join(__dirname, '../assets/icons/general/icon.ico'), // Usa .ico para Windows
    webPreferences: {
      preload: path.join(process.cwd(), './app-electron/src/preload.js')
    }
  })

  win.loadFile('./app-electron/src/views/login.html')
}

const { ipcMain } = require('electron/main');
ipcMain.on('close-app', () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})