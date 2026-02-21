import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { post_id } = await req.json();

        // 1. Fetch Existing Post and Brand Profile
        const { data: post, error: postError } = await supabaseClient
            .from("posts")
            .select("*, topics(*, brand_profiles(*))")
            .eq("id", post_id)
            .single();

        if (postError || !post) throw new Error("Post not found");

        const topic = post.topics;
        const brandProfile = topic.brand_profiles;
        const openaiKey = Deno.env.get("OPENAI_API_KEY");

        // 2. Generate New Content
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a social media copywriter. Generate a viral post caption and an image generation prompt based on the brand identity."
                    },
                    {
                        role: "user",
                        content: `Topic: ${topic.title}
            Description: ${topic.description}
            Brand Profile: ${JSON.stringify(brandProfile)}
            Previous Caption: ${post.caption}
            
            Provide JSON: { "caption": "...", "hashtags": [...], "image_prompt": "..." }`
                    }
                ],
                response_format: { type: "json_object" }
            }),
        });

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        // 3. New Pollinations Image URL
        const newImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(content.image_prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}&enhance=true`;

        // 4. Update Post record
        const { error: updateError } = await supabaseClient
            .from("posts")
            .update({
                caption: content.caption,
                hashtags: content.hashtags,
                image_url: newImageUrl,
                image_prompt: content.image_prompt,
                status: 'draft'
            })
            .eq("id", post_id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, post: content }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
