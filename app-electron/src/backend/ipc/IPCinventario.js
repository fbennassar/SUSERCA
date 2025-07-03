const { ipcMain } = require('electron');
const { createProducto, getAllProductos, getProductoByID, getProductoByName, updateProducto, deleteProducto, searchProductos } = require('../db/inventario');

ipcMain.handle('productos:create', async (event, productoData) => {
  console.log("IPC productos:create - Datos recibidos:", productoData);
  try {
    const { data, error } = await createProducto(productoData);
    console.log("IPC productos:create - Respuesta de createProducto:", { data, error });
    if (error) {
      console.error("IPC productos:create - Error al crear producto:", error);
      return { error };
    }
    console.log("IPC productos:create - Producto creado exitosamente:", data);
    return { data };
  } catch (error) {
    console.error("IPC productos:create - Error inesperado:", error);
    return { error: error.message };
  }
});

ipcMain.handle('productos:getAll', async () => {
  console.log("IPC productos:getAll - Solicitando todos los productos");
  try {
    const { data, error } = await getAllProductos();
    //console.log("IPC productos:getAll - Respuesta de getAllProductos:", { data, error });
    if (error) {
      console.error("IPC productos:getAll - Error al obtener productos:", error);
      return { error };
    }
    //console.log("IPC productos:getAll - Productos obtenidos exitosamente:", data);
    return { data };
  } catch (error) {
    console.error("IPC productos:getAll - Error inesperado:", error);
    return { error: error.message };
  }
});

ipcMain.handle('productos:getByID', async (event, id) => {
  try {
    const { data, error } = await getProductoByID(id);
    if (error) {
      return { error };
    }
    return { data };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('productos:getByName', async (event, name) => {
  try {
    const { data, error } = await getProductoByName(name);
    if (error) {
      return { error };
    }
    return { data };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('productos:update', async (event, { id, updates }) => {
  try {
    const { data, error } = await updateProducto(id, updates);
    if (error) {
      return { error };
    }
    return { data };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('productos:delete', async (event, id) => {
  try {
    const { data, error } = await deleteProducto(id);
    if (error) {
      return { error };
    }
    return { data };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('productos:search', async (event, query) => {
  try {
    const { data, error } = await searchProductos(query);
    if (error) {
      return { error };
    }
    return { data };
  } catch (error) {
    return { error: error.message };
  }
});