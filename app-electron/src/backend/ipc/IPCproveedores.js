const { ipcMain } = require('electron');
const { createProveedor, getAllProveedores, getProveedorByID, 
        getProveedorByName, updateProveedor, deleteProveedor, searchProveedores } 
        = require('../db/proveedores');
// Create
ipcMain.handle('proveedores:create', async (event, proveedorData) => {
  try { 
    const { data, error } = await createProveedor(proveedorData);
    if (error) {
      console.error('Error al crear proveedor en IPC:', { error: error.message, proveedorData });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC proveedores:create:', error);
    return { error: error.message };
  }
});
// Read All
ipcMain.handle('proveedores:getAll', async () => {
    try {
        const { data, error } = await getAllProveedores();
        if (error) {
            console.error('Error al obtener proveedores en IPC:', { error: error.message });
            return { error };
        }
        return { data };
    } catch (error) {
        console.error('Error inesperado en IPC proveedores:getAll:', error);
        return { error: error.message };
    }
});

// Get Proveedor by ID
ipcMain.handle('proveedores:getProveedorById', async (event, id) => {
    try {
        const { data, error } = await getProveedorByID(id);
        if (error) {
            console.error('Error al obtener proveedor por ID en IPC:', { error: error.message, id });
            return { error };
        }
        return { data };
    } catch (error) {
        console.error('Error inesperado en IPC proveedores:getProveedorById:', error);
        return { error: error.message };
    }
});
// Get Proveedor by Name
ipcMain.handle('proveedores:getProveedorByName', async (event, name) => {
    try {
        const { data, error } = await getProveedorByName(name);
        if (error) {
            console.error('Error al obtener proveedor por nombre en IPC:', { error: error.message, name });
            return { error };
        }
        return { data };
    } catch (error) {
        console.error('Error inesperado en IPC proveedores:getProveedorByName:', error);
        return { error: error.message };
    }
});

// Update Proveedor
ipcMain.handle('proveedores:update', async (event, { id, updates }) => {
    try {
        const { data, error } = await updateProveedor(id, updates);
        if (error) {
            console.error('Error al actualizar proveedor en IPC:', { error: error.message, id, updates });
            return { error };
        }
        return { data };
    } catch (error) {
        console.error('Error inesperado en IPC proveedores:update:', error);
        return { error: error.message };
    }
});
// Delete Proveedor
ipcMain.handle('proveedores:delete', async (event, id) => {
    try {
        const { data, error } = await deleteProveedor(id);
        if (error) {
            console.error('Error al eliminar proveedor en IPC:', { error: error.message, id });
            return { error };
        }
        return { data };
    } catch (error) {
        console.error('Error inesperado en IPC proveedores:delete:', error);
        return { error: error.message };
    }
});
// Search Proveedores
ipcMain.handle('proveedores:search', async (event, query) => {
    try {
        const { data, error } = await searchProveedores(query);
        if (error) {
            console.error('Error al buscar proveedores en IPC:', { error: error.message, query });
            return { error };
        }
        return { data };
    } catch (error) {
        console.error('Error inesperado en IPC proveedores:search:', error);
        return { error: error.message };
    }
});

