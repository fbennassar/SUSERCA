const { supabase, supabaseAdmin } = require('./supabaseClient.js');
const session = require('../session/session.js');

exports.login = async (email, password) => {

  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado.');
  }

  try {
    const { data, error } = await supabase.functions.invoke('login_handler', {
      body: { email, password },
    });


    let response = data;
    if (typeof data === 'string') {
      try {
        response = JSON.parse(data);
      } catch (parseError) {
        throw new Error('Respuesta inválida de la Edge Function.');
      }
    }

    if (error) {
      console.error('Error al invocar Edge Function de login:', error);
      const errorMessage = response && response.error ? response.error.message : error.message;
      throw new Error(errorMessage || 'Error en el servicio de inicio de sesión.');
    }

    if (!response || !response.user) {
      console.error('Respuesta de login inválida o usuario no encontrado:', response);
      throw new Error(response && response.message ? response.message : 'Credenciales inválidas o usuario no encontrado.');
    }

    // Extrae los tokens de la sesión
    const { access_token: accessToken, refresh_token: refreshToken } = response.session;
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
    // Configura el token de autenticación en Supabase
    if (accessToken && refreshToken) {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error("Error al configurar la sesión:", error.message);
          throw new Error("Error al configurar la sesión de usuario.");
        }
        console.log("Datos de la sesión actual después de setSession:", data);
      } catch (error) {
        console.error("Error al configurar la sesión:", error.message);
        throw new Error("Error al configurar la sesión de usuario.");
      }
    } else {
      throw new Error('Tokens de sesión no encontrados.');
    }
    const sessionData = await supabase.auth.getSession;
    console.log("Datos de la sesión actual:", sessionData);

    session.setUser(response.user);
    session.setProfile(this.getProfile(response.user.id));
    console.log('Inicio de sesión exitoso:', response.user);
    console.log('Perfil del usuario:', session.getProfile());
    return response.user;
  } catch (error) {
    console.error('Error al iniciar sesión (llamando a Edge Function con invoke):', error);
    throw error;
  }
};

exports.getProfile = async (userId) => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado por falta de credenciales.');
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        nombre,
        email,
        id_rol,
        rol (
          nombre
        )
      `)
      .eq('id', userId)
      .single();
      console.log("Datos obtenidos del perfil:", data); // Log para depuración
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`No se encontró perfil para el usuario con ID: ${userId}`);
        return null;
      }
      console.error('Error al obtener el perfil con rol:', error);
      throw error;
    }

    if (data && !data.rol) {
      data.rol = { nombre: 'Sin rol asignado' };
    }
    
    return data;
  } catch (error) {
    console.error('Error en la función getProfile:', error);
    throw error;
  }
};

exports.getAllProfiles = async (nombreFilter = '', rolFilter = '') => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado por falta de credenciales.');
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
      query = query.ilike('nombre', `%${nombreFilter}%`);
    }

    if (rolFilter) {
      query = query.eq('id_rol', rolFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error al obtener todos los perfiles desde Supabase:', error);
      throw error;
    }
    return data.map(profile => ({
      id: profile.id,
      nombre: profile.nombre,
      email: profile.email,
      rol: profile.rol && profile.rol.nombre ? profile.rol.nombre : 'Sin rol asignado',
    }));
  } catch (error) {
    console.error('Error general en getAllProfiles:', error);
    throw error;
  }
};

exports.inviteUser = async (email, rolId, redirectTo) => {
  
  if (!supabaseAdmin) {
    console.error('[db/usuarios.js] inviteUser: Error - Cliente Supabase Admin no inicializado. Asegúrate de que SUPABASE_ADMIN_KEY (o SERVICE_ROLE_KEY) esté configurada.');
    throw new Error('Cliente Supabase Admin no inicializado. No se puede enviar la invitación.');
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { id_rol: rolId },
      redirectTo: redirectTo,
    });

    if (error) {
      const supabaseErrorMessage = error.message || 'Error desconocido de Supabase al enviar la invitación.';
      throw new Error(`Error de Supabase: ${supabaseErrorMessage}`);
    }

    return data;
  } catch (error) {
    console.error('[db/usuarios.js] inviteUser: Excepción general en la función inviteUser:', error.message);
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(error.toString() || 'Error desconocido en la lógica de invitación de usuario.');
    }
  }
};

exports.createUser = async (nombre, email, rolId, password) => {
  if (!supabaseAdmin) {
    console.error('[db/usuarios.js] createUser: Error - Cliente Supabase Admin no inicializado. Asegúrate de que SUPABASE_ADMIN_KEY (o SERVICE_ROLE_KEY) esté configurada.');
    throw new Error('Cliente Supabase Admin no inicializado. No se puede crear el usuario.');
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre: nombre,
        id_rol: rolId
      }
    });

    if (error) {
      console.error('[db/usuarios.js] createUser: Error de Supabase:', error);
      throw new Error(error.message || 'Error desconocido al crear el usuario.');
    }

    return data;
  } catch (error) {
    console.error('[db/usuarios.js] createUser: Excepción general:', error.message);
    throw error;
  }
};