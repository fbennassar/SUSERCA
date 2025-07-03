const supabase = require('./supabaseClient');

// Crear una nueva orden de venta
exports.createOrdenVenta = async (ordenVentaData, productos) => {
  try {
    // Check if cliente exists
    const { data: clienteExists, error: clienteError } = await supabase.supabase
      .from('cliente')
      .select('*')
      .eq('id', ordenVentaData.rif);

    if (clienteError) throw clienteError;

    let clienteId;

    if (clienteExists.length === 0) {
      // Insert cliente if it doesn't exist
      const { data: newCliente, error: newClienteError } = await supabase.supabase
        .from('cliente')
        .insert({
          id: ordenVentaData.rif,
          nombre: ordenVentaData.nombre,
        })
        .select();

      if (newClienteError) throw newClienteError;

      clienteId = newCliente[0].id;
    } else {
      clienteId = clienteExists[0].id;
    }

    // Update ordenVentaData with clienteId
    ordenVentaData.id_cliente = clienteId;

    // Filter ordenVentaData to include only necessary fields
    const filteredOrdenVentaData = {
      id_cliente: ordenVentaData.id_cliente,
      fecha_ini: new Date(ordenVentaData.fecha_ini).toISOString(),
      monto: ordenVentaData.monto,
      estatus: ordenVentaData.estatus,
    };

    const { data: ordenVenta, error: ordenVentaError } = await supabase.supabase
      .from('orden_venta')
      .insert(filteredOrdenVentaData)
      .select();

    if (ordenVentaError) throw ordenVentaError;

    const ordenVentaId = ordenVenta[0].id;

    const productosData = productos.map((producto) => ({
      id_codigo_producto: producto.id,
      id_orden_venta: ordenVentaId,
      cantidad: producto.cantidad,
    }));

    const { error: productosError } = await supabase.supabase
      .from('orden_venta_producto')
      .insert(productosData);

    if (productosError) throw productosError;

    return { data: ordenVenta, error: null };
  } catch (error) {
    console.error('Error al crear orden de venta:', error);
    return { data: null, error };
  }
};

// Obtener todas las órdenes de venta
async function calculateCobrosOrdenVenta(ordenVenta) {
  const montoPagado = ordenVenta.cuentas_por_cobrar.reduce((acc, cobro) => acc + cobro.monto, 0);
  const montoRestante = ordenVenta.monto - montoPagado;
  return {
    monto_pagado: montoPagado,
    monto_restante: montoRestante,
  };
}

exports.getAllOrdenesVenta = async () => {
  try {
    const { data, error } = await supabase.supabase
      .from('orden_venta')
      .select(`
        *,
        cliente (id, nombre, email, telefono, direccion),
        estatus (nombre),
        orden_venta_producto (id_codigo_producto, cantidad, producto (nombre, precio, descripcion)),
        cuentas_por_cobrar (monto)
      `)
      .eq('activo', true);

    if (error) throw error;

    const ordenesConCobros = await Promise.all(
      data.map(async (ordenVenta) => {
        const cobros = await calculateCobrosOrdenVenta(ordenVenta);
        return { ...ordenVenta, ...cobros };
      })
    );

    return { data: ordenesConCobros, error: null };
  } catch (error) {
    console.error('Error al obtener órdenes de venta:', error);
    return { data: null, error };
  }
};

// Obtener una orden de venta por ID
exports.getOrdenVentaById = async (id) => {
  try {
    const { data, error } = await supabase.supabase
      .from('orden_venta')
      .select(`
        *,
        cliente (nombre, email, telefono, direccion),
        estatus (nombre),
        orden_venta_producto (id_codigo_producto, cantidad, producto (nombre, precio, descripcion)),
        cuentas_por_cobrar (monto, fecha_realizacion, metodo)
      `)
      .eq('id', id);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al obtener orden de venta por ID:', error);
    return { data: null, error };
  }
};

// Actualizar una orden de venta
exports.updateOrdenVenta = async (id, ordenVentaData) => {
  try {
    const { data, error } = await supabase.supabase
      .from('orden_venta')
      .update(ordenVentaData)
      .eq('id', id);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al actualizar orden de venta:', error);
    return { data: null, error };
  }
};

// Eliminar una orden de venta
exports.deleteOrdenVenta = async (id) => {
  try {
    const { data, error } = await supabase.supabase
      .from('orden_venta')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error('Error al eliminar orden de venta:', error);
    return { data: null, error };
  }
};

// Obtener orden de venta con montos pagados y restantes
exports.getOrdenVentaWithCobros = async (idOrdenVenta) => {
  try {
    const { data: ordenVenta, error: ordenVentaError } = await supabase.supabase
      .from('orden_venta')
      .select('*, cuentas_por_cobrar(monto)')
      .eq('id', idOrdenVenta);

    if (ordenVentaError) throw ordenVentaError;

    if (ordenVenta.length === 0) {
      return {
        monto_pagado: 0.0,
        monto_restante: ordenVenta[0].monto,
      };
    }

    const montoPagado = ordenVenta[0].cuentas_por_cobrar.reduce((acc, cobro) => acc + cobro.monto, 0);
    const montoRestante = ordenVenta[0].monto - montoPagado;

    return {
      monto_pagado: montoPagado,
      monto_restante: montoRestante,
    };
  } catch (error) {
    console.error('Error al obtener orden de venta con cobros:', error);
    throw error;
  }
};

// Insertar pagos en cuentas_por_cobrar
exports.insertIntoCuentasPorCobrar = async (idOrdenVenta, paymentData) => {
  try {
    const { data, error } = await supabase.supabase
      .from('cuentas_por_cobrar')
      .insert({
        id_orden_venta: idOrdenVenta,
        monto: paymentData.monto,
        fecha_realizacion: new Date(paymentData.fecha).toISOString(),
        metodo: paymentData.metodo,
      });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error al insertar en cuentas por cobrar:', error);
    return { data: null, error };
  }
};
