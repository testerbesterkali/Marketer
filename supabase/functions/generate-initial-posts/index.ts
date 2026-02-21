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
    if (!workspace_id) throw new Error("Missing workspace_id");

    // 1. Fetch Brand Profile and Topics
    const { data: brandProfile, error: brandError } = await supabaseClient
      .from("brand_profiles")
      .select("*")
      .eq("workspace_id", workspace_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (brandError) throw new Error("DB Error fetching brand profile: " + JSON.stringify(brandError));
    if (!brandProfile) throw new Error(`No brand profile found for workspace ${workspace_id}.`);

    const { data: topics, error: queryError } = await supabaseClient
      .from("topics")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("approved", false)
      .limit(6);

    if (queryError) throw new Error("DB Error fetching topics: " + JSON.stringify(queryError));
    if (!topics || topics.length === 0) throw new Error("No unapproved topics found for this workspace.");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("Missing OPENAI_API_KEY environment variable");
    const pollinationsKey = Deno.env.get("POLLINATIONS_API_KEY");

    // 2. Generate Post Content and Image Prompts for each topic
    for (const topic of topics) {
      try {
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
                content: `Topic: ${topic.title}\nDescription: ${topic.description}\nBrand Profile: ${JSON.stringify(brandProfile)}\n\nProvide JSON: { "caption": "...", "hashtags": [...], "image_prompt": "..." }`
              }
            ],
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI HTTP Error: ${await response.text()}`);
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        // Generate Image via Pollinations
        const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(content.image_prompt)}?width=1080&height=1080&nologo=true&seed=${Math.floor(Math.random() * 1000000)}&enhance=true&model=flux${pollinationsKey ? `&key=${pollinationsKey}` : ''}`;

        // 3. Save Post
        const platform = Array.isArray(topic.suggested_platforms) && topic.suggested_platforms.length > 0
          ? topic.suggested_platforms[0]
          : 'instagram';

        const { error: insertError } = await supabaseClient
          .from("posts")
          .insert({
            workspace_id,
            topic_id: topic.id,
            platform: platform.toLowerCase(),
            status: 'draft',
            caption: content.caption,
            hashtags: content.hashtags || [],
            image_url: imageUrl,
            image_prompt: content.image_prompt,
            credits_used: 10
          });

        if (insertError) throw new Error(`Supabase Insert Error: ${insertError.message}`);
      } catch (innerError) {
        console.error(`Failed to generate post for topic ${topic.id}:`, innerError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Generate Initial Posts Error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
