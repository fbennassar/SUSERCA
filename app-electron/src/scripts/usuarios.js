window.addEventListener('DOMContentLoaded', async () => {

    const selectRol = document.getElementById('selectRol');
     const filterNombreInput = document.getElementById('filterNombre'); // Obtener el input del nombre
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

     const limpiarFiltrosBtn = document.getElementById('limpiarFiltros');
    if (limpiarFiltrosBtn) {
        limpiarFiltrosBtn.addEventListener('click', async () => {
            document.getElementById('filterNombre').value = '';
            document.getElementById('selectRolFilter').value = '';
            // Forzar el estilo del select a gris si no hay valor seleccionado
            const selectRolFilter = document.getElementById('selectRolFilter');
            selectRolFilter.classList.add('text-gray-400');
            selectRolFilter.classList.remove('text-black');
            await loadUsersTable();
        });
    }

    if (filterNombreInput) {
        filterNombreInput.addEventListener('input', async () => {
            const nombre = filterNombreInput.value;
            const rol = selectRolFilter ? selectRolFilter.value : '';
            await loadUsersTable(nombre, rol);
        });
    }

    // Event listener para el filtro de rol
    if (selectRolFilter) {
        selectRolFilter.addEventListener('change', async () => {
            const nombre = filterNombreInput ? filterNombreInput.value : '';
            const rol = selectRolFilter.value;
            await loadUsersTable(nombre, rol);
        });
    }
    await loadUsersTable();
});

async function loadUsersTable(nombreFilter = '', rolFilter = '') {
    const userListBody = document.getElementById('user-list-body');
    if (!userListBody) {
        console.error('Elemento tbody con id "user-list-body" no encontrado.');
        return;
    }

    try {
        const { users, error } = await window.electronAPI.getAllProfiles(nombreFilter, rolFilter);

        if (error) {
            console.error('Error al obtener los usuarios:', error);
            userListBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Error al cargar usuarios: ${error}</td></tr>`;
            return;
        }

        userListBody.innerHTML = ''; // Limpiar contenido previo

        if (users && users.length > 0) {
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.classList.add('divide-x', 'divide-gray-200');
                tr.setAttribute('data-user-id', user.id);

                // ID (UUID)
                // const tdId = document.createElement('td');
                // tdId.classList.add('text-left', 'px-2', 'py-2', 'truncate');
                // tdId.style.maxWidth = '100px';
                // tdId.textContent = user.id;
                // tdId.title = user.id; // Tooltip para ver el ID completo

                // Nombre
                const tdNombre = document.createElement('td');
                tdNombre.classList.add('text-left', 'px-2', 'py-2', 'truncate');
                tdNombre.style.maxWidth = '120px';
                tdNombre.textContent = user.nombre || 'N/A';

                // Email
                const tdEmail = document.createElement('td');
                tdEmail.classList.add('text-left', 'px-2', 'py-2', 'truncate');
                tdEmail.style.maxWidth = '250px';
                tdEmail.innerHTML = `<a href="#" onclick="mostrarCorreoCompleto('${user.email || 'N/A'}')">${(user.email || 'N/A').substring(0, 30)}</a>`;

                // Rol
                const tdRol = document.createElement('td');
                tdRol.classList.add('text-left', 'px-2', 'py-2', 'truncate');
                tdRol.style.maxWidth = '100px';
                tdRol.textContent = user.rol || 'Sin rol';

                // Acciones
                const tdAcciones = document.createElement('td');
                tdAcciones.classList.add('text-left', 'px-2', 'py-2');
                tdAcciones.style.minWidth = '100px'; // Asegurar espacio para botones
                tdAcciones.innerHTML = `
                    <div class="flex gap-2 items-center justify-center">
                        <button
                            onclick="openEditUserPopup('${user.id}', '${user.nombre || ''}', '${user.email || ''}', '${user.rol_nombre || ''}')"
                            class="hover:cursor-pointer"
                            title="Editar Usuario"
                        >
                            <img
                                class="h-8 w-8" 
                                src="../assets/icons/general/edit.png"
                                alt="edit"
                            />
                        </button>
                        <button
                            onclick="openDeleteUserPopup('${user.id}')"
                            class="hover:cursor-pointer"
                            title="Eliminar Usuario"
                        >
                            <img
                                class="h-9 w-9" 
                                src="../assets/icons/general/delete.png"
                                alt="delete"
                            />
                        </button>
                    </div>
                `;

                // tr.appendChild(tdId);
                tr.appendChild(tdNombre);
                tr.appendChild(tdEmail);
                tr.appendChild(tdRol);
                tr.appendChild(tdAcciones);

                userListBody.appendChild(tr);
            });
        } else {
            userListBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No hay usuarios registrados.</td></tr>';
        }
    } catch (apiError) {
        console.error('Error en la API al cargar los usuarios:', apiError);
        userListBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Error crítico al cargar usuarios.</td></tr>`;
    }
}

window.mostrarCorreoCompleto = function(correo) {
    document.getElementById('correoCompleto').innerText = correo;
    document.getElementById('modalCorreo').classList.remove('hidden');
};