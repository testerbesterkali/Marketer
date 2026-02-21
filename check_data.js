import { createClient } from '@supabase/supabase-js';

const url = 'https://whsfgzopfxoyneihbqmi.supabase.co';
const key = process.argv[2]; // Use anon key
const workspaceId = 'fe08b983-6be2-4703-9f84-7ac5a69b5a7d';

const supabase = createClient(url, key);

async function check() {
    const { data: brand } = await supabase.from('brand_profiles').select('*').eq('workspace_id', workspaceId).limit(1);
    const { data: plan } = await supabase.from('content_plans').select('*').eq('workspace_id', workspaceId).limit(1);
    console.log('Brand exists:', brand?.length > 0);
    console.log('Plan exists:', plan?.length > 0);
}

check();
