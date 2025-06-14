document.addEventListener('DOMContentLoaded', function () {
  const userBtn = document.getElementById('usericon');
  const settingsBtn = document.getElementById('settingsicon');
  const popupUser = document.getElementById('user-modal');
  const popupSettings = document.getElementById('settings-modal');

  if (userBtn && popupUser && popupSettings) {
    userBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      // Cierra el otro popup antes de abrir este
      popupSettings.classList.add('hidden');
      popupUser.classList.toggle('hidden');
    });

    popupUser.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  if (settingsBtn && popupSettings && popupUser) {
    settingsBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      // Cierra el otro popup antes de abrir este
      popupUser.classList.add('hidden');
      popupSettings.classList.toggle('hidden');
    });

    popupSettings.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  // Cierra ambos popups si haces clic fuera
  document.addEventListener('click', function () {
    popupUser.classList.add('hidden');
    popupSettings.classList.add('hidden');
  });
});