function buildProveedorSchema(modalId) {
  const modal = document.getElementById(modalId); // Obtén el contenedor del modal dinámicamente
  const proveedorSchema = {
    nombre: modal.querySelector("input[name='nombre']").value,
    id: modal.querySelector("input[name='id']").value,
    email: modal.querySelector("input[name='email']").value,
    telefono: modal.querySelector("input[name='telefono']").value,
    direccion: modal.querySelector("input[name='direccion']").value,
    // imagen: modal.querySelector("input[name='imagen']")?.value || "", // Si aplica
  };

  return proveedorSchema;
}

function renderProveedores(proveedores) {
  const container = document.querySelector(".grid");
  container.innerHTML = ""; // Limpia el contenedor antes de renderizar
  proveedores.forEach((proveedor) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200";
    card.innerHTML = `
      <div class="w-full h-35 bg-gray-200 flex items-center justify-center border-b border-gray-300">
        <img src="../assets/img/proveedores/proveedor.jpg" alt="Proveedor" class="w-full h-full object-fill rounded-t-lg" />
      </div>
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-800 mb-1">${proveedor.nombre}</h3>
        <p class="text-base font-semibold text-gray-900 mt-2">${proveedor.id}</p>
        <div class="flex justify-end gap-3 mt-4">
          <button class="hover:cursor-pointer" onclick="openEditModal('${proveedor.id}')">
            <img class="size-6" src="../assets/icons/general/edit.png" alt="edit" />
          </button>
          <button class="hover:cursor-pointer" onclick="openDeletePopup('${proveedor.id}')">
            <img class="size-7" src="../assets/icons/general/delete.png" alt="delete" />
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function openEditModal(proveedorId) {
  const editModal = document.getElementById("edit-modal");
  editModal.classList.remove("hidden");

  // Cargar datos del proveedor en el modal
  window.electronAPI.getProveedorById(proveedorId).then((result) => {
    if (result.error) {
      console.error("Error al obtener proveedor para editar:", result.error);
      alert("Error al cargar datos del proveedor.");
    } else {
      const proveedor = result.data;

      // Asegúrate de que los campos del modal existan antes de asignar valores
      const nombreInput = editModal.querySelector("input[name='nombre']");
      const idInput = editModal.querySelector("input[name='id']");
      const emailInput = editModal.querySelector("input[name='email']");
      const telefonoInput = editModal.querySelector("input[name='telefono']");
      const direccionInput = editModal.querySelector("input[name='direccion']");

      console.log("Datos del proveedor obtenidos:", proveedor); // Log para depuración

      if (nombreInput) nombreInput.value = proveedor.nombre || "";
      if (idInput) idInput.value = proveedor.id || "";
      if (emailInput) emailInput.value = proveedor.email || "";
      if (telefonoInput) telefonoInput.value = proveedor.telefono || "";
      if (direccionInput) direccionInput.value = proveedor.direccion || "";
    }
  }).catch((error) => {
    console.error("Error inesperado al cargar datos del proveedor:", error);
    alert("Ocurrió un error inesperado al cargar datos del proveedor.");
  });
}

function openDeletePopup(proveedorId) {
  console.log("ID proporcionado desde el frontend:", proveedorId); // Log del ID proporcionado
  const deletePopup = document.getElementById("delete-popup");
  deletePopup.classList.remove("hidden");

  // Configurar el botón de eliminar
  const deleteButton = deletePopup.querySelector("button[onclick='']");
  deleteButton.onclick = async () => {
    try {
      const result = await window.electronAPI.deleteProveedor(proveedorId);
      if (result.error) {
        console.error("Error al eliminar proveedor:", result.error);
        alert("Error al eliminar proveedor.");
      } else {
        alert("Proveedor eliminado exitosamente.");
        deletePopup.classList.add("hidden");

        // Refrescar la lista de proveedores
        const proveedores = await window.electronAPI.getAllProveedores();
        renderProveedores(proveedores.data);
      }
    } catch (error) {
      console.error("Error inesperado al eliminar proveedor:", error);
      alert("Ocurrió un error inesperado al eliminar proveedor.");
    }
  };
}

// Función para manejar la creación de un proveedor
window.handleCreateProveedor = async function handleCreateProveedor() {
  try {
    const proveedorSchema = buildProveedorSchema("add-modal"); // Especifica el modal de origen

    // Validaciones básicas
    if (!proveedorSchema.nombre || !proveedorSchema.id || !proveedorSchema.email || !proveedorSchema.telefono || !proveedorSchema.direccion) {
      const errorMessage = "Campos incompletos. Por favor, completa todos los campos.";
      console.error(errorMessage, { proveedorSchema });
      alert(errorMessage);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proveedorSchema.email)) {
      const errorMessage = "Email inválido. Por favor, ingresa un email válido.";
      console.error(errorMessage, { email: proveedorSchema.email });
      alert(errorMessage);
      return;
    }

    console.log("Datos enviados al backend:", proveedorSchema);
    const result = await window.electronAPI.createProveedor(proveedorSchema);

    if (result.error) {
      console.error("Error al crear proveedor en Supabase", { error: result.error, proveedorSchema });
      alert("Error al crear proveedor: " + result.error);
    } else {
      console.log("Proveedor creado exitosamente:", result.data);
      alert("Proveedor creado exitosamente.");
      document.getElementById("add-modal").classList.add("hidden");

      // Refresca la lista de proveedores
      const proveedores = await window.electronAPI.getAllProveedores();
      renderProveedores(proveedores.data);
    }
  } catch (error) {
    console.error("Error inesperado en handleCreateProveedor:", error);
    alert("Ocurrió un error. Revisa la consola para más detalles.");
  }
};

// Función para manejar la actualización de un proveedor
window.handleUpdateProveedor = async function handleUpdateProveedor() {
  try {
    const proveedorSchema = buildProveedorSchema("edit-modal"); // Especifica el modal de origen

    // Validaciones básicas
    if (!proveedorSchema.nombre || !proveedorSchema.id || !proveedorSchema.email || !proveedorSchema.telefono || !proveedorSchema.direccion) {
      const errorMessage = "Campos incompletos. Por favor, completa todos los campos.";
      console.error(errorMessage, { proveedorSchema });
      alert(errorMessage);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proveedorSchema.email)) {
      const errorMessage = "Email inválido. Por favor, ingresa un email válido.";
      console.error(errorMessage, { email: proveedorSchema.email });
      alert(errorMessage);
      return;
    }

    console.log("Datos enviados al backend para actualización:", proveedorSchema);
    const result = await window.electronAPI.updateProveedor(proveedorSchema.id, proveedorSchema);

    if (result.error) {
      console.error("Error al actualizar proveedor en Supabase", { error: result.error, proveedorSchema });
      alert("Error al actualizar proveedor: " + result.error);
    } else {
      console.log("Proveedor actualizado exitosamente:", result.data);
      alert("Proveedor actualizado exitosamente.");
      document.getElementById("edit-modal").classList.add("hidden");

      // Refresca la lista de proveedores
      const proveedores = await window.electronAPI.getAllProveedores();
      renderProveedores(proveedores.data);
    }
  } catch (error) {
    console.error("Error inesperado en handleUpdateProveedor:", error);
    alert("Ocurrió un error inesperado. Revisa la consola para más detalles.");
  }
};

// Cargar proveedores automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const proveedores = await window.electronAPI.getAllProveedores();
    if (proveedores.error) {
      console.error('Error al cargar proveedores:', proveedores.error);
      alert('Error al cargar proveedores. Revisa la consola para más detalles.');
    } else {
      renderProveedores(proveedores.data);
    }
  } catch (error) {
    console.error('Error inesperado al cargar proveedores:', error);
    alert('Ocurrió un error inesperado al cargar proveedores.');
  }
});

document.getElementsByName('searchInput')[0].addEventListener('keyup', async (event) => {
  const query = event.target.value.trim(); // Obtener el valor del campo de búsqueda y eliminar espacios
  if (query.length > 0) {
    const result = await window.electronAPI.searchProveedores(query);
    if (result.error) {
      console.error('Error al buscar proveedores:', result.error);
    } else {
      renderProveedores(result.data); // Actualizar la lista de proveedores directamente con renderProveedores
    }
  } else {
    await loadAllProveedores(); // Cargar todos los proveedores si el campo está vacío
  }
});

async function loadAllProveedores() {
  try {
    const result = await window.electronAPI.getAllProveedores();
    if (result.error) {
      console.error('Error al cargar todos los proveedores:', result.error);
    } else {
      renderProveedores(result.data); // Renderiza todos los proveedores
    }
  } catch (error) {
    console.error('Error inesperado al cargar todos los proveedores:', error);
  }
}
