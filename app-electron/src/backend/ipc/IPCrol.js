const supabase = require('../db/supabaseClient.js');
const { ipcMain } = require('electron');
const rol = require('../db/rol.js');

ipcMain.handle('rol:getRol', async () => {
  if (!supabase) {
    console.error('El cliente no ha sido inicializado');
    return { rol: null, error: 'Cliente no inicializado por falta de credenciales.' };
  }
  try {
    const data = await rol.getRol();
    console.log('Datos obtenidos:', data);
    return { rol: data, error: null };
  } catch (error) {
    console.error('Error al obtener el rol:', error);
    return { rol: null, error: error.message };
  }
});