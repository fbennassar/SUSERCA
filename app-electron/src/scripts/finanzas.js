document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [ordenesVentaResponse, ordenesCompraResponse] = await Promise.all([
      window.electronAPI.getAllOrdenesVenta(),
      window.electronAPI.getAllOrdenesCompra()
    ]);

    console.log('Ordenes Compra Response:', ordenesCompraResponse); // Log para inspeccionar estructura
    console.log('Ordenes Venta Response:', ordenesVentaResponse); // Log para inspeccionar estructura

    if (ordenesVentaResponse.error || ordenesCompraResponse.error) {
      console.error('Error al cargar órdenes:', {
        ventaError: ordenesVentaResponse.error,
        compraError: ordenesCompraResponse.error
      });
      alert('Error al cargar órdenes. Revisa la consola para más detalles.');
    } else {
      const ordenesVenta = ordenesVentaResponse.data.map((orden) => ({ ...orden, tipo: 'Venta' }));
      const ordenesCompra = ordenesCompraResponse.data.map((orden) => ({ ...orden, tipo: 'Compra' }));

      const todasOrdenes = [...ordenesVenta, ...ordenesCompra];
      renderOrdenes(todasOrdenes);
    }
  } catch (error) {
    console.error('Error inesperado al cargar órdenes:', error);
    alert('Ocurrió un error inesperado al cargar órdenes.');
  }
});

function renderOrdenes(ordenes) {
  const container = document.querySelector('.ordenes-grid tbody');
  if (!container) {
    console.error('El contenedor .ordenes-grid tbody no existe en el DOM.');
    return;
  }
  container.innerHTML = ''; // Limpia el contenedor antes de renderizar
  ordenes.forEach((orden) => {
    const row = document.createElement('tr');
    const entidad = orden.tipo === 'Venta' ? orden.cliente : orden.proveedor;
    row.className = 'divide-x divide-gray-200';
    row.innerHTML = `
      <td class="text-left px-2 py-2">${orden.id}</td>
      <td class="text-left px-2 py-2">${orden.tipo}</td>
      <td class="text-left px-2 py-2">${entidad?.id || 'N/A'}</td>
      <td class="text-left px-2 py-2">${entidad?.nombre || 'N/A'}</td>
      <td class="text-left px-2 py-2">${orden.monto || 'N/A'}</td>
      <td class="text-left px-2 py-2">${orden.monto_pagado || 'N/A'}</td>
      <td class="text-left px-2 py-2">${orden.monto_restante || 'N/A'}</td>
      <td class="text-left px-2 py-2">${new Date(orden.fecha_ini).toLocaleDateString() || 'N/A'}</td>
      <td class="text-left px-2 py-2">${orden.estatus?.nombre || 'N/A'}</td>
      <td class="text-left px-2 py-2">
        <div class="flex gap-2 items-center justify-center">
          <button onclick="openEditModal('${orden.id}')" class="hover:cursor-pointer" title="Editar">
            <img src="../assets/icons/general/edit.png" alt="edit" class="w-6 h-6" />
          </button>
          <button onclick="openDeletePopup('${orden.id}', '${orden.tipo}')" class="hover:cursor-pointer">
            <img src="../assets/icons/general/delete.png" alt="delete" class="w-6 h-6" />
          </button>
          <button onclick="openPagosPopup('${orden.id}', '${orden.tipo}')" class="hover:cursor-pointer">
            <img src="../assets/icons/finanzas/pagos.png" alt="view" class="w-8 h-8" />
          </button>
        </div>
      </td>
    `;
    container.appendChild(row);
  });
}

