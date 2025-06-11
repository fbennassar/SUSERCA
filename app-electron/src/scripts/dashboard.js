document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('dropdownUserAvatarButton');
  const menu = document.getElementById('dropdownAvatar');
  if (btn && menu) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });
    document.addEventListener('click', function () {
      menu.classList.add('hidden');
    });
    menu.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }
});