import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

interface AnalyzeBrandRequest {
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

        const { workspace_id } = await req.json() as AnalyzeBrandRequest;

        // 1. Fetch workspace details
        const { data: workspace, error: wsError } = await supabaseClient
            .from("workspaces")
            .select("*")
            .eq("id", workspace_id)
            .single();

        if (wsError || !workspace) throw new Error("Workspace not found");

        const broadcast = async (step: string) => {
            await supabaseClient.channel(`workspace:${workspace_id}`).send({
                type: "broadcast",
                event: "progress",
                payload: { step },
            });
        };

        // 2. Fetch website markdown via Jina AI
        await broadcast("scraping");
        const jinaResponse = await fetch(`https://r.jina.ai/${workspace.website_url}`);
        const markdown = await jinaResponse.text();

        // 3. Analyze via OpenAI
        await broadcast("analyzing");
        const openaiKey = Deno.env.get("OPENAI_API_KEY");

        const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
                        content: "You are an expert brand strategist. Analyze the provided website content and extract a comprehensive brand profile in JSON format."
                    },
                    {
                        role: "user",
                        content: `Analyze this website markdown and provide a JSON response following the PRD schema:
            
            Fields: business_name, tagline, industry, target_audience, brand_voice, core_values (array), unique_selling_points (array), competitors (array), brand_story, mission_statement, archetype, emotional_benefits (JSON), color_palette (JSON: primary, secondary, accent, background, text), typography (JSON: heading_font, body_font), ai_confidence_score.
            
            Markdown:
            ${markdown.substring(0, 15000)}`
                    }
                ],
                response_format: { type: "json_object" }
            }),
        });

        const analysisData = await analysisResponse.json();
        const brandProfile = JSON.parse(analysisData.choices[0].message.content);

        // 4. Competitor check (placeholder logic for now, but part of the flow)
        await broadcast("competitors");

        // 5. Save to database
        await broadcast("finishing");
        const { error: insertError } = await supabaseClient
            .from("brand_profiles")
            .upsert({
                workspace_id,
                ...brandProfile,
                raw_scraped_data: markdown.substring(0, 5000)
            });

        if (insertError) throw insertError;

        // 6. Complete
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
