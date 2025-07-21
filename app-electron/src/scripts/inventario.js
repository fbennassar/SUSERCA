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

    const cotizacionSelect = document.getElementById('cotizacion-select');
    cotizacionSelect.innerHTML = ''; // Limpiar opciones previas
    cotizacionSelect.innerHTML = '<option class="text-black font-bold" value="" disabled selected>Seleccione un producto</option>';
    productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.nombre} [${producto.id}]`;
        option.dataset.descripcion = producto.descripcion || 'Sin descripción';
        option.dataset.precio = producto.precio || '0.00';
        cotizacionSelect.appendChild(option);
    });

    // Asegúrate de que el contenedor tenga las clases necesarias para la cuadrícula
    container.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-10', 'py-6', 'max-w-6xl', 'w-full', 'mx-auto');
}
let activarBCVCheckbox;
let tasaBCVInput;
function agregarProductoCotizacion() {
  const agregarButton = document.getElementById('agregar-producto-cotizacion');
  const tablaCotizacion = document.getElementById('tabla-cotizacion');
  tablaCotizacion.innerHTML = ''; // Limpiar tabla antes de agregar nuevos productos
  agregarButton.onclick = () => {
    const cotizacionSelect = document.getElementById('cotizacion-select');
    const selectedOption = cotizacionSelect.options[cotizacionSelect.selectedIndex];
    if (selectedOption.value) {
      const productoDescripcion = selectedOption.dataset.descripcion || 'Sin descripción';
      const productoPrecioRef = parseFloat(selectedOption.dataset.precio) || 0.00;
      
      // const posicion = tablaCotizacion.rows.length + 1; // Obtener la posición actual de la fila
      
      // Aquí puedes agregar la lógica para agregar el producto a la cotización
      const newRow = document.createElement('tr');
      newRow.className = 'divide-x divide-gray-200';
      newRow.innerHTML = `
        <td class="text-left px-2 py-2">
        <button class="hover:cursor-pointer delete-row-btn"> 
        <img class="size-7" src="../assets/icons/general/delete.png" alt="delete" />
        <button/></td>
        <td class="text-left px-2 py-2">${productoDescripcion}</td>
        <td class="text-left px-2 py-2"><input type="number" class="cantidad-input" value="1" min="1" /></td>
        <td class="text-left px-2 py-2">
          <input type="number" class="precio-unitario-input" value="${productoPrecioRef.toFixed(2)}" min="1" step"0.01" />
        </td>
        <td class="text-left px-2 py-2">
          ${productoPrecioRef.toFixed(2)}
        </td>
        <td class="text-left px-2 py-2 total">
          ${(parseFloat(productoPrecioRef) * 1).toFixed(2)} <!-- Valor total calculado -->
        </td>
      `;
      tablaCotizacion.appendChild(newRow);
      totalResumen();
        
      //
      //ATENCION
      //
      //Primero, hacer el loading en cada pantalla, despues, quitar el POS
      // en la tabla de cotizacion y colocarlo al exportar el pdf y con ello
      // dejar mas simple el eliminar las rows
      //
      // Agregar event listeners para actualizar el total
      const cantidadInput = newRow.querySelector('.cantidad-input');
      const precioUnitarioInput = newRow.querySelector('.precio-unitario-input');
      const deleteRowBtn = newRow.querySelector('.delete-row-btn');
      cantidadInput.addEventListener('input', actualizarTotal);
      precioUnitarioInput.addEventListener('input', actualizarTotal);
      deleteRowBtn.addEventListener('click', () => eliminarFila(newRow));

      function actualizarTotal() {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const precioUnitario = parseFloat(precioUnitarioInput.value) || 0;
        const total = cantidad * precioUnitario;
        newRow.querySelector('.total').textContent = total.toFixed(2);
        totalResumen();
      }

      function eliminarFila() {
        tablaCotizacion.removeChild(newRow);
        totalResumen();
      }




    } else {
      console.error('No se ha seleccionado un producto válido.');
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  activarBCVCheckbox = document.getElementById('activar-bcv');
  tasaBCVInput = document.getElementById('tasa-bcv');

  // Initialize the state of the BCV rate input
  tasaBCVInput.disabled = !activarBCVCheckbox.checked;
  tasaBCVInput.style.opacity = activarBCVCheckbox.checked ? '1' : '0.7';

  activarBCVCheckbox.addEventListener('change', () => {
    tasaBCVInput.disabled = !activarBCVCheckbox.checked;
    tasaBCVInput.style.opacity = activarBCVCheckbox.checked ? '1' : '0.7';
    totalResumen(); // Call totalResumen to update the values
  });

  tasaBCVInput.addEventListener('input', () => {
    totalResumen(); // Call totalResumen to update the values
  });

  agregarProductoCotizacion(); // Call agregarProductoCotizacion here
});

function totalResumen() {
  precioTotalRows = document.querySelectorAll('.total');
  let precioTotal = 0;
  precioTotalRows.forEach(row => {
    precioTotal += parseFloat(row.textContent) || 0;
  });
  const baseImponible = document.getElementById('base-imponible');
  const ivaElement = document.getElementById('iva');
  const montoTotalElement = document.getElementById('monto-total');

  let iva = (precioTotal * 0.16);
  let montoTotal = precioTotal + iva;

  const bcvRate = activarBCVCheckbox.checked ? parseFloat(tasaBCVInput.value) : null;

  if (bcvRate) {
    // Apply BCV rate if available
    baseImponible.innerHTML = `${(precioTotal * bcvRate).toFixed(2)} Bs`;
    ivaElement.innerHTML = `${(iva * bcvRate).toFixed(2)} Bs`;
    montoTotalElement.innerHTML = `${(montoTotal * bcvRate).toFixed(2)} Bs`;
  } else {
    // Display in USD if BCV rate is not available
    baseImponible.innerHTML = `${(precioTotal).toFixed(2)} USD`;
    ivaElement.innerHTML = `${(iva).toFixed(2)} USD`;
    montoTotalElement.innerHTML = `${(montoTotal).toFixed(2)} USD`;
  }
}

async function generarCotizacionDesdeTabla() {
  const table = document.getElementById("tabla-cotizacion");
  const rows = table.querySelectorAll("tbody tr");
  const productos = [];

  rows.forEach((row, index) => {
    const cells = row.querySelectorAll("td");
    const rowData = {
      pos: index + 1, // Posición basada en el índice del array
      descripcion: cells[1].textContent.trim(),
      cantidad: cells[2].querySelector('.cantidad-input').value,
      precioUnitario: cells[3].querySelector('.precio-unitario-input').value,
      montoTotal: cells[5].textContent.trim(),
    };
    productos.push(rowData);
  });

  // --- NUEVO: Recolectar todos los datos del formulario ---
  const cotizacionCompleta = {
    cliente: {
      razonSocial: document.querySelector('input[name="report-razon"]').value,
      rif: document.querySelector('input[name="report-rif"]').value,
      direccion: document.getElementById('report-description').value,
    },
    fecha: document.querySelector('input[name="report-date"]').value,
    tasaBCV: document.getElementById('tasa-bcv').value,
    resumen: {
      baseImponible: document.getElementById('base-imponible').textContent,
      iva: document.getElementById('iva').textContent,
      montoTotal: document.getElementById('monto-total').textContent,
    },
    productos: productos, // El array de productos que ya tenías
  };

  console.log("Datos completos de la cotización:", cotizacionCompleta); // Log para depuración

  // Envía el objeto completo al proceso principal
  try {
    await window.electronAPI.generarCotizacion(cotizacionCompleta);
    mostrarMensaje("Cotización generada exitosamente.", "success");
  } catch (error) {
    console.error("Error al generar la cotización:", error);
    mostrarMensaje(`Error al generar la cotización: ${error.message}`, "error");
  }
}

document.getElementById("btn-cotizacion").addEventListener("click", () => {
  generarCotizacionDesdeTabla();
});

function buildProductoSchema(modalId) {
  const modal = document.getElementById(modalId); // Obtén el contenedor del modal dinámicamente
  const categoriaInput = modal.querySelector("select[name='categoria']").value;
  


  const productoSchema = {
    nombre: modal.querySelector("input[name='nombre']").value,
    id: modal.querySelector("input[name='id']").value,
    descripcion: modal.querySelector("textarea[name='descripcion']").value,
    precio: modal.querySelector("input[name='precio']").value,
    cantidad: modal.querySelector("input[name='cantidad']").value,
    id_categoria: categoriaInput ? parseInt(categoriaInput) : null, // Asegúrate de que sea un número
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

  // Cargar datos del producto en el modal
  window.electronAPI.getProductoByID(productId).then(async (result) => {
    if (result.error) {
      console.error("Error al obtener producto para editar:", result.error);
      mostrarMensaje("Error al cargar datos del producto.", "error");
    } else {
      const producto = result.data;
      const categoriaSelect = editModal.querySelector("select[name='categoria']");

      // Poblar el select de categorías del modal de edición
      categoriaSelect.innerHTML = ''; // Limpiar opciones previas
      const { categoria: categorias, error } = await window.electronAPI.getCategorias();
      if (error) {
        mostrarMensaje('Error al cargar categorías para editar', 'error');
      } else {
        categorias.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.nombre;
          categoriaSelect.appendChild(option);
        });
      }

      // Asignar valores del producto a los campos del modal
      editModal.querySelector("input[name='nombre']").value = producto.nombre || "";
      editModal.querySelector("input[name='id']").value = producto.id || "";
      editModal.querySelector("textarea[name='descripcion']").value = producto.descripcion || "";
      editModal.querySelector("input[name='precio']").value = producto.precio || "";
      editModal.querySelector("input[name='cantidad']").value = producto.cantidad || "";
      // Seleccionar la categoría correcta en el <select>
      if (categoriaSelect) categoriaSelect.value = producto.id_categoria || "";
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



// ...existing code...
// Cargar productos automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  loadAllProductos(); // Carga inicial de todos los productos

  // --- LÓGICA DE FILTRADO POR CATEGORÍA ---
  const categorySelect = document.getElementById('category-filter-select');
  const addProductCategoryInput = document.getElementById('add-product-categoria');
  const categoryCrudSelect = document.getElementById('category-select');

  // Poblar el select con las categorías
  try {
    const { categoria: categorias, error } = await window.electronAPI.getCategorias();
    if (error) {
      mostrarMensaje('Error al cargar categorías', 'error');
    } else {
      categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nombre;
        categorySelect.appendChild(option);
        addProductCategoryInput.appendChild(option.cloneNode(true)); // Clonar la opción para el input de agregar producto
        categoryCrudSelect.appendChild(option.cloneNode(true)); // Clonar la opción para el CRUD de categorías
      });

          const categoryModal = document.getElementById('category-modal');
  const categoryForm = document.getElementById('category-form');
  const categoryIdInput = document.getElementById('category-id-input');
  const categoryNameInput = document.getElementById('category-name-input');

  // --- MANEJO DEL MODAL ---
  window.openCategoryModal = () => {
    categoryModal.classList.remove('hidden');
    resetCategoryForm();
  };

    window.closeCategoryModal = () => {
    categoryModal.classList.add('hidden');
  };

  // --- LÓGICA DEL FORMULARIO ---
  const resetCategoryForm = () => {
    categoryForm.reset();
    categoryIdInput.value = '';
    categoryNameInput.placeholder = 'Escriba aquí para crear';
    categoryCrudSelect.value = ''; // Deseleccionar el select
  };

  // --- LÓGICA DE EDICIÓN ---
  // Cuando se selecciona una categoría, se prepara el formulario para editarla
  categoryCrudSelect.addEventListener('change', () => {
    const selectedId = categoryCrudSelect.value;

    // Si el usuario deselecciona (elige la opción por defecto)
    if (!selectedId) {
      resetCategoryForm();
      return;
    }

    const selectedName = categoryCrudSelect.options[categoryCrudSelect.selectedIndex].text;

    // Llenar el formulario con los datos de la categoría seleccionada
    categoryIdInput.value = selectedId;
    categoryNameInput.value = selectedName;
    categoryNameInput.placeholder = 'Edite el nombre y guarde';
  });

   // --- LÓGICA DE GUARDADO (UNIFICADA Y CORREGIDA) ---
  // Este es el ÚNICO listener para el submit del formulario.
  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = categoryIdInput.value;
    const nombre = categoryNameInput.value.trim();

    if (!nombre) {
      Swal.fire('Error', 'El nombre no puede estar vacío.', 'error');
      return;
    }

    let result;
    // Si hay un ID en el input oculto, estamos editando.
    if (id) {
      result = await window.electronAPI.editCategoria({ id, nombre });
    } else {
      // Si no hay ID, estamos creando.
      result = await window.electronAPI.createCategoria({ nombre });
    }

    if (result.error) {
      Swal.fire('Error', `No se pudo guardar la categoría: ${result.error}`, 'error');
    } else {
      Swal.fire('¡Éxito!', 'Categoría guardada correctamente.', 'success');
      resetCategoryForm();
      try {
        const { categoria: categorias, error } = await window.electronAPI.getCategorias();
        if (error) {
          mostrarMensaje('Error al recargar categorías', 'error');
        } else {
          // Limpiar los selects y volver a poblarlos
          categorySelect.innerHTML = '';
          addProductCategoryInput.innerHTML = '';
          categoryCrudSelect.innerHTML = '';
          categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nombre;
            categorySelect.appendChild(option);
            addProductCategoryInput.appendChild(option.cloneNode(true));
            categoryCrudSelect.appendChild(option.cloneNode(true));
          });
        }
      } catch (error) {
        mostrarMensaje('Error inesperado al recargar categorías.', 'error');
      }
    }
  });



  // --- ELIMINAR CATEGORÍA ---
  window.handleDeleteCategory = () => {
    const selectedId = categoryCrudSelect.value;
    if (!selectedId) {
      Swal.fire('Atención', 'Por favor, seleccione una categoría para eliminar.', 'info');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, ¡eliminar!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const deleteResult = await window.electronAPI.deleteCategoria(selectedId);
        if (deleteResult.error) {
          Swal.fire('Error', `No se pudo eliminar: ${deleteResult.error}`, 'error');
        } else {
          Swal.fire('¡Eliminada!', 'La categoría ha sido eliminada.', 'success');
          try {
            const { categoria: categorias, error } = await window.electronAPI.getCategorias();
            if (error) {
              mostrarMensaje('Error al recargar categorías', 'error');
            } else {
              // Limpiar los selects y volver a poblarlos
              categorySelect.innerHTML = '';
              addProductCategoryInput.innerHTML = '';
              categoryCrudSelect.innerHTML = '';
              categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nombre;
                categorySelect.appendChild(option);
                addProductCategoryInput.appendChild(option.cloneNode(true));
                categoryCrudSelect.appendChild(option.cloneNode(true));
              });
            }
          } catch (error) {
            mostrarMensaje('Error inesperado al recargar categorías.', 'error');
          }
        }
      }
    });
  };
    }
  } catch (e) {
    mostrarMensaje('Error inesperado al cargar categorías.', 'error');
  }

  // Añadir event listener para el cambio de categoría
  categorySelect.addEventListener('change', async (event) => {
    const categoryId = event.target.value;
    if (categoryId) {
      // Filtrar por la categoría seleccionada
      try {
        const result = await window.electronAPI.getProductosByCategoria(categoryId);
        if (result.error) {
          mostrarMensaje(`Error al filtrar: ${result.error}`, 'error');
        } else {
          renderProductos(result.data);
        }
      } catch (e) {
        mostrarMensaje('Error inesperado al filtrar productos.', 'error');
      }
    } else {
      // Si se selecciona "Todas las categorías", cargar todos los productos
      loadAllProductos();
    }
  })});


