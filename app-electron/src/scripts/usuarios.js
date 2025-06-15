window.addEventListener('DOMContentLoaded', async () => {

    const selectRol = document.getElementById('selectRol');
    const selectRolFilter = document.getElementById('selectRolFilter');
    try {
        const { rol, error } = await window.electronAPI.getRol();
        console.log('Roles obtenidos:', rol);
        if (error) {
            console.error('Error al obtener los roles:', error);
            const option = document.createElement('option');
            option.textContent = 'Error al cargar roles';
            selectRol.appendChild(option);
            return;
        }
        if (rol && rol.length > 0) {
            rol.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id;
                option.textContent = rol.nombre;
                selectRol.appendChild(option);
                selectRolFilter.appendChild(option.cloneNode(true));
            });
        } else {
            const option = document.createElement('option');
            option.textContent = 'No hay roles disponibles';
            selectRol.appendChild(option);
            selectRolFilter.appendChild(option.cloneNode(true));
        }
    } catch (error) {
        console.error('Error al cargar los roles:', error);
        const option = document.createElement('option');
        option.textContent = 'Error al cargar roles';
        selectRol.appendChild(option);
        selectRolFilter.appendChild(option.cloneNode(true));
    }
});