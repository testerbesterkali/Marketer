import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

interface GeneratePostsRequest {
  workspace_id: string;
}

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

    const { workspace_id } = await req.json() as GeneratePostsRequest;

    // 1. Fetch Approved Topics
    const { data: topics } = await supabaseClient
      .from("topics")
      .select("*, brand_profiles(*)")
      .eq("workspace_id", workspace_id)
      .eq("approved", false) // In onboarding, we generate for all first
      .limit(6);

    if (!topics || topics.length === 0) throw new Error("No topics found");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const pollinationsKey = Deno.env.get("POLLINATIONS_API_KEY");

    // 2. Generate Post Content and Image Prompts for each topic
    for (const topic of topics) {
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
              content: "You are a social media copywriter. Generate a viral post caption and an image generation prompt."
            },
            {
              role: "user",
              content: `Topic: ${topic.title}
              Description: ${topic.description}
              Brand Profile: ${JSON.stringify(topic.brand_profiles)}
              
              Provide JSON: { "caption": "...", "hashtags": [...], "image_prompt": "..." }`
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);

      // Generate Image via Pollinations
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(content.image_prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}&enhance=true`;

      // 3. Save Post
      await supabaseClient
        .from("posts")
        .insert({
          workspace_id,
          topic_id: topic.id,
          platform: topic.suggested_platforms[0],
          status: 'draft',
          caption: content.caption,
          hashtags: content.hashtags,
          image_url: imageUrl,
          image_prompt: content.image_prompt,
          credits_used: 10
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
