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
    descripcion: modal.querySelector("input[name='descripcion']").value,
    precio: modal.querySelector("input[name='precio']").value,
    cantidad: modal.querySelector("input[name='cantidad']").value,
    id_categoria: categoriaMap[capitalizeCategory(categoriaInput)],
    // imagen: modal.querySelector("input[name='imagen']")?.value || "", // Si aplica
  };

  // Validar categoría
  if (!productoSchema.id_categoria) {
    alert("Categoría inválida. Las categorías válidas son: Seguridad Vial e Implementos De Seguridad.");
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
      alert("Error al cargar datos del producto.");
    } else {
      const producto = result.data;

      // Asegúrate de que los campos del modal existan antes de asignar valores
      const nombreInput = editModal.querySelector("input[name='nombre']");
      const idInput = editModal.querySelector("input[name='id']");
      const descripcionInput = editModal.querySelector("input[name='descripcion']");
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
    alert("Ocurrió un error inesperado al cargar datos del producto.");
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
        alert("Error al eliminar producto.");
      } else {
        alert("Producto eliminado exitosamente.");
        deletePopup.classList.add("hidden");

        // Refrescar la lista de productos
        const productos = await window.electronAPI.getAllProductos();
        console.log("Productos cargados después de eliminar:", productos);
        if (productos.error) {
          console.error('Error al cargar productos después de eliminar:', productos.error);
            alert('Error al cargar productos después de eliminar. Revisa la consola para más detalles.');
        }
        renderProductos(productos.data);
      }
    } catch (error) {
      console.error("Error inesperado al eliminar producto:", error);
      alert("Ocurrió un error inesperado al eliminar producto.");
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
      alert(errorMessage);
      return;
    }

    console.log("Enviando datos al backend:", productoSchema);
    const result = await window.electronAPI.createProducto(productoSchema);
    console.log("Respuesta del backend:", result);

    if (result.error) {
      console.error("Error al crear producto en Supabase", { error: result.error, productoSchema });
      alert("Error al crear producto: " + result.error);
    } else {
      console.log("Producto creado exitosamente:", result.data);
      alert("Producto creado exitosamente.");
      document.getElementById("add-modal").classList.add("hidden");

      // Refresca la lista de productos
      console.log("Cargando lista de productos actualizada");
      const productos = await window.electronAPI.getAllProductos();
      console.log("Productos cargados:", productos);
      renderProductos(productos.data);
    }
  } catch (error) {
    console.error("Error inesperado en handleCreateProducto:", error);
    alert("Ocurrió un error. Revisa la consola para más detalles.");
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
      alert(errorMessage);
      return;
    }

    console.log("Datos enviados al backend para actualización:", productoSchema);
    const result = await window.electronAPI.updateProducto(productoSchema.id, productoSchema);

    if (result.error) {
      console.error("Error al actualizar producto en Supabase", { error: result.error, productoSchema });
      alert("Error al actualizar producto: " + result.error);
    } else {
      console.log("Producto actualizado exitosamente:", result.data);
      alert("Producto actualizado exitosamente.");
      document.getElementById("edit-modal").classList.add("hidden");

      // Refresca la lista de productos
      const productos = await window.electronAPI.getAllProductos();
      renderProductos(productos.data);
    }
  } catch (error) {
    console.error("Error inesperado en handleUpdateProducto:", error);
    alert("Ocurrió un error inesperado. Revisa la consola para más detalles.");
  }
};

// Cargar productos automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const productos = await window.electronAPI.getAllProductos();
    if (productos.error) {
      console.error('Error al cargar productos:', productos.error);
      alert('Error al cargar productos. Revisa la consola para más detalles.');
    } else {
      renderProductos(productos.data);
    }
  } catch (error) {
    console.error('Error inesperado al cargar productos:', error);
    alert('Ocurrió un error inesperado al cargar productos.');
  }
});