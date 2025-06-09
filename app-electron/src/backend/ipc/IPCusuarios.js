const { ipcMain } = require('electron');
const usuarios = require('../db/usuarios.js');

// 'usarios:login' es el canal de comunicación
// Este canal es utilizado por el renderer process para enviar datos al main process
ipcMain.handle('usuarios:login', async (event, { email, password }) => {
  try {
    const user = await usuarios.login(email, password);
    return user;
  } catch (error) {
    console.error('Error en IPC usuarios:login', error);
    return null;
  }
});