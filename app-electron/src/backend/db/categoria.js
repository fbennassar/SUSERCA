const supabaseClientModule = require('./supabaseClient.js');

const { supabase } = supabaseClientModule;

exports.getCategoria = async () => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado.');
  }
  try {
    const { data, error } = await supabase
      .from('categoria')
      .select('id, nombre');

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}