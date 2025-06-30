const session = require('../session/session');
const supabase = require('./supabaseClient'); // Importa el cliente Supabase correctamente

exports.createClient = async (clientData) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  console.error("Prueba de error en el método create", { clientData });
  const { data, error } = await supabase.supabase
    .from('cliente') // Cambiado a 'cliente'
    .insert([clientData])
    .select();
  if (error) {
    console.error("Error al insertar cliente en Supabase", { error: error.message, clientData });
    throw new Error(error.message); // Lanza el error para que sea manejado en el frontend
  }
  return { data, error };
};

exports.getAllClients = async () => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado por falta de credenciales.');
  }
  const { data, error } = await supabase.supabase
    .from('cliente') // Cambiado a 'cliente'
    .select('*')
    .eq('activo', true); // Solo clientes activos
  if (error) {
    console.error("Error al obtener clientes activos de Supabase", { error: error.message });
  }
  return { data, error };
};

exports.getClientByID = async (id) => {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  console.log("ID proporcionado para obtener cliente:", id); // Log para depuración
  const { data, error } = await supabase.supabase
    .from('cliente') // Cambiado a 'cliente'
    .select('*')
    .eq('id', id)
    .eq('activo', true) // Solo clientes activos
    .single(); // Para obtener un solo cliente
  console.log("Respuesta de Supabase en getClientByID:", { data, error }); // Log para depuración
  if (error) {
    console.error(`Error al obtener cliente con ID ${id} de Supabase`, { error: error.message });
  }
  return { data, error };
};

exports.getClientByName = async (name) => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado por falta de credenciales.');
  }
  const { data, error } = await supabase.supabase
    .from('cliente') // Cambiado a 'cliente'
    .select('*')
    .ilike('nombre', `%${name}%`) // Búsqueda insensible a mayúsculas/minúsculas
    .eq('activo', true) // Solo clientes activos
    .single(); // Para obtener un solo cliente por nombre
  if (error) {
    console.error(`Error al obtener cliente con nombre ${name} de Supabase`, { error: error.message });
  }
  return { data, error };
};

exports.update = async (id, updates) => {
  const profile = await session.getProfile(); // Resuelve la promesa
  console.log("Perfil actual:", profile); // Log del perfil actual
  if (!profile || !profile.rol || (profile.rol.nombre !== 'Gerente' && profile.rol.nombre !== 'Supervisor')) {
    throw new Error('Acción no autorizada. Solo los gerentes y supervisores pueden actualizar clientes.');
  }
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado por falta de credenciales.');
  }
  const { data, error } = await supabase.supabase
    .from('cliente') // Cambiado a 'cliente'
    .update(updates)
    .eq('id', id)
    .select();
  if (error) {
    console.error(`Error al actualizar cliente con ID ${id} en Supabase`, { error: error.message, updates });
  }
  return { data, error };
};

exports.delete = async (id) => {
  const profile = await session.getProfile(); // Resuelve la promesa
  console.log("Perfil actual:", profile); // Log del perfil actual
  if (!profile || !profile.rol || (profile.rol.nombre !== 'Gerente' && profile.rol.nombre !== 'Supervisor')) {
    throw new Error('Acción no autorizada. Solo los gerentes y supervisores pueden eliminar clientes.');
  }
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }
  
  const sessionData = await supabase.supabase.auth.getSession();
  console.log("Datos de la sesión actual:", sessionData);
  console.log("ID proporcionado para eliminar:", id); // Log del ID
  const { data, error, count } = await supabase.supabase
    .from('cliente') // Cambiado a 'cliente'
    .update({ activo: false }) // Marcar como inactivo
    .eq('id', id) // Filtrar por ID del cliente
    .select(); // Seleccionar para devolver el cliente actualizado
  console.log("Respuesta de Supabase en delete:", { data, error, count }); // Log de la respuesta
  console.log("error reportado", error); // Log de los datos del cliente antes de la eliminación
  console.log("Datos del cliente después de la eliminación:", data); // Log de los datos del cliente
  console.log("Cantidad de filas afectadas:", count); // Log de la cantidad de filas afectadas
  // Manejo de errores
  if (error) {
    console.error(`Error al marcar cliente con ID ${id} como inactivo en Supabase`, { error: error.message });
    throw new Error(error.message); // Lanza el error para que sea manejado en el frontend
  }
  return { data, error };
};