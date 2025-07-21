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

ipcMain.handle('categoria:createCategoria', async (event, categoriaData) => {
  if (!supabase) {
    console.error('El cliente no ha sido inicializado');
    return { categoria: null, error: 'Cliente no inicializado por falta de credenciales.' };
  }
  try {
    const data = await rol.createCategoria(categoriaData);
    console.log('Categoria creada:', data);
    return { categoria: data, error: null };
  } catch (error) {
    console.error('Error al crear la categoria:', error);
    return { categoria: null, error: error.message };
  }
});

ipcMain.handle('categoria:editCategoria', async (event, id, categoriaData) => {
  if (!supabase) {
    console.error('El cliente no ha sido inicializado');
    return { categoria: null, error: 'Cliente no inicializado por falta de credenciales.' };
  }
  try {
    const data = await rol.editCategoria(id, categoriaData);
    console.log('Categoria editada:', data);
    return { categoria: data, error: null };
  } catch (error) {
    console.error('Error al editar la categoria:', error);
    return { categoria: null, error: error.message };
  }
});
