const supabase = require('../db/supabaseClient.js');
const { ipcMain } = require('electron');
const rol = require('../db/categoria.js');

ipcMain.handle('categoria:getCategoria', async () => {
  if (!supabase) {
    console.error('El cliente no ha sido inicializado');
    return { categoria: null, error: 'Cliente no inicializado por falta de credenciales.' };
  }
  try {
    const data = await rol.getCategoria();
    console.log('Datos obtenidos:', data);
    return { categoria: data, error: null };
  } catch (error) {
    console.error('Error al obtener la categoria:', error);
    return { categoria: null, error: error.message };
  }
});