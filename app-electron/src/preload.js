const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: (email, password) =>
    ipcRenderer.invoke('usuarios:login', { email, password }),
  closeApp: () => ipcRenderer.send('close-app'),
  getUser: () => ipcRenderer.invoke('auth:getUser'),
  getProfile: (userId) => ipcRenderer.invoke('auth:getProfile', userId)
});