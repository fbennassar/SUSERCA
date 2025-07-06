const mensajeDiv = document.createElement('div');
mensajeDiv.id = 'mensaje-usuario';
mensajeDiv.style.position = 'fixed';
mensajeDiv.style.top = '20px';
mensajeDiv.style.right = '20px';
mensajeDiv.style.zIndex = '9999';
mensajeDiv.style.padding = '12px 24px';
mensajeDiv.style.borderRadius = '8px';
mensajeDiv.style.display = 'none';
mensajeDiv.style.fontWeight = 'bold';
document.body.appendChild(mensajeDiv);

function mostrarMensaje(texto, tipo = 'success') {
  mensajeDiv.textContent = texto;
  mensajeDiv.style.display = 'block';
  mensajeDiv.style.background = tipo === 'success' ? '#22c55e' : '#ef4444';
  mensajeDiv.style.color = '#fff';
  setTimeout(() => {
    mensajeDiv.style.display = 'none';
  }, 3500);
}


function buildClientSchema(modalId) {
  const modal = document.getElementById(modalId); // Obtén el contenedor del modal dinámicamente
  const clienteSchema = {
    nombre: modal.querySelector("input[name='nombre']").value,
    id: modal.querySelector("input[name='id']").value,
    email: modal.querySelector("input[name='email']").value,
    telefono: modal.querySelector("input[name='telefono']").value,
    direccion: modal.querySelector("textarea[name='direccion']").value,
    // imagen: modal.querySelector("input[name='imagen']")?.value || "", // Si aplica
  };

  return clienteSchema;
}

