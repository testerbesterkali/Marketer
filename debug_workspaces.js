import { createClient } from '@supabase/supabase-js';

const url = 'https://whsfgzopfxoyneihbqmi.supabase.co';
const key = process.argv[2];

const supabase = createClient(url, key);

async function check() {
    const { data: users } = await supabase.from('users_profile').select('id').limit(1);
    const ownerId = users[0].id;

    const { data: workspaces } = await supabase.from('workspaces').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
    console.log(`Found ${workspaces.length} workspaces for user ${ownerId}`);

    for (const ws of workspaces) {
        const { data: brand } = await supabase.from('brand_profiles').select('id, business_name').eq('workspace_id', ws.id).limit(1).maybeSingle();
        const { data: plan } = await supabase.from('content_plans').select('id').eq('workspace_id', ws.id).limit(1).maybeSingle();
        const { data: topics } = await supabase.from('topics').select('id').eq('workspace_id', ws.id);

        console.log(`- Workspace: ${ws.name} | ID: ${ws.id} | Step: ${ws.onboarding_step}`);
        console.log(`  Brand Profile: ${brand ? brand.business_name : 'MISSING'}`);
        console.log(`  Content Plan: ${plan ? 'EXISTS' : 'MISSING'}`);
        console.log(`  Topics Count: ${topics?.length || 0}`);
    }
}

check();
