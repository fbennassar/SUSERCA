const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_ADMIN_KEY;

if (!SUPABASE_URL) {
  throw new Error('Falta la variable de entorno SUPABASE_URL.');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Falta la variable de entorno SUPABASE_ANON_KEY. El cliente Supabase anónimo no puede ser inicializado.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


let supabaseAdmin = null;
if (SUPABASE_ADMIN_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY);
} else {
  console.warn('[supabaseClient.js] ADVERTENCIA: SUPABASE_ADMIN_KEY no está definida. Las operaciones de administrador de Supabase podrían no funcionar.');
}

module.exports = {
  supabase,
  supabaseAdmin
};