const {createClient} = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Faltan variables de entorno para Supabase. Asegúrate de definir SUPABASE_URL y SUPABASE_ANON_KEY.');
}

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} 
else {
  throw new Error('Cliente no inicialziado por falta de credenciales.');
}

module.exports = supabase;