function renderClients(clients) {
  const container = document.querySelector(".grid");
  container.innerHTML = ""; // Limpia el contenedor antes de renderizar

  if (!clients || clients.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 col-span-full py-10">No hay clientes para mostrar.</p>';
    return; // Detiene la ejecución para no renderizar nada más
  }
  clients.forEach((client) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200";
    card.innerHTML = `
      <div class="w-full h-35 bg-gray-200 flex items-center justify-center border-b border-gray-300">
        <img src="../assets/img/clientes/cliente.jpg" alt="Cliente" class="w-full h-full object-fill rounded-t-lg" />
      </div>
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-800 mb-1">${client.nombre}</h3>
        <p class="text-base font-semibold text-gray-900 mt-2">RIF: ${client.id}</p>
        <div class="flex justify-end gap-3 mt-4">
          <button class="hover:cursor-pointer" onclick="openEditModal('${client.id}')">
            <img class="size-6" src="../assets/icons/general/edit.png" alt="edit" />
          </button>
          <button class="hover:cursor-pointer" onclick="openDeletePopup('${client.id}')">
            <img class="size-7" src="../assets/icons/general/delete.png" alt="delete" />
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

document.getElementsByName('searchInput')[0].addEventListener('keyup', async (event) => {
  const query = event.target.value.trim(); // Obtener el valor del campo de búsqueda y eliminar espacios
  if (query.length > 0) {
    const result = await window.electronAPI.searchClients(query);
    if (result.error) {
      console.error('Error al buscar clientes:', result.error);
    } else {
      renderClients(result.data); // Actualizar la lista de clientes directamente con renderClients
    }
  } else {
    await loadAllClients(); // Cargar todos los clientes si el campo está vacío
  }
});

async function loadAllClients() {
  try {
    const result = await window.electronAPI.getAllClients();
    if (result.error) {
      console.error('Error al cargar todos los clientes:', result.error);
    } else {
      renderClients(result.data); // Renderiza todos los clientes
    }
  } catch (error) {
    console.error('Error inesperado al cargar todos los clientes:', error);
  }
}

function openEditModal(clientId) {
  const editModal = document.getElementById("edit-modal");
  editModal.classList.remove("hidden");

  // Cargar datos del cliente en el modal
  window.electronAPI.getClientByID(clientId).then((result) => {
    console.log("ID proporcionado desde el frontend:", clientId); // Log del ID proporcionado
    console.log("Resultado de getClientById:", result); // Log del resultado obtenido
    if (result.error) {
      console.error("Error al obtener cliente para editar:", result.error);
      mostrarMensaje("Error al cargar datos del cliente.", 'error');
    } else {
      const client = result.data;

      // Asegúrate de que los campos del modal existan antes de asignar valores
      const nombreInput = editModal.querySelector("input[name='nombre']");
      const idInput = editModal.querySelector("input[name='id']");
      const emailInput = editModal.querySelector("input[name='email']");
      const telefonoInput = editModal.querySelector("input[name='telefono']");
      const direccionInput = editModal.querySelector("textarea[name='direccion']");

      console.log("Datos del cliente obtenidos:", client); // Log para depuración

      if (nombreInput) nombreInput.value = client.nombre || "";
      if (idInput) idInput.value = client.id || "";
      if (emailInput) emailInput.value = client.email || "";
      if (telefonoInput) telefonoInput.value = client.telefono || "";
      if (direccionInput) direccionInput.value = client.direccion || "";
    }
  }).catch((error) => {
    console.error("Error inesperado al cargar datos del cliente:", error);
    mostrarMensaje("Ocurrió un error inesperado al cargar datos del cliente.", 'error');
  });

}

function openDeletePopup(clientId) {
  console.log("ID proporcionado desde el frontend:", clientId); // Log del ID proporcionado
  const deletePopup = document.getElementById("delete-popup");
  deletePopup.classList.remove("hidden");

  // Configurar el botón de eliminar
  const deleteButton = deletePopup.querySelector("button[onclick='']");
  deleteButton.onclick = async () => {
    try {
      const result = await window.electronAPI.deleteClient(clientId);
      if (result.error) {
        console.error("Error al eliminar cliente:", result.error);
        mostrarMensaje("Error al eliminar cliente.", 'error');
      } else {
        mostrarMensaje("Cliente eliminado exitosamente.", 'success');
        deletePopup.classList.add("hidden");

        // Refrescar la lista de clientes
        const clients = await window.electronAPI.getAllClients();
        renderClients(clients.data);
      }
    } catch (error) {
      console.error("Error inesperado al eliminar cliente:", error);
      mostrarMensaje("Ocurrió un error inesperado al eliminar cliente.", 'error');
    }
  };
}

// Función para manejar la creación de un cliente
window.handleCreateClient = async function handleCreateClient() {
  try {
    const clienteSchema = buildClientSchema("add-modal"); // Especifica el modal de origen

    // Validaciones básicas
    if (!clienteSchema.nombre || !clienteSchema.id || !clienteSchema.email || !clienteSchema.telefono || !clienteSchema.direccion) {
      const errorMessage = "Campos incompletos. Por favor, completa todos los campos.";
      console.error(errorMessage, { clienteSchema });
      mostrarMensaje(errorMessage, 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteSchema.email)) {
      const errorMessage = "Email inválido. Por favor, ingresa un email válido.";
      console.error(errorMessage, { email: clienteSchema.email });
      mostrarMensaje(errorMessage, 'error');
      return;
    }

    console.log("Datos enviados al backend:", clienteSchema);
    const result = await window.electronAPI.createClient(clienteSchema);

    if (result.error) {
      console.error("Error al crear cliente en Supabase", { error: result.error, clienteSchema });
      mostrarMensaje("Error al crear cliente: " + result.error, 'error');
    } else {
      console.log("Cliente creado exitosamente:", result.data);
      mostrarMensaje("Cliente creado exitosamente.", 'success');
      document.getElementById("add-modal").classList.add("hidden");

      // Refresca la lista de clientes
      const clients = await window.electronAPI.getAllClients();
      renderClients(clients.data);
    }
  } catch (error) {
    console.error("Error inesperado en handleCreateClient:", error);
    mostrarMensaje("Ocurrió un error. Revisa la consola para más detalles.", 'error');
  }
};

// Función para manejar la actualización de un cliente
window.handleUpdateClient = async function handleUpdateClient() {
  try {
    const clienteSchema = buildClientSchema("edit-modal"); // Especifica el modal de origen

    // Validaciones básicas
    if (!clienteSchema.nombre || !clienteSchema.id || !clienteSchema.email || !clienteSchema.telefono || !clienteSchema.direccion) {
      const errorMessage = "Campos incompletos. Por favor, completa todos los campos.";
      console.error(errorMessage, { clienteSchema });
      mostrarMensaje(errorMessage, 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteSchema.email)) {
      const errorMessage = "Email inválido. Por favor, ingresa un email válido.";
      console.error(errorMessage, { email: clienteSchema.email });
      mostrarMensaje(errorMessage, 'error');
      return;
    }

    console.log("Datos enviados al backend para actualización:", clienteSchema);
    const result = await window.electronAPI.updateClient(clienteSchema.id, clienteSchema);

    if (result.error) {
      console.error("Error al actualizar cliente en Supabase", { error: result.error, clienteSchema });
      mostrarMensaje("Error al actualizar cliente: " + result.error, 'error');
    } else {
      console.log("Cliente actualizado exitosamente:", result.data);
      mostrarMensaje("Cliente actualizado exitosamente.", 'success');
      document.getElementById("edit-modal").classList.add("hidden");

      // Refresca la lista de clientes
      const clients = await window.electronAPI.getAllClients();
      renderClients(clients.data);
    }
  } catch (error) {
    console.error("Error inesperado en handleUpdateClient:", error);
    mostrarMensaje("Ocurrió un error inesperado. Revisa la consola para más detalles.", 'error');
  }
};


// Cargar clientes automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const clients = await window.electronAPI.getAllClients();
    if (clients.error) {
      console.error('Error al cargar clientes:', clients.error);
      mostrarMensaje('Error al cargar clientes. Revisa la consola para más detalles.', 'error');
    } else {
      renderClients(clients.data);
    }
  } catch (error) {
    console.error('Error inesperado al cargar clientes:', error);
    mostrarMensaje('Ocurrió un error inesperado al cargar clientes.', 'error');
  }
});