const { ipcMain, net } = require('electron');
const usuarios = require('../db/usuarios.js');
// Corregir la importación y uso de supabase aquí:
const { supabase } = require('../db/supabaseClient.js'); // Desestructurar para obtener el cliente anónimo
// Si necesitas supabaseAdmin aquí también, sería: const { supabase, supabaseAdmin } = require('../db/supabaseClient.js');
const session = require('../session/session.js');


// Handle para el inicio de sesión de usuarios
ipcMain.handle('usuarios:login', async (event, { email, password }) => {
  try {
    // ... (código de verificación de conectividad) ...
    await new Promise((resolve, reject) => {
      const request = net.request('https://www.google.com');
      request.on('response', (response) => {
        if (response.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Error de conectividad: ${response.statusCode}`));
        }
      });
      request.on('error', (error) => {
        reject(new Error('Sin conexión a internet.'));
      });
      request.end();
    });

    const user = await usuarios.login(email, password);
    const profile = await usuarios.getProfile(user.id);

    if (!profile) {
      throw new Error('No se pudo cargar el perfil del usuario. Contacte a soporte.');
    }

    session.setUser(user);
    session.setProfile(profile);

    return { user, profile, error: null };
  } catch (error) {
    console.error('Error en IPC usuarios:login', error);
    return { user: null, profile: null, error: error.message };
  }
});


ipcMain.handle('auth:getUser', async () => {
  return session.getUser();
});

ipcMain.handle('auth:getProfile', async () => {
  const profile = session.getProfile();
  return profile ? { profile, error: null } : { profile: null, error: 'No hay perfil en sesión' };
});

ipcMain.handle('users:getAllProfiles', async (event, nombreFilter, rolFilter) => {
  // 'supabase' aquí ya es el cliente desestructurado y correcto
  if (!supabase) {
    console.error('El cliente Supabase (anónimo) no ha sido inicializado');
    return { error: 'Cliente Supabase (anónimo) no inicializado' };
  }
   try {
    const usersList = await usuarios.getAllProfiles(nombreFilter, rolFilter);
    return { users: usersList, error: null };
  } catch (error) {
    console.error('Error en IPC usuarios:getAllProfiles:', error);
    return { users: null, error: error.message };
  }
});

ipcMain.handle('usuarios:logout', async () => {
  session.clear();
  // 'supabase' aquí ya es el cliente desestructurado y correcto
  if (supabase) {
    await supabase.auth.signOut();
  } else {
    console.warn('[IPCusuarios.js] Cliente Supabase (anónimo) no disponible para logout.');
  }
  return true;
});

ipcMain.handle('auth:signOut', async () => {
  // 'supabase' aquí ya es el cliente desestructurado y correcto
  if (!supabase) {
    console.error('El cliente Supabase (anónimo) no ha sido inicializado');
    return { error: 'Cliente Supabase (anónimo) no inicializado' };
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error durante el signOut de Supabase:', error);
      return { error: error.message };
    }
    session.clear();
    return { error: null };
  } catch (e) {
    console.error('Error durante el signOut:', e);
    return { error: e.message };
  }
});

ipcMain.handle('usuarios:invite', async (event, { email, rolId, redirectTo }) => {
  console.log('[IPCusuarios.js] usuarios:invite: Solicitud recibida.');
  console.log(`[IPCusuarios.js] usuarios:invite: Parámetros - Email: ${email}, RolID: ${rolId}, RedirectTo: ${redirectTo}`);

  const currentProfile = session.getProfile();

  if (!currentProfile) {
    console.warn('[IPCusuarios.js] usuarios:invite: Acción no autorizada - No hay perfil de usuario en sesión.');
    return { data: null, error: 'No hay perfil de usuario en sesión. Acción no autorizada.' };
  }
  console.log(`[IPCusuarios.js] usuarios:invite: Perfil del solicitante - Email: ${currentProfile.email}, Rol: ${currentProfile.rol ? currentProfile.rol.nombre : 'No definido'}`);

  if (!currentProfile.rol || currentProfile.rol.nombre !== 'Gerente') {
    console.warn(`[IPCusuarios.js] usuarios:invite: Acción no autorizada - Intento de invitación por usuario no Gerente: ${currentProfile.email || currentProfile.id}, Rol: ${currentProfile.rol ? currentProfile.rol.nombre : 'No definido'}`);
    return { data: null, error: 'Acción no autorizada. Solo los Gerentes pueden invitar usuarios.' };
  }

  try {
    console.log(`[IPCusuarios.js] usuarios:invite: Usuario Gerente ${currentProfile.email} está procediendo a invitar a ${email}. Llamando a usuarios.inviteUser...`);
    const result = await usuarios.inviteUser(email, rolId, redirectTo);
    console.log('[IPCusuarios.js] usuarios:invite: Llamada a usuarios.inviteUser completada. Resultado:', result);
    return { data: result, error: null };
  } catch (error) {
    console.error('[IPCusuarios.js] usuarios:invite: Error capturado al llamar a usuarios.inviteUser:', error.message);
    console.error('[IPCusuarios.js] usuarios:invite: Stack trace del error:', error.stack); // Log del stack trace
    // Devolver el mensaje de error al frontend
    return { data: null, error: error.message || 'Ocurrió un error en el servidor al procesar la invitación.' };
  }
});