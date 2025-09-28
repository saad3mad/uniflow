// @ts-nocheck
// Supabase Edge Function: moodle-files (secure proxy)
// Fetches the stored URL server-side and streams the file to the client.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function importAesGcmKey(base64Key: string): Promise<CryptoKey> {
  const raw = b64ToBytes(base64Key);
  if (raw.length !== 32) throw new Error("MOODLE_TOKEN_ENC_KEY must be 32 bytes (base64)");
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function decryptAesGcm(base64Cipher: string, key: CryptoKey): Promise<string> {
  const payload = b64ToBytes(base64Cipher);
  if (payload.length <= 12) throw new Error("Invalid cipher payload");
  const iv = payload.slice(0, 12);
  const ct = payload.slice(12);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(new Uint8Array(pt));
}

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

    const { moduleId, action } = await req.json().catch(() => ({}));
    if (!moduleId || typeof moduleId !== "number") {
      return new Response(JSON.stringify({ ok: false, error: "moduleId is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SB_URL") || Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SB_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
    const MOODLE_TOKEN_ENC_KEY = Deno.env.get("MOODLE_TOKEN_ENC_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: moduleRow, error } = await supabase
      .from("moodle_course_contents")
      .select("url, module_name, modname, extra, connection_id")
      .eq("module_id", moduleId)
      .limit(1)
      .maybeSingle();

    if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!moduleRow) return new Response(JSON.stringify({ ok: false, error: "Module not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: userInfo } = await supabase.auth.getUser();
    const userId = userInfo?.user?.id;
    if (!userId) return new Response(JSON.stringify({ ok: false, error: "Cannot determine user" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: connectionRow, error: connError } = await supabase
      .from("moodle_connections")
      .select("token_cipher")
      .eq("id", moduleRow.connection_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (connError) return new Response(JSON.stringify({ ok: false, error: connError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!connectionRow?.token_cipher) return new Response(JSON.stringify({ ok: false, error: "Missing encrypted token" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const aesKey = await importAesGcmKey(MOODLE_TOKEN_ENC_KEY);
    const token = await decryptAesGcm(String(connectionRow.token_cipher), aesKey);

    function withToken(url: string | undefined | null) {
      if (!url) return undefined;
      return url.includes("token=") ? url : `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
    }

    let targetUrl: string | undefined;

    const extra = moduleRow.extra ?? {};
    const contents = Array.isArray(extra?.contents) ? extra.contents : [];
    if (contents.length > 0 && contents[0]?.fileurl) {
      targetUrl = withToken(contents[0].fileurl);
    } else if (moduleRow.url) {
      targetUrl = withToken(moduleRow.url);
    }

    if (!targetUrl) {
      return new Response(JSON.stringify({ ok: false, error: "No file URL available" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const upstream = await fetch(targetUrl);
    if (!upstream.ok || !upstream.body) {
      const txt = await upstream.text().catch(() => "");
      return new Response(JSON.stringify({ ok: false, error: `Upstream error ${upstream.status}: ${txt}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const fileName = moduleRow.module_name || `file-${moduleId}`;
    const isInline = (action ?? "open") === "open";
    const disposition = `${isInline ? "inline" : "attachment"}; filename="${fileName.replace(/[^a-zA-Z0-9._-]+/g, "_")}"`;

    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", disposition);
    headers.set("X-File-Name", fileName);

    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
