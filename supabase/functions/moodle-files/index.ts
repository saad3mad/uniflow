// @ts-nocheck
// Supabase Edge Function: moodle-files (secure proxy)
// Fetches the stored URL server-side and streams the file to the client.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function inferDisposition(contentType: string | null | undefined, filename: string) {
  const ct = (contentType || "").toLowerCase();
  const inline = ct.includes("pdf") || ct.startsWith("image/") || ct.startsWith("text/") || ct.includes("audio/") || ct.includes("video/");
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return `${inline ? "inline" : "attachment"}; filename="${safeName}"`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { moduleId } = await req.json().catch(() => ({}));
    if (!moduleId || typeof moduleId !== "number") {
      return new Response(JSON.stringify({ ok: false, error: "moduleId is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SB_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SB_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data, error } = await supabase
      .from("moodle_course_contents")
      .select("url, module_name")
      .eq("module_id", moduleId)
      .limit(1)
      .maybeSingle();

    if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!data?.url) return new Response(JSON.stringify({ ok: false, error: "URL not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(
      JSON.stringify({ ok: true, url: data.url, moduleName: data.module_name ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
