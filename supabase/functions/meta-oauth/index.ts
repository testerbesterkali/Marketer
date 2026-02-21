import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const code = url.searchParams.get('code')
        const stateStr = url.searchParams.get('state')

        if (!code || !stateStr) {
            throw new Error('Missing code or state')
        }

        const state = JSON.parse(atob(stateStr))
        const { workspace_id, platform } = state

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const metaAppId = Deno.env.get('META_APP_ID') ?? ''
        const metaAppSecret = Deno.env.get('META_APP_SECRET') ?? ''
        const redirectUri = `${supabaseUrl}/functions/v1/meta-oauth`

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Exchange code for Access Token
        const tokenResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${metaAppSecret}&code=${code}`
        )
        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            throw new Error(`Token_Exchange_Failed: ${tokenData.error.message}`)
        }

        const accessToken = tokenData.access_token

        // 2. Fetch User/Page Info to get IDs
        // For Instagram, we need to find the IG Business ID linked to a FB Page
        const meResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`)
        const meData = await meResponse.json()

        if (meData.error) {
            throw new Error(`MeData_Fetch_Failed: ${meData.error.message}`)
        }

        // Grab the first page for simplicity in this V1
        const page = meData.data[0]
        if (!page) {
            throw new Error('No_Facebook_Page_Linked_To_Account')
        }

        const pageId = page.id
        const pageAccessToken = page.access_token

        // Fetch Instagram Business ID linked to this page
        const igResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`)
        const igData = await igResponse.json()
        const igBusinessId = igData.instagram_business_account?.id

        // 3. Store in social_connections
        const { error: upsertError } = await supabase
            .from('social_connections')
            .upsert({
                workspace_id,
                platform,
                access_token: pageAccessToken, // Storing the Page Access Token for IG API calls
                meta_page_id: pageId,
                instagram_business_id: igBusinessId,
                account_name: page.name,
                connected: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'workspace_id,platform' })

        if (upsertError) throw new Error(`Supabase_Upsert_Failed_${upsertError.code}: ${upsertError.message}`)

        // 4. Redirect back to the app
        // We assume the app is running on the same domain or we have a VITE_SITE_URL
        const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173'
        return new Response(null, {
            status: 302,
            headers: {
                ...corsHeaders,
                'Location': `${siteUrl}/dashboard/integrations?success=true`
            },
        })

    } catch (error: any) {
        console.error('[MetaOAuth] Error:', error)
        const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173'
        // Ensure error is a string
        const errMsg = error.message || 'Unknown_Error'

        return new Response(null, {
            status: 302,
            headers: {
                ...corsHeaders,
                'Location': `${siteUrl}/dashboard/integrations?error=${encodeURIComponent(errMsg)}`
            },
        })
    }
})