window.handleCreateOrdenVenta = async function handleCreateOrdenVenta() {
  try {
    const ordenVentaData = {
      rif: document.querySelector("input[name='rif']").value,
      nombre: document.querySelector("input[name='razon_social']").value,
      fecha_ini: document.querySelector("input[name='fecha_ini']").value,
      monto: calculateMonto(),
      estatus: 1, // Example status
    };

    console.log('Orden Venta Data:', ordenVentaData); // Log para inspeccionar datos

    const productos = getSelectedProductos();

    const response = await window.electronAPI.createOrdenVenta(ordenVentaData, productos);

    if (response.error) {
      console.error('Error al crear orden de venta:', response.error);
      alert('Error al crear orden de venta.');
    } else {
      alert('Orden de venta creada exitosamente.');
      document.getElementsByName('rif')[0].value = '';
      document.getElementsByName('razon_social')[0].value = '';
      document.getElementsByName('fecha_ini')[0].value = '';
      document.getElementsByName('cantidad')[0].value = '';
      const productosTable = document.getElementById('productos-tbody');
      if (productosTable) {
        productosTable.innerHTML = ''; // Limpiar la tabla de productos
      }
      loadOrdenes();
    }
  } catch (error) {
    console.error('Error inesperado al crear orden de venta:', error);
    alert('Ocurrió un error inesperado al crear la orden de venta.');
  }
};

window.handleCreateOrdenCompra = async function handleCreateOrdenCompra() {
  try {
    const ordenCompraData = {
      rif: document.querySelector("input[name='rif']").value,
      nombre: document.querySelector("input[name='razon_social']").value, // Updated field name
      fecha_ini: document.querySelector("input[name='fecha_ini']").value,
      monto: calculateMonto(),
      estatus: 1, // Example status
    };

    const productos = getSelectedProductos();

    const response = await window.electronAPI.createOrdenCompra(ordenCompraData, productos);

    if (response.error) {
      console.error('Error al crear orden de compra:', response.error);
      alert('Error al crear orden de compra.');
    } else {
      alert('Orden de compra creada exitosamente.');
      // limpiar campos del modal
      document.getElementsByName('rif')[0].value = '';
      document.getElementsByName('razon_social')[0].value = '';
      document.getElementsByName('fecha_ini')[0].value = '';
      document.getElementsByName('cantidad')[0].value = '';
      const productosTable = document.getElementById('productos-tbody');
      if (productosTable) {
        productosTable.innerHTML = ''; // Limpiar la tabla de productos
      }
      // Cerrar el modal
      loadOrdenes();
    }
  } catch (error) {
    console.error('Error inesperado al crear orden de compra:', error);
    alert('Ocurrió un error inesperado al crear la orden de compra.');
  }
};

window.handleEditOrden = async function handleEditOrden(id, tipo) {
  try {
    const modalId = tipo === 'Venta' ? 'edit-venta-modal' : 'edit-compra-modal';
    const ordenData = buildOrdenSchema(modalId);
    const productos = getSelectedProductos(modalId);

    const result = tipo === 'Venta'
      ? await window.electronAPI.updateOrdenVenta(id, ordenData, productos)
      : await window.electronAPI.updateOrdenCompra(id, ordenData, productos);

    if (result.error) {
      console.error(`Error al editar orden de ${tipo.toLowerCase()}:`, result.error);
      alert(`Error al editar orden de ${tipo.toLowerCase()}.`);
    } else {
      alert(`Orden de ${tipo.toLowerCase()} editada exitosamente.`);
      document.getElementById(modalId).classList.add('hidden');
      const ordenes = tipo === 'Venta'
        ? await window.electronAPI.getAllOrdenesVenta()
        : await window.electronAPI.getAllOrdenesCompra();
      renderOrdenes(ordenes.data.map((orden) => ({ ...orden, tipo })));
    }
  } catch (error) {
    console.error(`Error inesperado al editar orden de ${tipo.toLowerCase()}:`, error);
    alert(`Ocurrió un error inesperado al editar orden de ${tipo.toLowerCase()}.`);
  }
};

