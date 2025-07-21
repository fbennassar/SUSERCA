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
};

exports.createCategoria = async (categoriaData) => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado.');
  }
  try {
    const { data, error } = await supabase
      .from('categoria')
      .insert(categoriaData);

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
};

exports.editCategoria = async (id, categoriaData) => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado.');
  }
  try {
    const { data, error } = await supabase
      .from('categoria')
      .update(categoriaData)
      .eq('id', id);

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

exports.deleteCategoria = async (id) => {
  if (!supabase) {
    throw new Error('Cliente Supabase (anónimo) no inicializado.');
  }
  try {
    const { data, error } = await supabase
      .from('categoria')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}