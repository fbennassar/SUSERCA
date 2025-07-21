// Crear el div de mensajes flotantes
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

function buildProveedorSchema(modalId) {
  const modal = document.getElementById(modalId); // Obtén el contenedor del modal dinámicamente
  const proveedorSchema = {
    nombre: modal.querySelector("input[name='nombre']").value,
    id: modal.querySelector("input[name='id']").value,
    email: modal.querySelector("input[name='email']").value,
    telefono: modal.querySelector("input[name='telefono']").value,
    direccion: modal.querySelector("textarea[name='direccion']").value,
    // imagen: modal.querySelector("input[name='imagen']")?.value || "", // Si aplica
  };

  return proveedorSchema;
}

function renderProveedores(proveedores) {
  const container = document.querySelector(".grid");
  container.innerHTML = ""; // Limpia el contenedor antes de renderizar

 
  if (!proveedores || proveedores.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 col-span-full py-10">No hay proveedores para mostrar.</p>';
    return; // Detiene la ejecución para no renderizar nada más
  }
 

  proveedores.forEach((proveedor) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200";
    const getValue = (value, defaultValue = 'Sin información') => (value === null ? defaultValue : value);
    card.innerHTML = `
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-800 mb-1">${getValue(proveedor.nombre)}</h3>
        <p class="text-base font-semibold text-gray-900 mt-2">RIF: ${getValue(proveedor.id)}</p>
        <p class="text-base font-semibold text-gray-900 mt-2">Correo: ${getValue(proveedor.email)}</p>
        <p class="text-base font-semibold text-gray-900 mt-2">Tlf: ${getValue(proveedor.telefono)}</p>
        <p class="text-base font-semibold text-gray-900 mt-2">Dirección fiscal: ${getValue(proveedor.direccion)}</p>
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
async function recargarProveedores() {
  const container = document.querySelector(".grid");
  const result = await window.electronAPI.getAllProveedores();

  if (result.error) {
    console.error('Error al recargar proveedores:', result.error);
    mostrarMensaje('Error al recargar proveedores.', 'error');
    // No hagas nada con la vista, déjala como está para que el usuario vea los datos antiguos.
    return; 
  }

  if (!result.data || result.data.length === 0) {
    // Si no hay datos, muestra un mensaje en lugar de dejar la vista en blanco.
    container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No hay proveedores para mostrar.</p>';
  } else {
    // Solo renderiza si realmente hay datos.
    renderProveedores(result.data);
  }
}
function openEditModal(proveedorId) {
  const editModal = document.getElementById("edit-modal");
  editModal.classList.remove("hidden");

  // Cargar datos del proveedor en el modal
  window.electronAPI.getProveedorById(proveedorId).then((result) => {
    if (result.error) {
      console.error("Error al obtener proveedor para editar:", result.error);
      mostrarMensaje('Error al cargar datos del proveedor.', 'error');
    } else {
      const proveedor = result.data;

      // Asegúrate de que los campos del modal existan antes de asignar valores
      const nombreInput = editModal.querySelector("input[name='nombre']");
      const idInput = editModal.querySelector("input[name='id']");
      const emailInput = editModal.querySelector("input[name='email']");
      const telefonoInput = editModal.querySelector("input[name='telefono']");
      const direccionInput = editModal.querySelector("textarea[name='direccion']");

      console.log("Datos del proveedor obtenidos:", proveedor); // Log para depuración

      if (nombreInput) nombreInput.value = proveedor.nombre || "";
      if (idInput) idInput.value = proveedor.id || "";
      if (emailInput) emailInput.value = proveedor.email || "";
      if (telefonoInput) telefonoInput.value = proveedor.telefono || "";
      if (direccionInput) direccionInput.value = proveedor.direccion || "";
    }

  }).catch((error) => {
    console.error("Error inesperado al cargar datos del proveedor:", error);
    mostrarMensaje('Ocurrió un error inesperado al cargar datos del proveedor.', 'error');
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
        mostrarMensaje('Error al eliminar proveedor.', 'error');
      } else {
        mostrarMensaje('Proveedor eliminado exitosamente.', 'success');
        deletePopup.classList.add("hidden");
        await recargarProveedores();
      }
    } catch (error) {
      console.error("Error inesperado al eliminar proveedor:", error);
      mostrarMensaje('Ocurrió un error inesperado al eliminar proveedor.', 'error');
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
      mostrarMensaje(errorMessage, 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proveedorSchema.email)) {
      const errorMessage = "Email inválido. Por favor, ingresa un email válido.";
      console.error(errorMessage, { email: proveedorSchema.email });
      mostrarMensaje(errorMessage, 'error');
      return;
    }

    console.log("Datos enviados al backend:", proveedorSchema);
    const result = await window.electronAPI.createProveedor(proveedorSchema);

    if (result.error) {
      console.error("Error al crear proveedor en Supabase", { error: result.error, proveedorSchema });
      mostrarMensaje('Error al crear proveedor: ' + result.error, 'error');
    } else {
      console.log("Proveedor creado exitosamente:", result.data);
      mostrarMensaje('Proveedor creado exitosamente.', 'success');
      document.getElementById("add-modal").classList.add("hidden");
      await recargarProveedores();
    }
  } catch (error) {
    console.error("Error inesperado en handleCreateProveedor:", error);
    mostrarMensaje('Ocurrió un error. Revisa la consola para más detalles.', 'error');
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
      mostrarMensaje(errorMessage, 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proveedorSchema.email)) {
      const errorMessage = "Email inválido. Por favor, ingresa un email válido.";
      console.error(errorMessage, { email: proveedorSchema.email });
      mostrarMensaje(errorMessage, 'error');
      return;
    }

    console.log("Datos enviados al backend para actualización:", proveedorSchema);
    const result = await window.electronAPI.updateProveedor(proveedorSchema.id, proveedorSchema);

    if (result.error) {
      console.error("Error al actualizar proveedor en Supabase", { error: result.error, proveedorSchema });
      mostrarMensaje('Error al actualizar proveedor: ' + result.error, 'error');
    } else {
      console.log("Proveedor actualizado exitosamente:", result.data);
      mostrarMensaje('Proveedor actualizado exitosamente.', 'success');
      document.getElementById("edit-modal").classList.add("hidden");
      await recargarProveedores();
    }
  } catch (error) {
    console.error("Error inesperado en handleUpdateProveedor:", error);
    mostrarMensaje('Ocurrió un error inesperado. Revisa la consola para más detalles.', 'error');
  }
};

// Cargar proveedores automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const proveedores = await window.electronAPI.getAllProveedores();
    if (proveedores.error) {
      console.error('Error al cargar proveedores:', proveedores.error);
      mostrarMensaje('Error al cargar proveedores. Revisa la consola para más detalles.', 'error');
    } else {
      renderProveedores(proveedores.data);
    }
  } catch (error) {
    console.error('Error inesperado al cargar proveedores:', error);
    mostrarMensaje('Ocurrió un error inesperado al cargar proveedores.', 'error');
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

async function generarReporteProveedores() {
  const cardsContainer = document.querySelector(".grid"); // El contenedor de las cards
  const cards = cardsContainer.querySelectorAll(".bg-white"); // Selecciona cada card

  const data = [];

  cards.forEach((card) => {
    // Extrae la información de cada card
    const razonSocial = card.querySelector(".text-lg")?.textContent || "N/A";
    const rif = card.querySelector(".font-semibold:nth-child(2)")?.textContent.replace("RIF: ", "") || "N/A";
    const email = card.querySelector(".font-semibold:nth-child(3)")?.textContent.replace("Correo: ", "") || "N/A";
    const telefono = card.querySelector(".font-semibold:nth-child(4)")?.textContent.replace("Tlf: ", "") || "N/A";
    const direccion = card.querySelector(".font-semibold:nth-child(5)")?.textContent.replace("Dirección fiscal: ", "") || "N/A";

    // Crea un objeto con la información extraída
    const cardData = {
      razonSocial: razonSocial,
      rif: rif,
      email: email,
      telefono: telefono,
      direccion: direccion,
    };

    console.log("Card data:", cardData); // Log para depuración
    data.push(cardData);
  });

  // Envía los datos al proceso principal a través del IPC
  try {
    await window.electronAPI.generarReporteProveedores(data);
    mostrarMensaje("Reporte generado exitosamente.", "success");
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    mostrarMensaje("Error al generar el reporte.", "error");
  }
}

document.getElementById("btn-reporte").addEventListener("click", () => {
  generarReporteProveedores();
});

document.addEventListener('DOMContentLoaded', () => {
  // Selecciona el input del teléfono en el modal de "Agregar"
  const telefonoInputAgregar = document.getElementById('telefono');
  // Selecciona el input del teléfono en el modal de "Editar"
  const telefonoInputEditar = document.getElementById('edit-telefono');

  // Función reutilizable para limpiar el input
  const limpiarInputTelefono = (event) => {
    // Reemplaza cualquier caracter que NO sea un número (0-9) con nada.
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  };

  // Aplica el escuchador de eventos si los campos existen
  if (telefonoInputAgregar) {
    telefonoInputAgregar.addEventListener('input', limpiarInputTelefono);
  }
  
  if (telefonoInputEditar) {
    telefonoInputEditar.addEventListener('input', limpiarInputTelefono);
  }
});