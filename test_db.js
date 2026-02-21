const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data: users } = await supabase.from('users_profile').select('*');
  console.log('Users:', users.length);
  
  const { data: workspaces } = await supabase.from('workspaces').select('*');
  console.log('Workspaces:', workspaces.map(w => w.id));
  
  const { data: topics } = await supabase.from('topics').select('*');
  console.log('Topics total:', topics.length);
  const unapproved = topics.filter(t => t.approved === false);
  console.log('Unapproved topics:', unapproved.length);
}
main();
