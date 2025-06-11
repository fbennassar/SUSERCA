const { ipcMain, net } = require('electron');
const usuarios = require('../db/usuarios.js');
const supabase = require('../db/supabaseClient.js');

ipcMain.handle('usuarios:login', async (event, { email, password }) => {
  try {
    // Verificar la conectividad
    await new Promise((resolve, reject) => {
      const request = net.request('https://www.google.com'); // Puedes usar cualquier URL confiable
      // En este caso se recibe una respuesta y se verifica si es distinta de 200
      request.on('response', (response) => {
        if (response.statusCode !== 200) {
          reject(new Error('Error de conexión'));
        } else {
          resolve();
        }
      });
      // En este, no se recibe respuesta y se rechaza la promesa
      request.on('error', (error) => {
        reject(new Error('Error de conexión'));
      });
      request.end();
    });

    const user = await usuarios.login(email, password);

    return { user: user, error: null };
  } catch (error) {
    console.error('Error en IPC usuarios:login', error);
    return { user: null, error: error.message };
  }
});

ipcMain.handle('auth:getUser', async () => {
  if(!supabase) {
    console.error('El cliente no ha sido inicializado')
    return null;
  }
  try {
    const {data: { user }, error} = await supabase.auth.getUser();
    if (error) {
      console.error('Error al obtener el usuario:', error.message);
      return null;
    }
    return user;
  } catch(e) {
    console.error('Error al obtener el usuario:'. e);
    return null;
  }
})