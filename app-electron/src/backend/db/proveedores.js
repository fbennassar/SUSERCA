const session = require('../session/session');
const supabase = require('./supabaseClient'); // Importa el cliente Supabase correctamente



// Función para configurar el token de autenticación
exports.setAuthToken = (token) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  supabase.auth.setAuth(token);
};

exports.createProveedor = async (proveedorData) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  console.error("Prueba de error en el método create", { proveedorData });
  const { data, error } = await supabase.supabase
    .from('proveedor') // Cambiado a 'proveedores'
    .insert([proveedorData])
    .select();
  if (error) {
    console.error("Error al insertar proveedor en Supabase", { error: error.message, proveedorData });
    throw new Error(error.message); // Lanza el error para que sea manejado en el frontend
  }
  return { data, error };
};

exports.getAllProveedores = async () => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado por falta de credenciales.');
  }
  const { data, error } = await supabase.supabase
    .from('proveedor') // Cambiado a 'proveedores'
    .select('*')
    .eq('activo', true); // Solo proveedores activos
  if (error) {
    console.error("Error al obtener proveedores activos de Supabase", { error: error.message });
  }
  return { data, error };
};

exports.getProveedorByID = async (id) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  console.log("ID proporcionado para obtener proveedor:", id); // Log para depuración
  const { data, error } = await supabase.supabase
    .from('proveedor') // Cambiado a 'proveedores'
    .select('*')
    .eq('id', id)
    .eq('activo', true) // Solo proveedores activos
    .single(); // Para obtener un solo proveedor
  console.log("Respuesta de Supabase en getProveedorByID:", { data, error }); // Log para depuración
  if (error) {
    console.error(`Error al obtener proveedor con ID ${id} de Supabase`, { error: error.message });
  }
  return { data, error };
};

exports.getProveedorByName = async (name) => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado por falta de credenciales.');
  }
  const { data, error } = await supabase.supabase
    .from('proveedor') // Cambiado a 'proveedores'
    .select('*')
    .ilike('nombre', `%${name}%`) // Búsqueda insensible a mayúsculas/minúsculas
    .eq('activo', true) // Solo proveedores activos
    .single(); // Para obtener un solo proveedor por nombre
  if (error) {
    console.error(`Error al obtener proveedor con nombre ${name} de Supabase`, { error: error.message });
  }
  return { data, error };
};

exports.updateProveedor = async (id, updates) => {
  const profile = await session.getProfile(); // Resuelve la promesa
  console.log("Perfil actual:", profile); // Log del perfil actual
  if (!profile || !profile.rol || (profile.rol.nombre !== 'Gerente' && profile.rol.nombre !== 'Supervisor')) {
    throw new Error('Acción no autorizada. Solo los gerentes y supervisores pueden actualizar proveedores.');
  }
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado por falta de credenciales.');
  }
  const { data, error } = await supabase.supabase
    .from('proveedor') // Cambiado a 'proveedores'
    .update(updates)
    .eq('id', id)
    .select();
  if (error) {
    console.error(`Error al actualizar proveedor con ID ${id} en Supabase`, { error: error.message, updates });
  }
  return { data, error };
};

exports.deleteProveedor = async (id) => {
  const profile = await session.getProfile(); // Resuelve la promesa
  console.log("Perfil actual:", profile); // Log del perfil actual
  if (!profile || !profile.rol || (profile.rol.nombre !== 'Gerente' && profile.rol.nombre !== 'Supervisor')) {
    throw new Error('Acción no autorizada. Solo los gerentes y supervisores pueden eliminar proveedores.');
  }
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  console.log("ID proporcionado para eliminar:", id); // Log del ID
  const { data, error, count } = await supabase.supabase
    .from('proveedor') // Cambiado a 'proveedores'
    .update({ activo: false }) // Marcar como inactivo
    .eq('id', id) // Filtrar por ID del proveedor
    .select(); // Seleccionar para devolver el proveedor actualizado
  console.log("Respuesta de Supabase en delete:", { data, error, count }); // Log de la respuesta
  if (error) {
    console.error(`Error al marcar proveedor con ID ${id} como inactivo en Supabase`, { error: error.message });
    throw new Error(error.message); // Lanza el error para que sea manejado en el frontend
  }
  if (count === 0) {
    console.warn(`No se afectaron filas para el ID ${id}. Verifica las políticas de seguridad o los permisos.`);
  }
  return { data, error };
};

exports.searchProveedores = async (query) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  console.log("Query proporcionado para buscar proveedores:", query); // Log para depuración

  // Buscar por nombre
  const { data: nameData, error: nameError } = await supabase.supabase
    .from('proveedor')
    .select('*')
    .ilike('nombre', `%${query}%`)
    .eq('activo', true);

  let idData = [];
  let idError = null;

  // Verificar si el query es numérico antes de buscar por ID
  if (!isNaN(query)) {
    const { data, error } = await supabase.supabase
      .from('proveedor')
      .select('*')
      .eq('id', query) // Filtrar directamente por ID si es numérico
      .eq('activo', true);
    idData = data || [];
    idError = error;
  }

  // Combinar resultados
  const data = [...(nameData || []), ...idData];
  const error = nameError || idError;

  console.log("Respuesta combinada de Supabase en searchProveedores:", { data, error }); // Log para depuración
  if (error) {
    console.error(`Error al buscar proveedores con query ${query} en Supabase`, { error: error.message });
  }
  return { data, error };
};