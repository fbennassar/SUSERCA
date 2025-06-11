document.addEventListener('DOMContentLoaded', function () {
  const userBtn = document.getElementById('usericon');
  const popup = document.getElementById('logout-modal');

  if (userBtn && popup) {
    userBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      popup.classList.toggle('hidden');
    });

    // Opcional: cerrar el popup si haces clic fuera de él
    document.addEventListener('click', function () {
      popup.classList.add('hidden');
    });

    popup.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }
});