import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Fetch posts ready to be published
        const { data: posts, error: fetchError } = await supabase
            .from("posts")
            .select("*, workspace:workspaces(*)")
            .eq("status", "approved")
            .lte("scheduled_at", new Date().toISOString())

        if (fetchError) throw fetchError

        if (!posts || posts.length === 0) {
            return new Response(JSON.stringify({ message: "No posts to publish" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        }

        const results = []

        for (const post of posts) {
            console.log(`[ScheduledPublisher] Processing post ${post.id} for ${post.platform}`)

            try {
                // Fetch connection for this platform
                const { data: connection, error: connError } = await supabase
                    .from("social_connections")
                    .select("*")
                    .eq("workspace_id", post.workspace_id)
                    .eq("platform", post.platform)
                    .single()

                if (connError || !connection) {
                    throw new Error(`No connected account for ${post.platform}`)
                }

                let publishResult;

                if (post.platform === 'instagram') {
                    // Instagram Graph API Publishing Flow:
                    // 1. Create Media Container (POST ig_business_id/media)
                    // 2. Publish Content (POST ig_business_id/media_publish)

                    const mediaResponse = await fetch(
                        `https://graph.facebook.com/v18.0/${connection.instagram_business_id}/media`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                image_url: post.image_url,
                                caption: post.caption,
                                access_token: connection.access_token
                            })
                        }
                    )
                    const mediaData = await mediaResponse.json()
                    if (mediaData.error) throw new Error(`IG Media Container failed: ${mediaData.error.message}`)

                    const creationId = mediaData.id

                    const publishResponse = await fetch(
                        `https://graph.facebook.com/v18.0/${connection.instagram_business_id}/media_publish`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                creation_id: creationId,
                                access_token: connection.access_token
                            })
                        }
                    )
                    publishResult = await publishResponse.json()
                    if (publishResult.error) throw new Error(`IG Media Publish failed: ${publishResult.error.message}`)

                } else if (post.platform === 'facebook') {
                    // Facebook Feed API
                    const fbResponse = await fetch(
                        `https://graph.facebook.com/v18.0/${connection.meta_page_id}/photos`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                url: post.image_url,
                                caption: post.caption,
                                access_token: connection.access_token
                            })
                        }
                    )
                    publishResult = await fbResponse.json()
                    if (publishResult.error) throw new Error(`FB Photo Post failed: ${publishResult.error.message}`)
                } else {
                    throw new Error(`Publishing to ${post.platform} is not yet implemented`)
                }

                // Update post status
                const { error: updateError } = await supabase
                    .from("posts")
                    .update({
                        status: "published",
                        published_at: new Date().toISOString()
                    })
                    .eq("id", post.id)

                if (updateError) throw updateError
                results.push({ id: post.id, success: true })

            } catch (err) {
                console.error(`[ScheduledPublisher] Failed to process post ${post.id}:`, err)

                await supabase
                    .from("posts")
                    .update({ status: "failed" })
                    .eq("id", post.id)

                results.push({ id: post.id, success: false, error: err.message })
            }
        }

        return new Response(JSON.stringify({
            processed: posts.length,
            results
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("[ScheduledPublisher] Critical Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
})
