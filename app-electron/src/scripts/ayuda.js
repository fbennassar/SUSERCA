document.addEventListener('DOMContentLoaded', () => {
  const downloadButton = document.getElementById('btn-download-manual');

  if (downloadButton) {
    downloadButton.addEventListener('click', async () => {
      // Mostrar un mensaje de "iniciando descarga"
      Swal.fire({
        title: 'Preparando descarga...',
        text: 'Por favor, elija dónde guardar el manual.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Llamar a la función del backend
      const result = await window.electronAPI.downloadManual();

      // Cerrar el mensaje de carga y mostrar el resultado
      Swal.close();
      if (result.success) {
        Swal.fire('¡Éxito!', result.message, 'success');
      } else {
        // No mostrar error si el usuario simplemente canceló
        if (result.message !== 'Descarga cancelada por el usuario.') {
          Swal.fire('Error', result.message, 'error');
        }
      }
    });
  }
});