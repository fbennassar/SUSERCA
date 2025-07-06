const supabase = require('./supabaseClient');

// Crear una nueva orden de compra
exports.createOrdenCompra = async (ordenCompraData, productos) => {
  try {
    // Check if proveedor exists
    const { data: proveedorExists, error: proveedorError } = await supabase.supabase
      .from('proveedor')
      .select('*')
      .eq('id', ordenCompraData.rif);

    if (proveedorError) throw proveedorError;

    let proveedorId;

    if (proveedorExists.length === 0) {
      // Insert proveedor if it doesn't exist
      const { data: newProveedor, error: newProveedorError } = await supabase.supabase
        .from('proveedor')
        .insert({
          id: ordenCompraData.rif,
          nombre: ordenCompraData.nombre, // Ensure this matches frontend
        })
        .select();

      if (newProveedorError) throw newProveedorError;

      proveedorId = newProveedor[0].id;
    } else {
      proveedorId = proveedorExists[0].id;
    }

    // Update ordenCompraData with proveedorId
    ordenCompraData.id_proveedor = proveedorId; // Ensure only valid columns are used

    // Filter ordenCompraData to include only necessary fields
    const filteredOrdenCompraData = {
      id_proveedor: ordenCompraData.id_proveedor,
      fecha_ini: new Date(ordenCompraData.fecha_ini).toISOString(),
      monto: ordenCompraData.monto,
      estatus: ordenCompraData.estatus,
    };

    const { data: ordenCompra, error: ordenCompraError } = await supabase.supabase
      .from('orden_compra')
      .insert(filteredOrdenCompraData)
      .select();

    if (ordenCompraError) throw ordenCompraError;

    const ordenCompraId = ordenCompra[0].id;

    const productosData = productos.map((producto) => ({
      id_producto: producto.id,
      id_orden_compra: ordenCompraId,
      cantidad: producto.cantidad,
    }));

    const { error: productosError } = await supabase.supabase
      .from('orden_compra_producto')
      .insert(productosData);

    if (productosError) throw productosError;

    return { data: ordenCompra, error: null };
  } catch (error) {
    console.error('Error al crear orden de compra:', error);
    return { data: null, error };
  }
};

// Obtener todas las órdenes de compra
async function calculatePagosOrdenCompra(ordenCompra) {
  const montoPagado = ordenCompra.cuentas_por_pagar.reduce((acc, pago) => acc + pago.monto, 0);
  const montoRestante = ordenCompra.monto - montoPagado;
  return {
    monto_pagado: montoPagado,
    monto_restante: montoRestante,
  };
}

exports.getAllOrdenesCompra = async () => {
  try {
    const { data, error } = await supabase.supabase
      .from('orden_compra')
      .select(`
        *,
        proveedor (id, nombre, email, telefono, direccion),
        estatus (nombre),
        orden_compra_producto (id_producto, cantidad, producto (nombre, precio, descripcion)),
        cuentas_por_pagar (monto)
      `)
      .eq('activo', true);

    if (error) throw error;

    const ordenesConPagos = await Promise.all(
      data.map(async (ordenCompra) => {
        const pagos = await calculatePagosOrdenCompra(ordenCompra);
        return { ...ordenCompra, ...pagos };
      })
    );

    return { data: ordenesConPagos, error: null };
  } catch (error) {
    console.error('Error al obtener órdenes de compra:', error);
    return { data: null, error };
  }
};

// Obtener una orden de compra por ID
exports.getOrdenCompraById = async (id) => {
  try {
    const { data, error } = await supabase.supabase
      .from('orden_compra')
      .select(`
        *,
        proveedor (nombre, email, telefono, direccion),
        estatus (nombre),
        orden_compra_producto (id_producto, cantidad, producto (nombre, precio, descripcion)),
        cuentas_por_pagar (monto, fecha_realizacion, metodo)
      `)
      .eq('id', id);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener orden de compra por ID:', error);
    return { data: null, error };
  }
};

