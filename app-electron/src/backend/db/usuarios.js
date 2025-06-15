const supabase = require('./supabaseClient.js');

exports.login = async (email, password) => {
  if (!supabase) {
    throw new Error('Cliente no inicializado por falta de credenciales.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      throw new Error('Usuario o contraseña incorrectos'); // Lanza un error específico
    }

    return data.user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
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