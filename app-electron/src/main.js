const { app, BrowserWindow } = require('electron/main')
require('electron-reload')(process.cwd(), {
  electron: require(`${process.cwd()}/node_modules/electron`)
});

const db = require('./backend/db/connection.js');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('./app-electron/src/views/login.html')
}

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