window.handleDeleteOrden = async function handleDeleteOrden(id, tipo) {
  try {
    const result = tipo === 'Venta'
      ? await window.electronAPI.deleteOrdenVenta(id)
      : await window.electronAPI.deleteOrdenCompra(id);

    if (result.error) {
      console.error(`Error al eliminar orden de ${tipo.toLowerCase()}:`, result.error);
      alert(`Error al eliminar orden de ${tipo.toLowerCase()}.`);
    } else {
      alert(`Orden de ${tipo.toLowerCase()} eliminada exitosamente.`);
      const ordenes = tipo === 'Venta'
        ? await window.electronAPI.getAllOrdenesVenta()
        : await window.electronAPI.getAllOrdenesCompra();
      renderOrdenes(ordenes.data.map((orden) => ({ ...orden, tipo })));
    }
  } catch (error) {
    console.error(`Error inesperado al eliminar orden de ${tipo.toLowerCase()}:`, error);
    alert(`Ocurrió un error inesperado al eliminar orden de ${tipo.toLowerCase()}.`);
  }
};

window.handlePayment = async function handlePayment(id, tipo, monto) {
  try {
    const result = tipo === 'Venta'
      ? await window.electronAPI.payOrdenVenta(id, monto)
      : await window.electronAPI.payOrdenCompra(id, monto);

    if (result.error) {
      console.error(`Error al realizar pago de orden de ${tipo.toLowerCase()}:`, result.error);
      alert(`Error al realizar pago de orden de ${tipo.toLowerCase()}.`);
    } else {
      alert(`Pago realizado exitosamente para orden de ${tipo.toLowerCase()}.`);
      const ordenes = tipo === 'Venta'
        ? await window.electronAPI.getAllOrdenesVenta()
        : await window.electronAPI.getAllOrdenesCompra();
      renderOrdenes(ordenes.data.map((orden) => ({ ...orden, tipo })));
    }
  } catch (error) {
    console.error(`Error inesperado al realizar pago de orden de ${tipo.toLowerCase()}:`, error);
    alert(`Ocurrió un error inesperado al realizar pago de orden de ${tipo.toLowerCase()}.`);
  }
};

window.handleSearchOrdenes = async function handleSearchOrdenes(criteria) {
  try {
    const [ordenesVentaResponse, ordenesCompraResponse] = await Promise.all([
      window.electronAPI.searchOrdenesVenta(criteria),
      window.electronAPI.searchOrdenesCompra(criteria)
    ]);

    if (ordenesVentaResponse.error || ordenesCompraResponse.error) {
      console.error('Error al buscar órdenes:', {
        ventaError: ordenesVentaResponse.error,
        compraError: ordenesCompraResponse.error
      });
      alert('Error al buscar órdenes. Revisa la consola para más detalles.');
    } else {
      const ordenesVenta = ordenesVentaResponse.data.map((orden) => ({ ...orden, tipo: 'Venta' }));
      const ordenesCompra = ordenesCompraResponse.data.map((orden) => ({ ...orden, tipo: 'Compra' }));

      const todasOrdenes = [...ordenesVenta, ...ordenesCompra];
      renderOrdenes(todasOrdenes);
    }
  } catch (error) {
    console.error('Error inesperado al buscar órdenes:', error);
    alert('Ocurrió un error inesperado al buscar órdenes.');
  }
};

function getSelectedProductos() {
  const productos = [];
  const productosTable = document.getElementById('productos-tbody');

  if (!productosTable) {
    console.error("Table with ID 'productos-tbody' not found.");
    return productos; // Return an empty array if the table is not found
  }

  const productoRows = productosTable.querySelectorAll('tr');

  productoRows.forEach((row) => {
    const id = row.dataset.productoId; // Assuming productoId is stored in data attributes
    const cantidadCell = row.cells[1]; // Assuming cantidad is in the second column
    const cantidad = cantidadCell ? parseFloat(cantidadCell.textContent) : null;

    if (id && cantidad) {
      productos.push({ id, cantidad });
    }
  });

  return productos;
}

function buildOrdenCompraSchema(modalId) {
  const modal = document.getElementById(modalId);
  return {
    rif: modal.querySelector("input[name='rif']").value,
    razon_social: modal.querySelector("input[name='razon_social']").value,
    fecha_ini: modal.querySelector("input[name='fecha_ini']").value,
    productos: getSelectedProductos(modalId),
  };
}

