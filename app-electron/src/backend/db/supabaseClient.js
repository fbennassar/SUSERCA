const { createClient } = require('@supabase/supabase-js');

// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
// const SUPABASE_ADMIN_KEY = process.env.SUPABASE_ADMIN_KEY;

const SUPABASE_URL = 'https://jrgubxunsvsnlwkvxfen.supabase.co/'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ3VieHVuc3Zzbmx3a3Z4ZmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjU5MTYsImV4cCI6MjA2NDg0MTkxNn0.KhsYxvf30JJi194Wi_AlujqfiLZvCcZajdVyRni6ulQ'
const SUPABASE_ADMIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ3VieHVuc3Zzbmx3a3Z4ZmVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI2NTkxNiwiZXhwIjoyMDY0ODQxOTE2fQ.3ZNaD5jyST3Pp24mxvF3B-gDELe74uNIu8CRznnrF2w'

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