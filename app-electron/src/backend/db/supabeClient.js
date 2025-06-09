const {createClient} = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jrgubxunsvsnlwkvxfen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ3VieHVuc3Zzbmx3a3Z4ZmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjU5MTYsImV4cCI6MjA2NDg0MTkxNn0.KhsYxvf30JJi194Wi_AlujqfiLZvCcZajdVyRni6ulQ';

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