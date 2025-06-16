const supabase = require('./supabaseClient.js');

exports.login = async (email, password) => {
   // Asegúrate de que el cliente Supabase esté inicializado
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado.');
  }

  try {
    // Llamamos a la Edge Function de login usando invoke
    const { data, error } = await supabase.functions.invoke('login_handler', {
      body: { email, password },
    });

    // Si data es string, parsea a objeto
    let response = data;
    if (typeof data === 'string') {
      try {
        response = JSON.parse(data);
      } catch (e) {
        throw new Error('Respuesta inválida de la Edge Function');
      }
    }

    if (error) {
      throw new Error(error.message || 'Usuario o contraseña incorrectos');
    }

    if (!response || !response.user) {
      throw new Error('La Edge Function no devolvió datos de usuario válidos.');
    }

    return response.user; // Esto devuelve el user que tu Edge Function te dio
  } catch (error) {
    console.error('Error al iniciar sesión (llamando a Edge Function con invoke):', error);
    throw error; // Propaga el error para que sea manejado por el ipcMain.handle
  }
};

exports.getProfile = async (userId) => {
  if (!supabase) {
    throw new Error('Cliente no inicializado por falta de credenciales.');
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
};

exports.getAllProfiles = async (nombreFilter='', rolFilter='') => {
  if (!supabase) {
    throw new Error('Cliente no inicializado por falta de credenciales.');
  }
  try {
    let query = supabase
      .from('profiles')
      .select(`
        id, 
        nombre,
        email,
        id_rol,
        rol (
          nombre
        )`);
        
        if (nombreFilter) {
      query = query.ilike('nombre', `%${nombreFilter}%`); // Usar ilike para búsqueda insensible a mayúsculas
    }

    if (rolFilter) {
      query = query.eq('id_rol', rolFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(profile => ({
      id: profile.id,
      nombre: profile.nombre,
      email: profile.email,
      rol: profile.rol ? profile.rol.nombre : 'Sin rol asignado',
    }));
  } catch (error) {
    console.error('Error al obtener todos los perfiles:', error);
    throw error;
  }
}