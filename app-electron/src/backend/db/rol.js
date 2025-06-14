const supabase = require('./supabaseClient.js');

exports.getRol = async () => {
  if (!supabase) {
    throw new Error('Cliente no inicializado por falta de credenciales.');
  }
  try {
    const { data, error } = await supabase
      .from('rol')
      .select('*')
    if (error) throw error;
    console.log('Datos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
};