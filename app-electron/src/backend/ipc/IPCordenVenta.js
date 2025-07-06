const { ipcMain } = require('electron');
const ordenVentaDB = require('../db/ordenVenta');

ipcMain.handle('ordenVenta:create', async (event, ordenVentaData, productos) => {
  try {
    // Asegurarse de que RIF y Razón social estén presentes en ordenVentaData
    if (!ordenVentaData.rif || !ordenVentaData.nombre) {
      throw new Error('Faltan RIF o Razón social en los datos de la orden de venta');
    }

    const { data, error } = await ordenVentaDB.createOrdenVenta(ordenVentaData, productos);
    if (error) {
      console.error('Error al crear orden de venta en IPC:', { error: error.message, ordenVentaData });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenVenta:create:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenVenta:getAll', async () => {
  try {
    const { data, error } = await ordenVentaDB.getAllOrdenesVenta();
    if (error) {
      console.error('Error al obtener órdenes de venta en IPC:', { error: error.message });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenVenta:getAll:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenVenta:getById', async (event, id) => {
  try {
    const { data, error } = await ordenVentaDB.getOrdenVentaById(id);
    if (error) {
      console.error('Error al obtener orden de venta por ID en IPC:', { error: error.message, id });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenVenta:getById:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenVenta:update', async (event, id, ordenVentaData) => {
  try {
    const { data, error } = await ordenVentaDB.updateOrdenVenta(id, ordenVentaData);
    if (error) {
      console.error('Error al actualizar orden de venta en IPC:', { error: error.message, id, ordenVentaData });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenVenta:update:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenVenta:delete', async (event, id) => {
  try {
    const { data, error } = await ordenVentaDB.deleteOrdenVenta(id);
    if (error) {
      console.error('Error al eliminar orden de venta en IPC:', { error: error.message, id });
      return { error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenVenta:delete:', error);
    return { error: error.message };
  }
});

ipcMain.handle('ordenVenta:search', async (event, criteria) => {
  try {
    const { data, error } = await ordenVentaDB.searchOrdenesVenta(criteria);
    if (error) {
      console.error('Error al buscar órdenes de venta en IPC:', { error: error.message, criteria });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC ordenVenta:search:', error);
    return { error: error.message };
  }
});

ipcMain.handle('cuentasPorCobrar:insert', async (event, idOrdenVenta, paymentData) => {
  try {
    const { data, error } = await ordenVentaDB.insertIntoCuentasPorCobrar(idOrdenVenta, paymentData);
    if (error) {
      console.error('Error al insertar cobro en cuentas por cobrar:', { error: error.message, idOrdenVenta, paymentData });
      return { error };
    }
    return { data };
  } catch (error) {
    console.error('Error inesperado en IPC cuentasPorCobrar:insert:', error);
    return { error: error.message };
  }
});
