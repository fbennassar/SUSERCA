const supabaseClientModule = require('./supabaseClient.js');
console.log('[rol.js] Contenido completo de supabaseClientModule importado:', supabaseClientModule);

const { supabase } = supabaseClientModule; // Desestructurando supabase
console.log('[rol.js] Cliente supabase después de desestructurar:', supabase);
console.log('[rol.js] Tipo de cliente supabase:', typeof supabase);

if (supabase && typeof supabase.from === 'function') {
    console.log('[rol.js] supabase.from ES una función.');
} else {
    console.error('[rol.js] supabase.from NO es una función o supabase es undefined/incorrecto.');
    if(supabase) {
        console.error('[rol.js] Claves del objeto supabase:', Object.keys(supabase));
    }
}

exports.getRol = async () => {
  if (!supabase) {
    console.error('[rol.js] getRol: Cliente Supabase (anónimo) es null o undefined ANTES de la llamada a .from(). Esto no debería pasar si la desestructuración funcionó.');
    throw new Error('Cliente Supabase (anónimo) no inicializado.');
  }
  try {
    console.log('[rol.js] getRol: Intentando llamar a supabase.from("rol")');
    const { data, error } = await supabase
      .from('rol')
      .select('id, nombre');

    if (error) {
      console.error('[rol.js] getRol: Error al obtener roles desde Supabase:', error);
      throw error;
    }
    console.log('[rol.js] getRol: Roles obtenidos:', data);
    return data;
  } catch (error) {
    console.error('[rol.js] getRol: Error en la función getRol:', error);
    throw error;
  }
};