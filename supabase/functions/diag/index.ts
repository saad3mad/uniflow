// @ts-nocheck
// Supabase Edge Function: diag
// Diagnostics to help debug environment and data issues for the current user.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");

    const SB_URL = Deno.env.get("SB_URL");
    const SB_ANON_KEY = Deno.env.get("SB_ANON_KEY");
    const SB_SERVICE_ROLE = Deno.env.get("SB_SERVICE_ROLE");
    const MOODLE_TOKEN_ENC_KEY = Deno.env.get("MOODLE_TOKEN_ENC_KEY");

    const envReport = {
      SB_URL: !!SB_URL,
      SB_ANON_KEY: !!SB_ANON_KEY,
      SB_SERVICE_ROLE: !!SB_SERVICE_ROLE,
      MOODLE_TOKEN_ENC_KEY_length: (MOODLE_TOKEN_ENC_KEY || "").length,
      hasAuthorizationHeader: !!authHeader,
    };

    if (!SB_URL || !SB_ANON_KEY) {
      return new Response(
        JSON.stringify({ ok: false, where: "env", envReport, error: "Missing SB_URL or SB_ANON_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, where: "auth", envReport, error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SB_URL, SB_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userInfo } = await supabase.auth.getUser();
    const userId: string | undefined = userInfo?.user?.id;
    if (!userId) {
      return new Response(
        JSON.stringify({ ok: false, where: "auth", envReport, error: "Cannot determine user id" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: connections, error: connErr } = await supabase
      .from("moodle_connections")
      .select("id, moodle_base_url, status, last_verified_at")
      .eq("user_id", userId)
      .limit(5);

    const report = {
      envReport,
      userId,
      connectionsCount: Array.isArray(connections) ? connections.length : 0,
      firstConnection: connections?.[0] || null,
      connErr: connErr?.message || null,
    };

    return new Response(JSON.stringify({ ok: true, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
