window.addEventListener('DOMContentLoaded', async () => {

    try {

        const user = await window.electronAPI.getUser();

        if (!user) {
            window.location.href = '../views/login.html';
        }

    } catch (error) {
        window.location.href = '../views/login.html';
    }

    window.logout = async function() {
    try {
      const { error } = await window.electronAPI.signOut(); // Llama al IPC handler
      if (error) {
        console.error('Error al cerrar sesión en Supabase:', error);
        // Queda pendiente motsrar un mensaje de error al usuario
      }
    } catch (e) {
      console.error('Error al intentar cerrar sesión:', e);
    } finally {
      localStorage.removeItem('user');
      window.location.href = '../views/login.html';
    }
  };
});
