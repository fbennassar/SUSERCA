const { ipcMain, dialog } = require('electron');
const { createProducto, getAllProductos, getProductoByID, getProductoByName, updateProducto, deleteProducto, searchProductos, getProductosByCategoria } = require('../db/inventario');
const ExcelJS = require('exceljs');
const Pdfmake = require('pdfmake'); // Cambiamos a la importación principal
const fs = require('fs');
const path = require('path'); // Necesitaremos path para las fuentes

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

const fonts = {
    Arial: {
        normal: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIAL.ttf'),
        bold: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALBD.ttf'),
        italics: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALI.ttf'),
        bolditalics: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALBI.ttf')
    }
};

const printer = new Pdfmake(fonts);
function getLogoBase64() {
  try {
    const logoPath = path.join(__dirname, '..', '..', 'assets', 'icons', 'general', 'logo.jpg');
    return `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  } catch (error) {
    console.error("No se pudo cargar el logo:", error);
    return null; // Retorna null si no se encuentra el logo
  }
}

ipcMain.handle('inventario:generar-cotizacion', async (event, cotizacionCompleta) => {
  // ... (código de validación y diálogo de guardado sin cambios)
  if (!cotizacionCompleta || cotizacionCompleta.length === 0) {
    return { error: 'No hay datos para generar la cotización.' };
  }

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Guardar Cotización',
    defaultPath: `reporte_cotizacion_${new Date().toISOString().split('T')[0]}.pdf`,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) {
    return { success: false, message: 'Operación cancelada por el usuario.' };
  }


  // --- NUEVO: TEMPLATE PROFESIONAL PARA PDFMAKE ---
  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 80, 40, 60], // [left, top, right, bottom]

    header: {
      columns: [
        {
          image: getLogoBase64(), // Carga el logo dinámicamente
          width: 70,
          margin: [40, 15, 10, 0]
        },
        {
          text: 'Suministros y Servicios de Occidente, C.A.\nRIF: J-12345678-9\nAv. Principal, Edif. SUSERCA, Piso 1, Oficina 1-A\nMaracaibo, Estado Zulia\nTeléfono: (0261) 765-4321',
          style: 'companyDetails',
          margin: [10, 25, 40, 0]
        }
      ]
    },

    footer: {
      text: 'Gracias por su preferencia. Esta cotización es válida por 15 días.',
      alignment: 'center',
      style: 'footer'
    },

    content: [
      { text: 'COTIZACIÓN', style: 'documentTitle' },
      
      // --- Sección de Información del Cliente y Fecha ---
      {
        columns: [
          {
            stack: [
              { text: 'COTIZADO A:', style: 'subheader' },
              { text: cotizacionCompleta.cliente.razonSocial || 'N/A', style: 'clientInfo' },
              { text: `RIF: ${cotizacionCompleta.cliente.rif || 'N/A'}`, style: 'clientInfo' },
              { text: cotizacionCompleta.cliente.direccion || 'N/A', style: 'clientInfo' },
            ],
          },
          {
            stack: [
              { text: `FECHA: ${new Date(cotizacionCompleta.fecha).toLocaleDateString('es-VE') || new Date().toLocaleDateString('es-VE')}`, alignment: 'right' },
              { text: `TASA BCV: ${cotizacionCompleta.tasaBCV || 'N/A'}`, alignment: 'right', style: 'bcvRate' },
            ],
            width: 'auto'
          }
        ],
        margin: [0, 20, 0, 15] // Espacio después de la sección de cliente
      },

      // --- Tabla de Productos ---
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [
            // Cabeceras de la tabla
            ['POS', 'Descripción', 'Cant.', 'Precio/u', 'Total'].map(h => ({ text: h, style: 'tableHeader' })),
            // Datos de los productos
            ...cotizacionCompleta.productos.map(item => [
              { text: item.pos, style: 'tableCell' },
              { text: item.descripcion, style: 'tableCell' },
              { text: item.cantidad, style: 'tableCell', alignment: 'center' },
              { text: item.precioUnitario, style: 'tableCell', alignment: 'right' },
              { text: item.montoTotal, style: 'tableCell', alignment: 'right' }
            ])
          ]
        },
        layout: 'lightHorizontalLines' // Un estilo de tabla más limpio
      },

      // --- Sección de Resumen de Totales ---
      {
        columns: [
          { text: '', width: '*' }, // Columna vacía para empujar el resumen a la derecha
          {
            width: 'auto',
            style: 'summaryTable',
            table: {
              body: [
                ['Base Imponible:', { text: cotizacionCompleta.resumen.baseImponible, alignment: 'right' }],
                ['IVA 16%:', { text: cotizacionCompleta.resumen.iva, alignment: 'right' }],
                ['MONTO TOTAL:', { text: cotizacionCompleta.resumen.montoTotal, alignment: 'right', bold: true }]
              ]
            },
            layout: 'noBorders'
          }
        ],
        margin: [0, 20, 0, 0]
      }
    ],

    // --- Estilos del Documento ---
    styles: {
      companyDetails: { fontSize: 10, alignment: 'left' },
      documentTitle: { fontSize: 22, bold: true, alignment: 'right', margin: [0, 0, 0, 15], color: '#059669' },
      subheader: { fontSize: 10, bold: true, margin: [0, 0, 0, 2], color: 'gray' },
      clientInfo: { fontSize: 11, margin: [0, 0, 0, 2] },
      bcvRate: { fontSize: 9, italics: true, margin: [0, 2, 0, 0] },
      tableExample: { margin: [0, 5, 0, 15] },
      tableHeader: { bold: true, fontSize: 10, color: 'white', fillColor: '#047857', alignment: 'center' },
      tableCell: { fontSize: 9 },
      summaryTable: { margin: [20, 0, 0, 0], fontSize: 11 },
      footer: { fontSize: 8, italics: true }
    },
    defaultStyle: { font: 'Arial' }
  };

  return new Promise((resolve, reject) => {
    try {
      // --- CORRECCIÓN AQUÍ ---
      // Usamos printer.createPdfKitDocument que SÍ devuelve un stream con .pipe()
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      
      const writeStream = fs.createWriteStream(filePath);
      pdfDoc.pipe(writeStream);
      pdfDoc.end();

      writeStream.on('finish', () => {
        console.log(`PDF guardado exitosamente en: ${filePath}`);
        resolve({ success: true, path: filePath });
      });

      writeStream.on('error', (err) => {
        console.error('Error al escribir el archivo PDF:', err);
        reject({ error: 'No se pudo guardar el archivo PDF.' });
      });

    } catch (error) {
      console.error('Error al crear el documento PDF:', error);
      reject({ error: 'No se pudo generar el documento PDF.' });
    }
  });
});