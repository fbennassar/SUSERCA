const { ipcMain, dialog } = require('electron');
const { createProducto, getAllProductos, getProductoByID, getProductoByName, updateProducto, deleteProducto, searchProductos, getProductosByCategoria } = require('../db/inventario');
const ExcelJS = require('exceljs');
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

ipcMain.handle('productos:exportarExcel', async () => {
  try {
    // 1. Obtener los productos
    const productosResult = await getAllProductos();
    if (productosResult.error || !productosResult.data || productosResult.data.length === 0) {
      return { error: 'No hay productos para exportar o hubo un error.' };
    }
    const productos = productosResult.data;

    // 2. Mostrar el diálogo para guardar el archivo
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Guardar Reporte de Productos',
      defaultPath: `reporte_productos_${new Date().toISOString().split('T')[0]}.xlsx`,
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    });

    if (canceled || !filePath) {
      return { success: false, message: 'Operación cancelada.' };
    }

    // --- Creación del Excel con ExcelJS ---
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SUSERCA App';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Inventario de Productos');

    // 3. Definir las columnas y sus propiedades (ancho, formato, etc.)
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Precio', key: 'precio', width: 15, style: { numFmt: '"$"#,##0.00' } },
      { header: 'Cantidad', key: 'cantidad', width: 15, style: { numFmt: '#,##0' } },
      { header: 'Categoría', key: 'categoria', width: 25 }
    ];

    // 4. Aplicar estilo a la fila de encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Un color azul
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 5. Añadir los datos de los productos
    productos.forEach(producto => {
      worksheet.addRow({
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        cantidad: producto.cantidad,
        categoria: producto.categoria
      });
    });
    
    // 6. Congelar la fila de encabezados
    worksheet.views = [
        { state: 'frozen', ySplit: 1 }
    ];

    // 7. Escribir el archivo en el disco
    await workbook.xlsx.writeFile(filePath);

    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error al generar el reporte de productos con ExcelJS:', error);
    return { error: error.message || 'Un error desconocido ocurrió.' };
  }
});

ipcMain.handle('productos:getByCategoria', async (event, categoriaId) => {
  try {
    const { data, error } = await getProductosByCategoria(categoriaId);
    if (error) {
      return { error: error.message };
    }
    return { data };
  } catch (error) {
    return { error: error.message };
  }
});