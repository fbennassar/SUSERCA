const { ipcMain } = require('electron');
const usuarios = require('../db/usuarios');

ipcMain.handle('usuarios:login', async (event, { username, password }) => {
  console.log('IPCusuarios: login recibido', username, password);
  const user = await usuarios.login(username, password);
  console.log('Resultado de login:', user);
  return user;
});