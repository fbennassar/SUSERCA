const { ipcMain, net } = require('electron');
const usuarios = require('../db/usuarios.js');
const supabase = require('../db/supabaseClient.js');
const session = require('../session/session.js');


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
    const profile = await usuarios.getProfile(user.id);

    if (!profile) {
      return { user: user, profile: null, error: null };
    }

    // Guardar usuario y perfil en la sesión
    session.setUser(user);
    session.setProfile(profile);

    return { user, profile, error: null };
  } catch (error) {
    console.error('Error en IPC usuarios:login', error);
    return { user: null, profile: null, error: error.message };
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

ipcMain.handle('auth:getProfile', async () => {
  const profile = session.getProfile();
  return profile ? { profile, error: null } : { profile: null, error: 'No hay perfil en sesión' };
});

ipcMain.handle('usuarios:logout', async () => {
  session.clear();
  await supabase.auth.signOut();
  return true;
});

ipcMain.handle('auth:signOut', async () => {
  if (!supabase) {
    console.error('El cliente Supabase no ha sido inicializado');
    return { error: 'Cliente Supabase no inicializado' };
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión en Supabase:', error.message);
      return { error: error.message };
    }
    return { error: null };
  } catch (e) {
    console.error('Error durante el signOut:', e);
    return { error: e.message };
  }
});