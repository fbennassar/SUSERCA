document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const loginText = document.getElementById('loginText');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Ocultar el texto y mostrar el spinner
    loginText.classList.add('opacity-0');
    loadingIndicator.classList.remove('opacity-0');

    try {
      const result = await window.electronAPI.login(email, password);

      // Mostrar el texto y ocultar el spinner
      loginText.classList.remove('opacity-0');
      loadingIndicator.classList.add('opacity-0');

      if (result.error) {
        Swal.fire('Error', result.error, 'error');
      } else {
        Swal.fire('Login exitoso', '', 'success').then(() => {
          if (result.profile) {
            localStorage.setItem('user', result.profile.nombre);
          } else {
            localStorage.setItem('user', result.user.email);
          }
          window.location.href = '../views/dashboard.html';
        });
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      Swal.fire('Error', 'Ocurrió un error durante el login', 'error');
    }
    finally {
      // Asegurarse de mostrar el texto y ocultar el spinner incluso si hay un error
      loginText.classList.remove('opacity-0');
      loadingIndicator.classList.add('opacity-0');
    }
  });
});

// Mostrar clave
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showCheckbox = document.getElementById('show');
    passwordInput.type = showCheckbox.checked ? 'text' : 'password';
}