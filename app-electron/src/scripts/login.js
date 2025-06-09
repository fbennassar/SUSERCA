console.log('login.js cargado');

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // electronAPI es la API expuesta en preload.js
    try {
      const user = await window.electronAPI.login(email, password);

      if (user) {
        Swal.fire('Login exitoso', '', 'success').then(() => {
          window.location.href = '../views/dashboard.html';
        });
      } else {
        Swal.fire('Usuario o contraseña incorrectos', '', 'error');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      Swal.fire('Error', 'Ocurrió un error durante el login', 'error');
    }
  });
});

// Mostrar clave
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showCheckbox = document.getElementById('show');
    passwordInput.type = showCheckbox.checked ? 'text' : 'password';
}