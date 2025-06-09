const supabase = require('./supabaseClient.js');

// Las rows son un array de objetos, cada objeto representa una fila de la tabla
exports.login = async (email, password) => {

  if(!supabase) {
    throw new Error('Cliente no inicializado por falta de credenciales.');
    return null;
  }

  try {
    const { data, error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      throw error;
    }
    return data.user;
  }
  catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}