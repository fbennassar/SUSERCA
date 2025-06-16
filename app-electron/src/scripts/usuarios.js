window.addEventListener('DOMContentLoaded', async () => {
    const selectRolForm = document.getElementById('selectRol'); // Select para el formulario de invitación
    const filterNombreInput = document.getElementById('filterNombre');
    const selectRolFilter = document.getElementById('selectRolFilter'); // Select para el filtro de la tabla

    // --- GESTIONAR VISIBILIDAD DEL FORMULARIO DE INVITACIÓN ---
    const inviteUserSection = document.getElementById('inviteUserSection'); // Asegúrate que este ID exista en tu HTML
    if (inviteUserSection) {
        try {
            const currentUserData = await window.electronAPI.getProfile(); // Llama a auth:getProfile
            if (currentUserData && currentUserData.profile && currentUserData.profile.rol && currentUserData.profile.rol.nombre === 'Gerente') {
                inviteUserSection.classList.remove('hidden');
            } else {
                inviteUserSection.classList.add('hidden');
                console.log('Usuario no es Gerente o no se pudo obtener el perfil. Ocultando sección de invitación.');
            }
        } catch (error) {
            console.error('Error al obtener el perfil del usuario para gestionar la invitación:', error);
            inviteUserSection.classList.add('hidden');
        }
    }
    // --- FIN GESTIÓN VISIBILIDAD ---

    // Carga de roles en los selects
    try {
        const { rol: rolesArray, error } = await window.electronAPI.getRol(); // 'rolesArray' es el array aquí
        console.log('Roles obtenidos:', rolesArray);
        if (error) {
            console.error('Error al obtener los roles:', error);
            const option = document.createElement('option');
            option.textContent = 'Error al cargar roles';
            if (selectRolForm) selectRolForm.appendChild(option.cloneNode(true));
            if (selectRolFilter) selectRolFilter.appendChild(option);
            // Considera no continuar si los roles no se cargan
        } else if (rolesArray && rolesArray.length > 0) {
            rolesArray.forEach(rolItem => { // Corregido: usar rolItem para evitar shadowing
                const option = document.createElement('option');
                option.value = rolItem.id;
                option.textContent = rolItem.nombre;
                if (selectRolForm) selectRolForm.appendChild(option.cloneNode(true));
                if (selectRolFilter) selectRolFilter.appendChild(option.cloneNode(true)); // Clonar también para el filtro
            });
        } else {
            const option = document.createElement('option');
            option.textContent = 'No hay roles disponibles';
            if (selectRolForm) selectRolForm.appendChild(option.cloneNode(true));
            if (selectRolFilter) selectRolFilter.appendChild(option);
        }
    } catch (error) {
        console.error('Error catastrófico al cargar los roles:', error);
        const option = document.createElement('option');
        option.textContent = 'Error crítico al cargar roles';
        if (selectRolForm) selectRolForm.appendChild(option.cloneNode(true));
        if (selectRolFilter) selectRolFilter.appendChild(option);
    }

    const inviteUserForm = document.getElementById('inviteUserForm');
    if (inviteUserForm) {
        inviteUserForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const emailInput = document.getElementById('inviteEmail');
            // const rolSelectForm = document.getElementById('selectRol'); // Ya definido como selectRolForm

            const email = emailInput.value.trim();
            const rolId = selectRolForm.value; // Usar selectRolForm

            if (!email || !rolId) {
                alert('Por favor, ingrese el correo y seleccione un rol.');
                return;
            }

            const redirectTo = `${window.location.origin}/src/views/login.html`;
            const submitButton = inviteUserForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            try {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';
                const { data, error } = await window.electronAPI.inviteUser({ email, rolId, redirectTo });
                if (error) {
                    console.error('Error al enviar invitación:', error);
                    alert(`Error al enviar invitación: ${error}`);
                } else {
                    console.log('Invitación enviada:', data);
                    alert('Invitación enviada exitosamente.');
                    emailInput.value = '';
                    selectRolForm.value = ''; // Resetear el select del formulario
                    selectRolForm.classList.add('text-gray-400');
                    selectRolForm.classList.remove('text-black');
                }
            } catch (e) {
                console.error('Error inesperado al enviar invitación:', e);
                alert('Ocurrió un error inesperado. Por favor, intente de nuevo.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    const limpiarFiltrosBtn = document.getElementById('limpiarFiltros');
    if (limpiarFiltrosBtn) {
        limpiarFiltrosBtn.addEventListener('click', async () => {
            if(filterNombreInput) filterNombreInput.value = '';
            if(selectRolFilter) {
                selectRolFilter.value = '';
                selectRolFilter.classList.add('text-gray-400');
                selectRolFilter.classList.remove('text-black');
            }
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

    if (selectRolFilter) {
        selectRolFilter.addEventListener('change', async () => {
            const nombre = filterNombreInput ? filterNombreInput.value : '';
            const rol = selectRolFilter.value;
            if (rol) { // Cambiar estilo si se selecciona un rol
                selectRolFilter.classList.remove('text-gray-400');
                selectRolFilter.classList.add('text-black');
            } else { // Volver al estilo por defecto si se deselecciona
                selectRolFilter.classList.add('text-gray-400');
                selectRolFilter.classList.remove('text-black');
            }
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
            userListBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Error al cargar usuarios: ${error}</td></tr>`; // Ajustar colspan
            return;
        }

        userListBody.innerHTML = ''; 

        if (users && users.length > 0) {
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.classList.add('divide-x', 'divide-gray-200');
                tr.setAttribute('data-user-id', user.id);

                const tdNombre = document.createElement('td');
                tdNombre.classList.add('text-left', 'px-2', 'py-2', 'truncate');
                tdNombre.style.maxWidth = '120px';
                tdNombre.textContent = user.nombre || 'N/A';

                const tdEmail = document.createElement('td');
                tdEmail.classList.add('text-left', 'px-2', 'py-2', 'truncate');
                tdEmail.style.maxWidth = '250px';
                // Corregido para mostrar puntos suspensivos si el correo es largo
                tdEmail.innerHTML = `<a href="#" onclick="mostrarCorreoCompleto('${user.email || 'N/A'}')">${(user.email || 'N/A').substring(0, 30)}${(user.email && user.email.length > 30) ? '...' : ''}</a>`;

                const tdRol = document.createElement('td');
                tdRol.classList.add('text-left', 'px-2', 'py-2', 'truncate');
                tdRol.style.maxWidth = '100px';
                tdRol.textContent = user.rol || 'Sin rol';

                const tdAcciones = document.createElement('td');
                tdAcciones.classList.add('text-left', 'px-2', 'py-2');
                tdAcciones.style.minWidth = '100px'; 
                tdAcciones.innerHTML = `
                    <div class="flex gap-2 items-center justify-center">
                        <button
                            onclick="openEditUserPopup('${user.id}', '${user.nombre || ''}', '${user.email || ''}', '${user.rol || ''}')" 
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

                tr.appendChild(tdNombre);
                tr.appendChild(tdEmail);
                tr.appendChild(tdRol);
                tr.appendChild(tdAcciones);

                userListBody.appendChild(tr);
            });
        } else {
            userListBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No hay usuarios registrados.</td></tr>'; // Ajustar colspan
        }
    } catch (apiError) {
        console.error('Error en la API al cargar los usuarios:', apiError);
        userListBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Error crítico al cargar usuarios.</td></tr>`; // Ajustar colspan
    }
}

window.mostrarCorreoCompleto = function(correo) {
    document.getElementById('correoCompleto').innerText = correo;
    document.getElementById('modalCorreo').classList.remove('hidden');
};

// Definiciones de ejemplo para las funciones de popup (debes tener las tuyas)
window.openEditUserPopup = function(id, nombre, email, rol) { 
    console.log('Abrir popup de edición para:', id, nombre, email, rol);
    // Aquí iría la lógica para mostrar tu modal/popup de edición
};
window.openDeleteUserPopup = function(id) { 
    console.log('Abrir popup de eliminación para:', id);
    // Aquí iría la lógica para mostrar tu modal/popup de eliminación
};