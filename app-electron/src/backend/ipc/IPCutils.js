const { ipcMain, dialog, app } = require('electron'); // Asegúrate de que 'app' esté aquí
const fs = require('fs');
const path = require('path');

const getAssetPath = (...paths) => {
  // Si la app está empaquetada, los assets desempaquetados están en una carpeta especial.
  // process.resourcesPath apunta a la carpeta 'resources' en producción.
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked')
    : app.getAppPath(); // En desarrollo, la raíz del proyecto.

  return path.join(basePath, 'app-electron', 'src', 'assets', ...paths);
};

// --- NUEVA FUNCIÓN PARA DESCARGAR EL MANUAL DE USUARIO ---
ipcMain.handle('manual:download', async () => {
  // 1. Definir la ruta de origen del manual de forma dinámica
  const assetsPath = getAssetPath();
  const sourcePath = path.join(assetsPath, 'docs', 'manual_de_usuario.pdf');

  // 2. Verificar si el archivo de origen realmente existe
  if (!fs.existsSync(sourcePath)) {
    console.error('El archivo del manual no se encuentra en:', sourcePath);
    return { success: false, message: 'El archivo del manual no fue encontrado en la aplicación.' };
  }

  // 3. Mostrar el diálogo "Guardar como..." al usuario
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Guardar Manual de Usuario',
    defaultPath: 'Manual_de_Usuario_SUSERCA.pdf',
    filters: [{ name: 'Documentos PDF', extensions: ['pdf'] }]
  });

  // 4. Si el usuario cancela, no hacer nada
  if (canceled || !filePath) {
    return { success: false, message: 'Descarga cancelada por el usuario.' };
  }

  // 5. Si el usuario elige una ubicación, copiar el archivo
  try {
    fs.copyFileSync(sourcePath, filePath);
    return { success: true, message: 'Manual guardado exitosamente.' };
  } catch (error) {
    console.error('Error al guardar el manual:', error);
    return { success: false, message: 'Ocurrió un error al intentar guardar el manual.' };
  }
});