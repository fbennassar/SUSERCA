const { ipcMain } = require('electron');
const ordenCompraDB = require('../db/ordenCompra');

ipcMain.handle('ordenCompra:create', async (event, ordenCompraData, productos) => {
  try {
    // Asegurarse de que RIF y nombre estén presentes en ordenCompraData
    if (!ordenCompraData.rif || !ordenCompraData.nombre) {
      throw new Error('Faltan RIF o nombre en los datos de la orden de compra');
    }

    const { data, error } = await ordenCompraDB.createOrdenCompra(ordenCompraData, productos);
    if (error) {
      console.error('Error al crear orden de compra en IPC:', { error: error.message, ordenCompraData });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenCompra:create:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenCompra:getAll', async () => {
  try {
    const { data, error } = await ordenCompraDB.getAllOrdenesCompra();
    if (error) {
      console.error('Error al obtener órdenes de compra en IPC:', { error: error.message });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenCompra:getAll:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenCompra:getById', async (event, id) => {
  try {
    const { data, error } = await ordenCompraDB.getOrdenCompraById(id);
    if (error) {
      console.error('Error al obtener orden de compra por ID en IPC:', { error: error.message, id });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenCompra:getById:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenCompra:update', async (event, id, ordenCompraData) => {
  try {
    const { data, error } = await ordenCompraDB.updateOrdenCompra(id, ordenCompraData);
    if (error) {
      console.error('Error al actualizar orden de compra en IPC:', { error: error.message, id, ordenCompraData });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenCompra:update:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenCompra:delete', async (event, id) => {
  try {
    const { data, error } = await ordenCompraDB.deleteOrdenCompra(id);
    if (error) {
      console.error('Error al eliminar orden de compra en IPC:', { error: error.message, id });
      return { error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenCompra:delete:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenCompra:search', async (event, criteria) => {
  try {
    const { data, error } = await ordenCompraDB.searchOrdenesCompra(criteria);
    if (error) {
      console.error('Error al buscar órdenes de compra en IPC:', { error: error.message, criteria });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenCompra:search:', error);
    return { error: error.message };
  }
});

ipcMain.handle('cuentasPorPagar:insert', async (event, idOrdenCompra, paymentData) => {
  try {
    const { data, error } = await ordenCompraDB.insertIntoCuentasPorPagar(idOrdenCompra, paymentData);
    if (error) {
      console.error('Error al insertar pago en cuentas por pagar:', { error: error.message, idOrdenCompra, paymentData });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC cuentasPorPagar:insert:', error);
    return { error: error.message };
  }
});
