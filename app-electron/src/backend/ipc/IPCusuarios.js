const { ipcMain } = require('electron');
const usuarios = require('../db/usuarios');

// 'usarios:login' es el canal de comunicación
// Este canal es utilizado por el renderer process para enviar datos al main process
ipcMain.handle('usuarios:login', async (event, { username, password }) => {
  const user = await usuarios.login(username, password);
  return user;
});