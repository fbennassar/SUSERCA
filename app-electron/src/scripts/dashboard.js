document.addEventListener('DOMContentLoaded', async function () {
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

  // try {
  //   const user = await window.electronAPI.getUser();
  //   if (user && user.id) {
  //     const { profile, error } = await window.electronAPI.getProfile(user.id);
  //     if (profile && profile.name) {
  //       document.getElementById('dashboard-username').textContent = profile.name;
  //     } else {
  //       document.getElementById('dashboard-username').textContent = user.email || 'Usuario';
  //     }
  //   }
  // } catch (e) {
  //   const el = document.getElementById('dashboard-username');
  //   if (el) el.textContent = 'Usuario';
  // }
});

