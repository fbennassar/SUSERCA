document.addEventListener('DOMContentLoaded', async () => {

    try {

        const user = await window.electronAPI.getUser();

        if (!user) {
            document.body.innerHTML = '';
            Swal.fire({
                title: 'No estás autenticado',
                text: 'Por favor, inicia sesión para continuar.',
                icon: 'warning',
                confirmButtonText: 'Iniciar sesión'
            }).then(() => {
                window.location.href = '../views/login.html';
            });
        }

    } catch (error) {
        document.body.innerHTML = '';
        Swal.fire({
                title: 'No estás autenticado',
                text: 'Por favor, inicia sesión para continuar.',
                icon: 'warning',
                confirmButtonText: 'Iniciar sesión'
            }).then(() => {
                window.location.href = '../views/login.html';
            });
    }
});
