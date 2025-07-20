const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userRole = document.getElementById('user-role');

async function loadUserData() {
  try {
    // 1. Llama a la función correcta que sí existe en tu preload.js
    const profile = await window.electronAPI.getProfileSeguro();

    // 2. Verifica si el perfil se obtuvo correctamente
    if (profile) {
      // 3. Asigna los datos del objeto 'profile' a los elementos HTML
      // (Asegúrate de que los nombres de las propiedades como 'nombre', 'correo' y 'rol' coincidan con los de tu base de datos)
      userName.innerHTML = `Nombre: ${profile.nombre || 'N/A'}`;
      userEmail.innerHTML = `Correo: ${profile.email || 'N/A'}`;
      userRole.innerHTML = `Rol: ${(profile.rol.nombre) || 'N/A'}`;
    } else {
      // Maneja el caso en que no se pudo obtener el perfil
      userName.innerHTML = `Nombre: No disponible`;
      userEmail.innerHTML = `Correo: No disponible`;
      userRole.innerHTML = `Rol: No disponible`;
    }
  } catch (error) {
    console.error("Error al cargar los datos del usuario:", error);
    // Muestra un error en la interfaz si algo falla
    userName.innerHTML = `Nombre: Error`;
    userEmail.innerHTML = `Correo: Error`;
    userRole.innerHTML = `Rol: Error`;
  }
}

// Llama a la función para cargar los datos cuando el script se ejecute
loadUserData();