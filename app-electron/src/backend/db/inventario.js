const session = require('../session/session');
const supabase = require('./supabaseClient');

exports.createProducto = async (productoData) => {
  console.log("Backend createProducto - Datos recibidos:", productoData);
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  const { data, error } = await supabase.supabase
    .from('producto')
    .insert([productoData])
    .select();
  console.log("Backend createProducto - Respuesta de Supabase:", { data, error });
  if (error) {
    console.error("Backend createProducto - Error al insertar producto:", error);
    throw new Error(error.message);
  }
  console.log("Backend createProducto - Producto creado exitosamente:", data);
  return { data, error };
};

exports.getAllProductos = async () => {
  //console.log("Backend getAllProductos - Solicitando todos los productos");
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  const { data: producto, error } = await supabase.supabase
    .from('producto')
    .select(`
      *,
      categoria (
        nombre
      )
    `)
    .eq('activo', true);
  //console.log("Backend getAllProductos - Respuesta de Supabase:", { producto, error });
  if (error) {
    console.error("Backend getAllProductos - Error al obtener productos:", error);
    throw new Error(error.message);
  }

  const productosDesempaquetados = producto.map(p => ({
    ...p,
    categoria: p.categoria ? p.categoria.nombre : null
  }));

  //console.log("Backend getAllProductos - Productos obtenidos exitosamente:", productosDesempaquetados);
  return { data: productosDesempaquetados, error };
};

exports.getProductoByID = async (id) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  const { data, error } = await supabase.supabase
    .from('producto')
    .select('*, categoria(nombre)')
    .eq('id', id)
    .eq('activo', true)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return { data, error };
};

exports.getProductoByName = async (name) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  const { data, error } = await supabase.supabase
    .from('producto')
    .select('*, categoria(nombre)')
    .ilike('nombre', `%${name}%`)
    .eq('activo', true)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return { data, error };
};

exports.updateProducto = async (id, updates) => {
  const profile = await session.getProfile();
  if (!profile || !profile.rol || (profile.rol.nombre !== 'Gerente' && profile.rol.nombre !== 'Supervisor')) {
    throw new Error('Acción no autorizada.');
  }
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  const { data, error } = await supabase.supabase
    .from('producto')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) {
    throw new Error(error.message);
  }
  return { data, error };
};

exports.deleteProducto = async (id) => {
  const profile = await session.getProfile();
  if (!profile || !profile.rol || (profile.rol.nombre !== 'Gerente' && profile.rol.nombre !== 'Supervisor')) {
    throw new Error('Acción no autorizada.');
  }
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  const { data, error } = await supabase.supabase
    .from('producto')
    .update({ activo: false })
    .eq('id', id)
    .select();
  if (error) {
    throw new Error(error.message);
  }
  return { data, error };
};

exports.searchProductos = async (query) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  const { data: nameData, error: nameError } = await supabase.supabase
    .from('producto')
    .select('*, categoria(nombre)')
    .ilike('nombre', `%${query}%`)
    .eq('activo', true);

  let idData = [];
  let idError = null;

  if (!isNaN(query)) {
    const { data, error } = await supabase.supabase
      .from('producto')
      .select('*, categoria(nombre)')
      .eq('id', query)
      .eq('activo', true);
    idData = data || [];
    idError = error;
  }

  const data = [...(nameData || []), ...idData];
  const error = nameError || idError;

  if (error) {
    throw new Error(error.message);
  }
  return { data, error };
};

exports.getProductosByCategoria = async (categoriaId) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  try {
    const { data, error } = await supabase.supabase
      .from('producto')
      .select(`
        *,
        categoria (
          nombre
        )
      `)
      .eq('id_categoria', categoriaId)
      .eq('activo', true);

    if (error) {
      throw error;
    }
    // Mapeamos para mantener la consistencia del objeto producto
    const productos = data.map(p => ({
      ...p,
      categoria: p.categoria.nombre
    }));
    return { data: productos, error: null };
  } catch (error) {
    console.error('Error en getProductosByCategoria:', error);
    return { data: null, error };
  }
};