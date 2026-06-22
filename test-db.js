const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase.from('love_reasons').insert({ reason_text: '2024-05-01', display_order: -1 });
  console.log('Insert error:', error);
  const { data } = await supabase.from('love_reasons').select('*').eq('display_order', -1);
  console.log('Data:', data);
}
run();
