const { ipcMain } = require('electron');
const usuarios = require('../db/usuarios');

ipcMain.handle('usuarios:login', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    usuarios.login(username, password, (err, user) => {
      if (err) reject(err);
      else resolve(user); // null si no existe
    });
  });
});