// Actualizar una orden de compra
exports.updateOrdenCompra = async (id, ordenCompraData) => {
  try {
    const { data, error } = await supabase.supabase
      .from('orden_compra')
      .update(ordenCompraData)
      .eq('id', id);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar orden de compra:', error);
    return { data: null, error };
  }
};

// Eliminar una orden de compra
exports.deleteOrdenCompra = async (id) => {
  try {
    const { data, error } = await supabase.supabase
      .from('orden_compra')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error('Error al eliminar orden de compra:', error);
    return { data: null, error };
  }
};

// Obtener orden de compra con montos pagados y restantes
exports.getOrdenCompraWithPagos = async (idOrdenCompra) => {
  try {
    const { data: ordenCompra, error: ordenCompraError } = await supabase.supabase
      .from('orden_compra')
      .select('*, cuentas_por_pagar(monto)')
      .eq('id', idOrdenCompra);

    if (ordenCompraError) throw ordenCompraError;

    if (ordenCompra.length === 0) {
      return {
        monto_pagado: 0.0,
        monto_restante: ordenCompra[0].monto,
      };
    }

    const montoPagado = ordenCompra[0].cuentas_por_pagar.reduce((acc, pago) => acc + pago.monto, 0);
    const montoRestante = ordenCompra[0].monto - montoPagado;

    return {
      monto_pagado: montoPagado,
      monto_restante: montoRestante,
    };
  } catch (error) {
    console.error('Error al obtener orden de compra con pagos:', error);
    throw error;
  }
};

exports.insertIntoCuentasPorPagar = async (idOrdenCompra, paymentData) => {
  try {
    const { data, error } = await supabase.supabase
      .from('cuentas_por_pagar')
      .insert({
        id_orden_compra: idOrdenCompra,
        monto: paymentData.monto,
        fecha_realizacion: new Date(paymentData.fecha).toISOString(),
        metodo: paymentData.metodo,
      });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al insertar en cuentas por pagar:', error);
    return { data: null, error };
  }
};

// Add search logic for ordenCompra
exports.searchOrdenesCompra = async (criteria) => {
  try {
    let query = supabase.supabase.from('orden_compra').select(`
      *,
      proveedor (id, nombre, email, telefono, direccion),
      estatus (nombre),
      orden_compra_producto (id_producto, cantidad, producto (nombre, precio, descripcion)),
      cuentas_por_pagar (monto)
    `).eq('activo', true); // Include active filter

    if (criteria.id) {
      query = query.eq('id', criteria.id);
    }
    if (criteria.rif) {
      query = query.eq('id_proveedor', criteria.rif);
    }
    if (criteria.razonSocial) {
      query = query.ilike('proveedor.nombre', `%${criteria.razonSocial}%`);
    }
    if (criteria.estatus) {
      query = query.eq('estatus.nombre', criteria.estatus);
    }
    if (criteria.desde) {
      const desdeDate = new Date(criteria.desde).toISOString().split('T')[0];
      query = query.gte('fecha_ini', `${desdeDate}T00:00:00`); // Aseguramos que incluya el día completo
    }
    if (criteria.hasta) {
      const hastaDate = new Date(criteria.hasta).toISOString().split('T')[0];
      query = query.lte('fecha_ini', `${hastaDate}T23:59:59`); // Incluimos el día completo hasta las 23:59:59
    }

    const { data, error } = await query;

    if (error) throw error;

    const ordenesConPagos = await Promise.all(
      data.map(async (ordenCompra) => {
        const pagos = await calculatePagosOrdenCompra(ordenCompra);
        return { ...ordenCompra, ...pagos };
      })
    );

    return { data: ordenesConPagos, error: null };
  } catch (error) {
    console.error('Error al buscar órdenes de compra:', error);
    return { data: null, error };
  }
};
