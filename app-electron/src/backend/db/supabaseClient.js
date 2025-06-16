const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_ADMIN_KEY; // Usando el nombre de tu variable

// console.log('[supabaseClient.js] SUPABASE_URL:', SUPABASE_URL);
// console.log('[supabaseClient.js] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);

if (!SUPABASE_URL) {
  console.error('[supabaseClient.js] Error: Falta la variable de entorno SUPABASE_URL.');
  throw new Error('Falta la variable de entorno SUPABASE_URL.');
}

if (!SUPABASE_ANON_KEY) {
  console.error('[supabaseClient.js] Error: Falta la variable de entorno SUPABASE_ANON_KEY.');
  throw new Error('Falta la variable de entorno SUPABASE_ANON_KEY. El cliente Supabase anónimo no puede ser inicializado.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// console.log('[supabaseClient.js] Cliente supabase (anónimo) creado, tipo:', typeof supabase);
// if(supabase) console.log('[supabaseClient.js] Claves del cliente supabase (anónimo):', Object.keys(supabase));


let supabaseAdmin = null;
if (SUPABASE_ADMIN_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY);
  // console.log('[supabaseClient.js] Cliente supabaseAdmin creado, tipo:', typeof supabaseAdmin);
} else {
  console.warn('[supabaseClient.js] ADVERTENCIA: SUPABASE_ADMIN_KEY no está definida. Las operaciones de administrador de Supabase podrían no funcionar.');
}

module.exports = {
  supabase,
  supabaseAdmin
};