const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    const { data, error } = await supabase.from('cafes').select('id, name').limit(3);
    if (error) {
      console.error('Query Error:', error);
    } else {
      console.log('Success! Cafes:', data);
    }
  } catch (e) {
    console.error('Fatal Error:', e);
  }
}

run();
