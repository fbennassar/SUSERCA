console.log('login.js cargado');

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // electronAPI es la API expuesta en preload.js
  const user = await window.electronAPI.login(username, password);
  if (user) {
    Swal.fire('Login exitoso', '', 'success').then(() => {
      window.location.href = '../views/dashboard.html';
    });
  } else {
    Swal.fire('Usuario o contraseña incorrectos', '', 'error');
  }
});

// Mostrar clave
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showCheckbox = document.getElementById('show');
    passwordInput.type = showCheckbox.checked ? 'text' : 'password';
}

