const supabaseClientModule = require('./supabaseClient.js');

const { supabase } = supabaseClientModule;

exports.getRol = async () => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado.');
  }
  try {
    const { data, error } = await supabase
      .from('rol')
      .select('id, nombre');

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
};