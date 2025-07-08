const { ipcMain, dialog } = require('electron');
const { createClient, getAllClients, getClientByID, getClientByName, update, delete: deleteClient, searchClients } = require('../db/clientes');
const Pdfmake = require('pdfmake'); // Cambiamos a la importación principal
const fs = require('fs');
const path = require('path'); // Necesitaremos path para las fuentes
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

const fonts = {
    Arial: {
        normal: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIAL.ttf'),
        bold: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALBD.ttf'),
        italics: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALI.ttf'),
        bolditalics: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALBI.ttf')
    }
};

const printer = new Pdfmake(fonts);


ipcMain.handle('clientes:generar-reporte-pdf', async (event, clientesData) => {
  // ... (código de validación y diálogo de guardado sin cambios)
  if (!clientesData || clientesData.length === 0) {
    return { error: 'No hay datos para generar el reporte.' };
  }

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Guardar Reporte de Clientes',
    defaultPath: `reporte_clientes_${new Date().toISOString().split('T')[0]}.pdf`,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) {
    return { success: false, message: 'Operación cancelada por el usuario.' };
  }


  const docDefinition = {
    content: [
      { text: 'Reporte de Clientes', style: 'header' },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', '*', 'auto',],
          body: [
            [{ text: 'RIF', style: 'tableHeader' }, { text: 'Razon social', style: 'tableHeader' }, { text: 'Correo', style: 'tableHeader' }, { text: 'Tlf', style: 'tableHeader' }, { text: 'Dirección', style: 'tableHeader' }],
            ...clientesData.map(item => [item.rif, item.razonSocial, item.email, item.telefono, item.direccion])
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