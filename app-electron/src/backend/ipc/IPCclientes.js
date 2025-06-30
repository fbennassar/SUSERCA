const { ipcMain } = require('electron');
const { createClient, getAllClients, getClientByID, getClientByName, update, delete: deleteClient, searchClients } = require('../db/clientes');

// Create
ipcMain.handle('clientes:create', async (event, clientData) => {
  try {
    const { data, error } = await createClient(clientData);
    if (error) {
      console.error('Error al crear cliente en IPC:', { error: error.message, clientData });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC clientes:create:', error);
    return { error: error.message };
  }
});

// Read All
ipcMain.handle('clientes:getAllClients', async () => {
  try {
    const { data, error } = await getAllClients();
    if (error) {
      console.error('Error al obtener clientes en IPC:', { error: error.message });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC clientes:getAll:', error);
    return { error: error.message };
  }
});

// Get Client by ID
ipcMain.handle('clientes:getClientByID', async (event, id) => {
  try {
    const { data, error } = await getClientByID(id);
    if (error) {
      console.error('Error al obtener cliente por ID en IPC:', { error: error.message, id });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC clientes:getClientById:', error);
    return { error: error.message };
  }
});

ipcMain.handle('clientes:searchClients', async (event, query) => {
  try {
    const { data, error } = await searchClients(query);
    if (error) {
      console.error('Error al buscar clientes en IPC:', { error: error.message, query });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC clientes:search:', error);
    return { error: error.message };
  }
});

// Get Client by Name
ipcMain.handle('clientes:getClientByName', async (event, name) => {
  try {
    const { data, error } = await getClientByName(name);
    if (error) {
      console.error('Error al obtener cliente por nombre en IPC:', { error: error.message, name });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC clientes:getClientByName:', error);
    return { error: error.message };
  }
});

// Update
ipcMain.handle('clientes:update', async (event, { id, updates }) => {
  try {
    const { data, error } = await update(id, updates);
    if (error) {
      console.error('Error al actualizar cliente en IPC:', { error: error.message, id, updates });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC clientes:update:', error);
    return { error: error.message };
  }
});

// Delete
ipcMain.handle('clientes:delete', async (event, id) => {
  console.log("ID recibido en IPC clientes:delete:", id); // Log del ID recibido
  try {
    const { data, error } = await deleteClient(id); // Llama a la función delete del backend
    if (error) {
      console.error('Error al eliminar cliente en IPC:', { error: error.message, id });
      return { error };
    }
    return { success: true, data }; // Devuelve los datos actualizados si es necesario
  } catch (error) {
    console.error('Error inesperado en IPC clientes:delete:', error);
    return { error: error.message };
  }
});
