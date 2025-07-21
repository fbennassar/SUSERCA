const { ipcMain, dialog } = require('electron');
const Pdfmake = require('pdfmake'); // Cambiamos a la importación principal
const fs = require('fs');
const path = require('path'); // Necesitaremos path para las fuentes
const { text } = require('stream/consumers');

// --- Definición de Fuentes ---
// Aunque usemos Roboto, es más robusto definirlo explícitamente para el printer.
// pdfmake-node (que es lo que usamos en el backend) lo recomienda.
const fonts = {
    Arial: {
        normal: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIAL.ttf'),
        bold: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALBD.ttf'),
        italics: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALI.ttf'),
        bolditalics: path.join(__dirname, '..', '..','assets', 'fonts', 'ARIALBI.ttf')
    }
};

const printer = new Pdfmake(fonts);


ipcMain.handle('ordenes:generar-reporte-pdf', async (event, ordenesData) => {
  // ... (código de validación y diálogo de guardado sin cambios)
  if (!ordenesData || ordenesData.length === 0) {
    return { error: 'No hay datos para generar el reporte.' };
  }

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Guardar Reporte de Órdenes',
    defaultPath: `reporte_ordenes_${new Date().toISOString().split('T')[0]}.pdf`,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) {
    return { success: false, message: 'Operación cancelada por el usuario.' };
  }


  const docDefinition = {
    content: [
      { text: 'Reporte de Órdenes', style: 'header' },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [{ text: 'ID', style: 'tableHeader' }, { text: 'Tipo', style: 'tableHeader' }, { text: 'Razón Social', style: 'tableHeader' }, { text: 'Fecha', style: 'tableHeader' }, { text: 'Monto Pagado', style: 'tableHeader' }, { text: 'Monto Total', style: 'tableHeader' }, { text: 'Monto Restante', style: 'tableHeader' }, { text: 'Estatus', style: 'tableHeader' }],
            ...ordenesData.map(item => [item.id, item.tipo, item.razonSocial, item.fecha, item.montoPagado, item.montoTotal, item.montoRestante, item.estatus])
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