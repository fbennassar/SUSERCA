const { ipcMain, dialog, app } = require('electron');
const { createProveedor, getAllProveedores, getProveedorByID, 
        getProveedorByName, updateProveedor, deleteProveedor, searchProveedores } 
        = require('../db/proveedores');
const Pdfmake = require('pdfmake'); // Cambiamos a la importación principal
const fs = require('fs');
const path = require('path'); // Necesitaremos path para las fuentes
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

// --- CORRECCIÓN ---
// Esta función construye la ruta correcta a los assets, tanto en desarrollo como en producción.
const getAssetPath = (...paths) => {
  // Si la app está empaquetada, los assets desempaquetados están en una carpeta especial.
  // process.resourcesPath apunta a la carpeta 'resources' en producción.
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked')
    : app.getAppPath(); // En desarrollo, la raíz del proyecto.

  return path.join(basePath, 'app-electron', 'src', 'assets', ...paths);
};

const fonts = {
    Arial: {
        normal: getAssetPath('fonts', 'ARIAL.ttf'),
        bold: getAssetPath('fonts', 'ARIALBD.ttf'),
        italics: getAssetPath('fonts', 'ARIALI.ttf'),
        bolditalics: getAssetPath('fonts', 'ARIALBI.ttf')
    }
};

const printer = new Pdfmake(fonts);

ipcMain.handle('proveedores:generar-reporte-pdf', async (event, proveedoresData) => {
  // ... (código de validación y diálogo de guardado sin cambios)
  if (!proveedoresData || proveedoresData.length === 0) {
    return { error: 'No hay datos para generar el reporte.' };
  }

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Guardar Reporte de Proveedores',
    defaultPath: `reporte_proveedores_${new Date().toISOString().split('T')[0]}.pdf`,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) {
    return { success: false, message: 'Operación cancelada por el usuario.' };
  }


  const docDefinition = {
    content: [
      { text: 'Reporte de Proveedores', style: 'header' },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', '*', 'auto',],
          body: [
            [{ text: 'RIF', style: 'tableHeader' }, { text: 'Razon social', style: 'tableHeader' }, { text: 'Correo', style: 'tableHeader' }, { text: 'Tlf', style: 'tableHeader' }, { text: 'Dirección', style: 'tableHeader' }],
            ...proveedoresData.map(item => [item.rif, item.razonSocial, item.email, item.telefono, item.direccion])
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      }
    },
    defaultStyle: {
      font: 'Arial'
    }
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
