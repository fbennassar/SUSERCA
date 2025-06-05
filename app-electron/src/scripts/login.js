console.log('login.js cargado');

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
//   alert(`Intentando login con: ${username}, ${password}`);

  const user = await window.electronAPI.login(username, password);
  if (user) {
    console.log('Login exitoso');
  } else {
    console.log('Usuario o contraseña incorrectos');
  }
});