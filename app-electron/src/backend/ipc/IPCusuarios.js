const { ipcMain, net } = require('electron');
const usuarios = require('../db/usuarios.js');
const supabase = require('../db/supabaseClient.js');


// Handle para el inicio de sesión de usuarios
ipcMain.handle('usuarios:login', async (event, { email, password }) => {
  try {
    // Verificar la conectividad
    await new Promise((resolve, reject) => {
      const request = net.request('https://www.google.com');
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


// Handle para saber si el usuario está autenticado
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

ipcMain.handle('auth:getProfile', async (event, userId) => {
  try {
    const profile = await usuarios.getProfile(userId);
    return { profile, error: null };
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    return { profile: null, error: error.message };
  }
});