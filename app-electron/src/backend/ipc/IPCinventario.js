const { ipcMain, dialog } = require('electron');
const { createProducto, getAllProductos, getProductoByID, getProductoByName, updateProducto, deleteProducto, searchProductos } = require('../db/inventario');
const xlsx = require('xlsx');
const fs = require('fs');

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

// ... código existente ...

ipcMain.handle('productos:exportarExcel', async () => {
  try {
    // 1. Obtener todos los productos desde la BD
    const productosResult = await getAllProductos();

    if (productosResult.error) {
      return { error: 'Error al obtener los productos para el reporte.' };
    }

    const productos = productosResult.data;

    console.log("Tipo de dato de productos:", typeof productos);
    console.log("Contenido de productos:", productos);

    if (!Array.isArray(productos)) {
      console.error('Error: productos no es un array.');
      return { error: 'Error al generar el reporte: los datos no son válidos.' };
    }

    // 2. Mostrar el diálogo para guardar el archivo
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Guardar Reporte de Productos',
      defaultPath: `reporte_productos_${new Date().toISOString().split('T')[0]}.xlsx`,
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    });

    if (canceled || !filePath) {
      return { success: false, message: 'Operación cancelada por el usuario.' };
    }

    const columnasSeleccionadas = productos.map(producto => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      cantidad: producto.cantidad
    }));

    // 3. Preparar los datos para la hoja de cálculo
    const worksheet = xlsx.utils.json_to_sheet(columnasSeleccionadas);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // 4. Escribir el archivo en el disco
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(filePath, buffer);

    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error al generar el reporte de productos:', error);
    return { error: error.message || 'Un error desconocido ocurrió.' };
  }
});