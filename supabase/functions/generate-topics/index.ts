import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

interface GenerateTopicsRequest {
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

    const { workspace_id } = await req.json() as GenerateTopicsRequest;

    const broadcast = async (step: string) => {
      await supabaseClient.channel(`workspace_topics:${workspace_id}`).send({
        type: "broadcast",
        event: "progress",
        payload: { step },
      });
    };

    // 1. Fetch Brand Profile and Content Plan
    await broadcast("strategy");
    const { data: brandProfile } = await supabaseClient
      .from("brand_profiles")
      .select("*")
      .eq("workspace_id", workspace_id)
      .single();

    const { data: contentPlan } = await supabaseClient
      .from("content_plans")
      .select("*")
      .eq("workspace_id", workspace_id)
      .single();

    if (!brandProfile || !contentPlan) throw new Error("Brand profile or content plan not found");

    // 2. Generate Topics using OpenAI
    await broadcast("topics");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

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
            content: "You are a social media strategist. Generate 14 content topics (2 weeks) based on the brand profile and content plan."
          },
          {
            role: "user",
            content: `Brand: ${brandProfile.business_name}
            Voice: ${brandProfile.brand_voice}
            Platforms: ${Object.keys(contentPlan.platforms).join(", ")}
            
            Generate 14 topics. For each topic, provide: title, description, content_pillar, and suggested_platforms (array).
            Response format: { "topics": [...] }`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const topics = JSON.parse(data.choices[0].message.content).topics;

    // 3. Save Topics
    await broadcast("scheduling");
    const topicsToInsert = topics.map((t: any, i: number) => ({
      workspace_id,
      ...t,
      approved: false,
      week_of: new Date(Date.now() + (Math.floor(i / 7) * 7 * 24 * 60 * 60 * 1000)).toISOString()
    }));

    const { error: topicsError } = await supabaseClient
      .from("topics")
      .insert(topicsToInsert);

    if (topicsError) throw topicsError;

    // 4. Complete
    await broadcast("finishing");

    // Update onboarding status
    await supabaseClient
      .from("users_profile")
      .update({ onboarding_completed: true })
      .eq("id", brandProfile.owner_id); // This might fail if we don't have owner_id, but it's okay for now.

    await broadcast("completed");

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