function buildOrdenVentaSchema(modalId) {
  const modal = document.getElementById(modalId);
  return {
    rif: modal.querySelector("input[name='rif']").value,
    razon_social: modal.querySelector("input[name='razon_social']").value,
    fecha_ini: modal.querySelector("input[name='fecha_ini']").value,
    productos: getSelectedProductos(modalId),
  };
}

async function loadProductos() {
  try {
    const response = await window.electronAPI.getAllProductos();
    if (response.error) {
      console.error('Error al cargar productos:', response.error);
      return;
    }

    const productosSelect = document.getElementById('productos');
    productosSelect.innerHTML = '<option class="text-black font-bold" value="" disabled selected>Seleccione un producto</option>';

    response.data.forEach((producto) => {
      const option = document.createElement('option');
      option.value = producto.id; // Usa el ID del producto
      option.textContent = producto.nombre; // Usa el nombre del producto
      option.dataset.precio = producto.precio; // Agrega el precio como atributo de datos
      productosSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error inesperado al cargar productos:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadProductos);

async function addProductoToOrden() {
  const productosTable = document.getElementById('productos-tbody');

  if (!productosTable) {
    console.error("Table with ID 'productos-tbody' not found.");
    return;
  }

  const productoSelect = document.querySelector("select[name='productos']");
  const cantidadInput = document.querySelector("input[name='cantidad']");

  const productoId = productoSelect.value;
  const productoNombre = productoSelect.options[productoSelect.selectedIndex].text;
  const productoPrecioUnitario = parseFloat(productoSelect.options[productoSelect.selectedIndex].dataset.precio);
  const cantidad = parseFloat(cantidadInput.value);

  if (!productoId || isNaN(cantidad) || cantidad <= 0 || isNaN(productoPrecioUnitario)) {
    alert('Por favor seleccione un producto válido y una cantidad válida.');
    return;
  }

  const subTotal = productoPrecioUnitario * cantidad;

  // Check for duplicate entries
  const existingRow = Array.from(productosTable.rows).find(
    (row) => row.dataset.productoId === productoId
  );

  if (existingRow) {
    alert('Este producto ya ha sido agregado.');
    return;
  }

  // Create a new row for the product
  const row = document.createElement('tr');
  row.dataset.productoId = productoId;
  row.innerHTML = `
    <td>${productoNombre}</td>
    <td>${cantidad}</td>
    <td>${productoPrecioUnitario.toFixed(2)}</td>
    <td>${subTotal.toFixed(2)}</td>
    <td>
      <button class="remove-producto-btn" onclick="removeProductoFromOrden('${productoId}')">
        <img src="../assets/icons/general/delete.png" alt="delete" class="w-6 h-6" />
      </button>
    </td>
  `;

  productosTable.appendChild(row);

  // Reset inputs
  productoSelect.value = '';
  cantidadInput.value = '';
}

function removeProductoFromOrden(productoId) {
  const productosTable = document.getElementById('productos-tbody');

  if (!productosTable) {
    console.error("Table with ID 'productos-tbody' not found.");
    return;
  }

  const rowToRemove = Array.from(productosTable.rows).find(
    (row) => row.dataset.productoId === productoId
  );

  if (rowToRemove) {
    productosTable.removeChild(rowToRemove);
  }
}

async function loadOrdenes() {
  try {
    const [ordenesVentaResponse, ordenesCompraResponse] = await Promise.all([
      window.electronAPI.getAllOrdenesVenta(),
      window.electronAPI.getAllOrdenesCompra()
    ]);

    if (ordenesVentaResponse.error || ordenesCompraResponse.error) {
      console.error('Error al cargar órdenes:', {
        ventaError: ordenesVentaResponse.error,
        compraError: ordenesCompraResponse.error
      });
      alert('Error al cargar órdenes. Revisa la consola para más detalles.');
    } else {
      const ordenesVenta = ordenesVentaResponse.data.map((orden) => ({ ...orden, tipo: 'Venta' }));
      const ordenesCompra = ordenesCompraResponse.data.map((orden) => ({ ...orden, tipo: 'Compra' }));

      const todasOrdenes = [...ordenesVenta, ...ordenesCompra];
      renderOrdenes(todasOrdenes);
    }
  } catch (error) {
    console.error('Error inesperado al cargar órdenes:', error);
    alert('Ocurrió un error inesperado al cargar órdenes.');
  }
}

document.getElementById('btn-guardar_orden').addEventListener('click', async () => {
  const tipoOrden = document.getElementById('TipoOrden').value;
  if (tipoOrden === 'Venta') {
    await handleCreateOrdenVenta();
  } else if (tipoOrden === 'Compra') {
    await handleCreateOrdenCompra();
  } else {
    alert('Por favor, seleccione un tipo de orden válido.');
  }
});

function calculateMonto() {
  const productosTable = document.getElementById('productos-tbody');

  if (!productosTable) {
    console.error("Table with ID 'productos-tbody' not found.");
    return 0;
  }

  let total = 0;

  Array.from(productosTable.rows).forEach((row) => {
    const subTotalCell = row.cells[3]; // Assuming subtotal is in the 4th column
    const subTotal = parseFloat(subTotalCell.textContent);

    if (!isNaN(subTotal)) {
      total += subTotal;
    }
  });

  return total;
}

function openDeletePopup(orderId, orderType) {
  const deletePopup = document.getElementById('delete-popup');
  const deleteLabel = document.getElementById('delete-popup-label');
  const deleteButton = document.getElementById('delete-confirm-button');

  // Update the label with the order ID
  deleteLabel.textContent = `¿Estás seguro de que deseas eliminar la orden con ID ${orderId}?`;

  // Show the popup
  deletePopup.classList.remove('hidden');

  // Attach the delete logic to the button
  deleteButton.onclick = async () => {
    try {
      if (orderType === 'Compra') {
        await window.electronAPI.deleteOrdenCompra(orderId);
      } else if (orderType === 'Venta') {
        await window.electronAPI.deleteOrdenVenta(orderId);
      }

      // Refresh the orders table
      loadOrdenes();

      // Hide the popup
      deletePopup.classList.add('hidden');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };
}

function openPagosPopup(orderId, orderType) {
  console.log("Opening payment popup for order ID:", orderId, "and order type:", orderType); // Log for debugging

  if (!orderType) {
    console.error("Order type is undefined. Ensure the correct type is passed.");
    return;
  }

  const pagosPopup = document.getElementById('pagos-popup');
  if (!pagosPopup) {
    console.error("Popup with ID 'pagos-popup' not found.");
    return;
  }

  const popupTitle = pagosPopup.querySelector('h1[for="pagos-popup-title"]');
  const razonSocialLabel = pagosPopup.querySelector('label[for="razon-social"]');
  const montoTotalLabel = pagosPopup.querySelector('label[for="monto-total"]');
  const montoPagadoLabel = pagosPopup.querySelector('label[for="monto-pagado"]');
  const montoRestanteLabel = pagosPopup.querySelector('label[for="monto-restante"]');

  if (!popupTitle || !razonSocialLabel || !montoTotalLabel || !montoPagadoLabel || !montoRestanteLabel) {
    console.error("One or more required elements are missing in the popup.");
    return;
  }

  getOrderById(orderId, orderType).then((orderArray) => {
    if (!orderArray || orderArray.length === 0) {
      console.error(`Order with ID ${orderId} not found.`);
      return;
    }

    const order = orderArray[0]; // Unpack the first element of the array

    console.log("Order details fetched:", order); // Log for inspecting fetched order details

    // Update popup title with order ID
    popupTitle.textContent = `Agregar pago a orden: ${orderId}`;

    // Handle empty cuentas_por_pagar or cuentas_por_cobrar
    const payments = orderType === 'Venta' ? order.cuentas_por_cobrar : order.cuentas_por_pagar;
    if (!payments || payments.length === 0) {
      console.warn("No payment records found for the order.");
    }

    // Update labels with order details
    razonSocialLabel.textContent = `Razón social: ${order.proveedor?.nombre || order.cliente?.nombre || 'N/A'}`;
    montoTotalLabel.textContent = `Monto total: ${order.monto || 'N/A'}`;
    montoPagadoLabel.textContent = `Monto pagado: ${payments.reduce((acc, pago) => acc + pago.monto, 0) || 'N/A'}`;
    montoRestanteLabel.textContent = `Monto restante: ${(order.monto - payments.reduce((acc, pago) => acc + pago.monto, 0)) || 'N/A'}`;

    console.log("Labels updated with order details."); // Log for confirming label updates

    // Show the popup
    pagosPopup.classList.remove('hidden');

    // Attach logic to the Registrar Pago button
    const registrarPagoButton = pagosPopup.querySelector('#btn-registrar-pago');
    registrarPagoButton.onclick = async () => {
      const paymentAmount = parseFloat(document.getElementById('pago-monto').value);
      const paymentDate = document.getElementById('pago-fecha').value;
      const paymentMethod = document.getElementById('pago-tipo').value;

      if (isNaN(paymentAmount) || paymentAmount <= 0 || !paymentDate || !paymentMethod) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
      }

      const paymentData = {
        monto: paymentAmount,
        fecha: paymentDate,
        metodo: paymentMethod,
      };

      await insertPayment(orderId, orderType, paymentData);
    };
  }).catch((error) => {
    console.error(`Error fetching order details for ID ${orderId}:`, error);
  });
}

async function getOrderById(orderId, orderType) {
  try {
    const response = orderType === 'Venta'
      ? await window.electronAPI.getOrdenVentaById(orderId)
      : await window.electronAPI.getOrdenCompraById(orderId);

    if (response.error) {
      console.error(`Error fetching order with ID ${orderId}:`, response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Unexpected error fetching order with ID ${orderId}:`, error);
    return null;
  }
}

function handlePaymentTypeChange() {
  const paymentTypeSelect = document.getElementById('pago-tipo');
  const paymentAmountInput = document.getElementById('pago-monto');
  const remainingAmountLabel = document.querySelector('label[for="monto-restante"]');

  paymentTypeSelect.addEventListener('change', () => {
    if (paymentTypeSelect.value === 'Pago completo') {
      const remainingAmount = parseFloat(remainingAmountLabel.textContent.split(': ')[1]);
      paymentAmountInput.value = remainingAmount;
    }
  });
}

async function insertPayment(orderId, orderType, paymentData) {
  try {
    const response = orderType === 'Venta'
      ? await window.electronAPI.insertIntoCuentasPorCobrar(orderId, paymentData)
      : await window.electronAPI.insertIntoCuentasPorPagar(orderId, paymentData);

    if (response.error) {
      console.error(`Error inserting payment for order ID ${orderId}:`, response.error);
      alert('Error al registrar el pago.');
    } else {
      alert('Pago registrado exitosamente.');
      loadOrdenes();
    }
  } catch (error) {
    console.error(`Unexpected error inserting payment for order ID ${orderId}:`, error);
    alert('Ocurrió un error inesperado al registrar el pago.');
  }
}

function unpackPaymentHistory(order) {
  const paymentHistoryBody = document.getElementById('historial-pagos-body');
  paymentHistoryBody.innerHTML = '';

  const payments = order.tipo === 'Venta' ? order.cuentas_por_cobrar : order.cuentas_por_pagar;

  payments.forEach((payment) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-4 py-2">${new Date(payment.fecha).toLocaleDateString()}</td>
      <td class="px-4 py-2">${payment.monto}</td>
      <td class="px-4 py-2">${payment.metodo}</td>
    `;
    paymentHistoryBody.appendChild(row);
  });
}
