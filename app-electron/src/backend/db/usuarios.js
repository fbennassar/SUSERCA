// Solo importa los clientes desde supabaseClient.js
const { supabase, supabaseAdmin } = require('./supabaseClient.js');

exports.login = async (email, password) => {
  // Asegúrate de que el cliente Supabase esté inicializado
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado.');
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
      } catch (parseError) { // Renombrar variable de error para evitar conflicto
        console.error('Error al parsear la respuesta de la Edge Function:', parseError);
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
      // Asumiendo que rolFilter es el ID del rol.
      // Si rolFilter es el nombre del rol, necesitarías obtener el ID de ese rol primero
      // o ajustar la query para filtrar por rol.nombre (lo cual es más complejo con PostgREST directamente).
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

// --- EL SIGUIENTE BLOQUE DE CÓDIGO ESTABA DUPLICADO Y CAUSABA EL ERROR ---
// --- DEBE SER ELIMINADO DE ESTE ARCHIVO ---
/*
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_ADMIN_KEY;

if (!SUPABASE_URL) {
  console.error('[supabaseClient.js] Error: Falta la variable de entorno SUPABASE_URL.');
  throw new Error('Falta la variable de entorno SUPABASE_URL.');
}

if (!SUPABASE_ANON_KEY) {
  console.error('[supabaseClient.js] Error: Falta la variable de entorno SUPABASE_ANON_KEY.');
  throw new Error('Falta la variable de entorno SUPABASE_ANON_KEY. El cliente Supabase anónimo no puede ser inicializado.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // <--- ESTA ES LA REDECLARACIÓN

let supabaseAdmin = null;
if (SUPABASE_ADMIN_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY);
} else {
  console.warn('[supabaseClient.js] ADVERTENCIA: SUPABASE_ADMIN_KEY no está definida. Las operaciones de administrador de Supabase podrían no funcionar.');
}

module.exports = { // <--- ESTO TAMBIÉN ES INCORRECTO AQUÍ, YA QUE ESTE ARCHIVO EXPORTA FUNCIONES
  supabase,
  supabaseAdmin
};
*/
// --- FIN DEL BLOQUE DUPLICADO ---

// La función inviteUser debe estar aquí si no la has movido o eliminado
exports.inviteUser = async (email, rolId, redirectTo) => {
  console.log('[db/usuarios.js] inviteUser: Iniciando invitación.');
  console.log(`[db/usuarios.js] inviteUser: Parámetros recibidos - Email: ${email}, RolID: ${rolId}, RedirectTo: ${redirectTo}`);

  if (!supabaseAdmin) {
    console.error('[db/usuarios.js] inviteUser: Error - Cliente Supabase Admin no inicializado. Asegúrate de que SUPABASE_ADMIN_KEY (o SERVICE_ROLE_KEY) esté configurada.');
    throw new Error('Cliente Supabase Admin no inicializado. No se puede enviar la invitación.');
  }

  try {
    console.log('[db/usuarios.js] inviteUser: Intentando llamar a supabaseAdmin.auth.admin.inviteUserByEmail...');
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { id_rol: rolId },
      redirectTo: redirectTo,
    });

    if (error) {
      console.error('[db/usuarios.js] inviteUser: Error devuelto por Supabase al invitar usuario:', JSON.stringify(error, null, 2));
      const supabaseErrorMessage = error.message || 'Error desconocido de Supabase al enviar la invitación.';
      throw new Error(`Error de Supabase: ${supabaseErrorMessage}`);
    }

    console.log('[db/usuarios.js] inviteUser: Invitación enviada exitosamente por Supabase. Respuesta:', JSON.stringify(data, null, 2));
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