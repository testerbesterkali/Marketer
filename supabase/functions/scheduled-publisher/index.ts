import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Fetch posts ready to be published
        // We look for 'approved' posts whose 'scheduled_at' time has passed
        const { data: posts, error: fetchError } = await supabase
            .from("posts")
            .select("*")
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

            // TODO: Integrate with actual Social Media APIs (Meta, LinkedIn, Twitter)
            // For now, we simulate a successful publish.

            const { error: updateError } = await supabase
                .from("posts")
                .update({
                    status: "published",
                    published_at: new Date().toISOString()
                })
                .eq("id", post.id)

            if (updateError) {
                console.error(`[ScheduledPublisher] Failed to update post ${post.id}:`, updateError)
                results.push({ id: post.id, success: false, error: updateError.message })
            } else {
                results.push({ id: post.id, success: true })
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
