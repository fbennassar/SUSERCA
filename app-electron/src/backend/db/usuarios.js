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

// exports.getProfile = async (userId) => {
//   if (!supabase) {
//     throw new Error('Cliente no inicializado por falta de credenciales.');
//   }
//   try {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', userId)
//       .single();
//     if (error) throw error;
//     return data;
//   } catch (error) {
//     console.error('Error al obtener el perfil:', error);
//     throw error;
//   }
// };