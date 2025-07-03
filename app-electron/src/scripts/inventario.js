document.getElementsByName('searchInput')[0].addEventListener('keyup', async (event) => {
  const query = event.target.value.trim();
  if (query.length > 0) {
    const result = await window.electronAPI.searchProductos(query);
    if (result.error) {
      console.error('Error al buscar productos:', result.error);
    } else {
      renderProductos(result.data);
    }
  } else {
    await loadAllProductos();
  }
});

async function loadAllProductos() {
  try {
    const result = await window.electronAPI.getAllProductos();
    if (result.error) {
      console.error('Error al cargar todos los productos:', result.error);
    } else if (!result.data || result.data.length === 0) {
    return;
    }  else {
      renderProductos(result.data);
    }
  } catch (error) {
    console.error('Error inesperado al cargar todos los productos:', error);
  }
}

function renderProductos(productos) {
    const container = document.querySelector('#cards-grid'); // Usar el ID único del contenedor de las cards
    container.innerHTML = ''; // Limpia el contenedor antes de renderizar

    productos.forEach((producto) => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md overflow-hidden border border-gray-200';
        card.innerHTML = `
            <div class="w-full h-35 bg-gray-200 flex items-center justify-center border-b border-gray-300">
                <img src="../assets/img/inventario/cono.jpg" alt="Inventario icon" class="w-full h-full object-fill rounded-t-lg" />
            </div>
            <div class="p-4">
                <h3 class="text-lg font-medium text-gray-800 mb-1">${producto.nombre} [${producto.id}]</h3>
                <p class="text-sm text-gray-600">${producto.categoria}</p>
                <p class="text-base font-semibold text-gray-900 mt-2">$${producto.precio}</p>
                <p class="text-sm text-gray-600">Stock: ${producto.cantidad}</p>
                <div class="flex justify-end gap-3 mt-4">
                    <button class="hover:cursor-pointer" onclick="openEditModal('${producto.id}')">
                        <img class="size-6" src="../assets/icons/general/edit.png" alt="edit" />
                    </button>
                    <button class="hover:cursor-pointer" onclick="openDeletePopup('${producto.id}')">
                        <img class="size-7" src="../assets/icons/general/delete.png" alt="delete" />
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Asegúrate de que el contenedor tenga las clases necesarias para la cuadrícula
    container.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-10', 'py-6', 'max-w-6xl', 'w-full', 'mx-auto');
}

function buildProductoSchema(modalId) {
  const modal = document.getElementById(modalId); // Obtén el contenedor del modal dinámicamente
  const categoriaInput = modal.querySelector("input[name='categoria']").value;

  // Mapear categorías a sus respectivos IDs
  const categoriaMap = {
    "Seguridad Vial": 1,
    "Implementos De Seguridad": 2
  };

  const productoSchema = {
    nombre: modal.querySelector("input[name='nombre']").value,
    id: modal.querySelector("input[name='id']").value,
    descripcion: modal.querySelector("textarea[name='descripcion']").value,
    precio: modal.querySelector("input[name='precio']").value,
    cantidad: modal.querySelector("input[name='cantidad']").value,
    id_categoria: categoriaMap[capitalizeCategory(categoriaInput)],
    // imagen: modal.querySelector("input[name='imagen']")?.value || "", // Si aplica
  };

  // Validar categoría
  if (!productoSchema.id_categoria) {
    // alert("Categoría inválida. Las categorías válidas son: Seguridad Vial e Implementos De Seguridad.");
    throw new Error("Categoría inválida");
  }

  return productoSchema;
}

function capitalizeCategory(category) {
  return category
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function openEditModal(productId) {
  const editModal = document.getElementById("edit-modal");
  editModal.classList.remove("hidden");

  // Mapear IDs de categoría a nombres
  const categoriaMap = {
    1: "Seguridad Vial",
    2: "Implementos De Seguridad"
  };

  // Cargar datos del producto en el modal
  window.electronAPI.getProductoByID(productId).then((result) => {
    console.log("ID proporcionado desde el frontend:", productId); // Log del ID proporcionado
    console.log("Resultado de getProductoByID:", result); // Log del resultado obtenido
    if (result.error) {
      console.error("Error al obtener producto para editar:", result.error);
      mostrarMensaje("Error al cargar datos del producto.", "error");
    } else {
      const producto = result.data;

      // Asegúrate de que los campos del modal existan antes de asignar valores
      const nombreInput = editModal.querySelector("input[name='nombre']");
      const idInput = editModal.querySelector("input[name='id']");
      const descripcionInput = editModal.querySelector("textarea[name='descripcion']");
      const precioInput = editModal.querySelector("input[name='precio']");
      const cantidadInput = editModal.querySelector("input[name='cantidad']");
      const categoriaInput = editModal.querySelector("input[name='categoria']");

      console.log("Datos del producto obtenidos:", producto); // Log para depuración

      if (nombreInput) nombreInput.value = producto.nombre || "";
      if (idInput) idInput.value = producto.id || "";
      if (descripcionInput) descripcionInput.value = producto.descripcion || "";
      if (precioInput) precioInput.value = producto.precio || "";
      if (cantidadInput) cantidadInput.value = producto.cantidad || "";
      if (categoriaInput) categoriaInput.value = categoriaMap[producto.id_categoria] || "";
    }
  }).catch((error) => {
    console.error("Error inesperado al cargar datos del producto:", error);
    mostrarMensaje("Ocurrió un error inesperado al cargar datos del producto.", "error");
  });
}

function openDeletePopup(productId) {
  console.log("ID proporcionado desde el frontend:", productId); // Log del ID proporcionado
  const deletePopup = document.getElementById("delete-popup");
  deletePopup.classList.remove("hidden");

  // Configurar el botón de eliminar
  const deleteButton = deletePopup.querySelector("button[onclick='']");
  deleteButton.onclick = async () => {
    try {
      const result = await window.electronAPI.deleteProducto(productId);
      if (result.error) {
        console.error("Error al eliminar producto:", result.error);
        mostrarMensaje("Error al eliminar producto.", "error");
      } else {
        mostrarMensaje("Producto eliminado exitosamente.", "success");
        deletePopup.classList.add("hidden");

        // Refrescar la lista de productos
        const productos = await window.electronAPI.getAllProductos();
        console.log("Productos cargados después de eliminar:", productos);
        if (productos.error) {
          console.error('Error al cargar productos después de eliminar:', productos.error);
            mostrarMensaje('Error al cargar productos después de eliminar. Revisa la consola para más detalles.', 'error');
        }
        renderProductos(productos.data);
      }
    } catch (error) {
      console.error("Error inesperado al eliminar producto:", error);
      mostrarMensaje("Ocurrió un error inesperado al eliminar producto.", "error");
    }
  };
}

// Función para manejar la creación de un producto
window.handleCreateProducto = async function handleCreateProducto() {
  console.log("Iniciando flujo para agregar producto");
  try {
    debugger
    const productoSchema = buildProductoSchema("add-modal"); // Especifica el modal de origen
    console.log("Producto schema construido:", productoSchema);

    // Validaciones básicas
    if (!productoSchema.nombre || !productoSchema.id || !productoSchema.descripcion || !productoSchema.precio || !productoSchema.cantidad || !productoSchema.id_categoria) {
      const errorMessage = "Campos incompletos. Por favor, completa todos los campos.";
      console.error(errorMessage, { productoSchema });
      mostrarMensaje(errorMessage, "error");
      return;
    }

    console.log("Enviando datos al backend:", productoSchema);
    const result = await window.electronAPI.createProducto(productoSchema);
    console.log("Respuesta del backend:", result);

    if (result.error) {
      console.error("Error al crear producto en Supabase", { error: result.error, productoSchema });
      mostrarMensaje("Error al crear producto: " + result.error, "error");
    } else {
      console.log("Producto creado exitosamente:", result.data);
      mostrarMensaje("Producto creado exitosamente.", "success");
      document.getElementById("add-modal").classList.add("hidden");

      // Refresca la lista de productos
      console.log("Cargando lista de productos actualizada");
      const productos = await window.electronAPI.getAllProductos();
      console.log("Productos cargados:", productos);
      renderProductos(productos.data);
    }
  } catch (error) {
    console.error("Error inesperado en handleCreateProducto:", error);
    mostrarMensaje("Ocurrió un error. Revisa la consola para más detalles.", "error");
  }
};

// Función para manejar la actualización de un producto
window.handleUpdateProducto = async function handleUpdateProducto() {
  try {
    const productoSchema = buildProductoSchema("edit-modal"); // Especifica el modal de origen

    // Validaciones básicas
    if (!productoSchema.nombre || !productoSchema.id || !productoSchema.descripcion || !productoSchema.precio || !productoSchema.cantidad || !productoSchema.id_categoria) {
      const errorMessage = "Campos incompletos. Por favor, completa todos los campos.";
      console.error(errorMessage, { productoSchema });
      mostrarMensaje(errorMessage, "error");
      return;
    }

    console.log("Datos enviados al backend para actualización:", productoSchema);
    const result = await window.electronAPI.updateProducto(productoSchema.id, productoSchema);

    if (result.error) {
      console.error("Error al actualizar producto en Supabase", { error: result.error, productoSchema });
      mostrarMensaje("Error al actualizar producto: " + result.error, "error");
    } else {
      console.log("Producto actualizado exitosamente:", result.data);
      mostrarMensaje("Producto actualizado exitosamente.", "success");
      document.getElementById("edit-modal").classList.add("hidden");

      // Refresca la lista de productos
      const productos = await window.electronAPI.getAllProductos();
      renderProductos(productos.data);
    }
  } catch (error) {
    console.error("Error inesperado en handleUpdateProducto:", error);
    mostrarMensaje("Ocurrió un error inesperado. Revisa la consola para más detalles.", "error");
  }
};

// Cargar productos automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const productos = await window.electronAPI.getAllProductos();
    if (productos.error) {
      console.error('Error al cargar productos:', productos.error);
      mostrarMensaje('Error al cargar productos. Revisa la consola para más detalles.', 'error');
    } else {
      renderProductos(productos.data);
    }
  } catch (error) {
    console.error('Error inesperado al cargar productos:', error);
    mostrarMensaje('Ocurrió un error inesperado al cargar productos.', 'error');
  }
});

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