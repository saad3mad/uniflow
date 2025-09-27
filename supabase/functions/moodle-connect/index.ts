// @ts-nocheck
// Deno Deploy / Supabase Edge Function: moodle-connect
// Connect to Moodle, fetch token, encrypt, and upsert into public.moodle_connections

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function importAesGcmKey(base64Key: string): Promise<CryptoKey> {
  const raw = base64ToBytes(base64Key);
  if (raw.length !== 32) throw new Error("MOODLE_TOKEN_ENC_KEY must be 32 bytes (base64)");
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptAesGcm(key: CryptoKey, plaintext: string): Promise<string> {
  const enc = new TextEncoder();
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, enc.encode(plaintext));
  const ctBytes = new Uint8Array(ct);
  const payload = new Uint8Array(nonce.length + ctBytes.length);
  payload.set(nonce, 0);
  payload.set(ctBytes, nonce.length);
  // base64 encode
  let s = "";
  payload.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { baseUrl, username, password } = await req.json().catch(() => ({}));
    if (!baseUrl || !username || !password) {
      return new Response(JSON.stringify({ ok: false, error: "Missing baseUrl/username/password" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SB_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SB_ANON_KEY")!;
    const MOODLE_TOKEN_ENC_KEY = Deno.env.get("MOODLE_TOKEN_ENC_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Fetch token from Moodle
    const tokenUrl = `${baseUrl.replace(/\/$/, "")}/login/token.php?service=moodle_mobile_app&username=${encodeURIComponent(
      username,
    )}&password=${encodeURIComponent(password)}`;
    const tokenResp = await fetch(tokenUrl);
    if (!tokenResp.ok) {
      const txt = await tokenResp.text();
      return new Response(
        JSON.stringify({ ok: false, error: `Moodle rejected credentials (${tokenResp.status}): ${txt}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const tokenJson = await tokenResp.json().catch(() => ({}));
    const token: string | undefined = tokenJson.token;
    const privatetoken: string | undefined = tokenJson.privatetoken;
    if (!token) return new Response(JSON.stringify({ ok: false, error: "Invalid token response" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Encrypt tokens
    const aesKey = await importAesGcmKey(MOODLE_TOKEN_ENC_KEY);
    const tokenEncrypted = await encryptAesGcm(aesKey, token);
    const privateTokenEncrypted = privatetoken ? await encryptAesGcm(aesKey, privatetoken) : null;

    // Get current user id from the provided JWT
    const { data: userInfo, error: userErr } = await supabase.auth.getUser();
    let userId: string | null = userInfo?.user?.id ?? null;
    // Fallback: try to decode JWT quickly (not cryptographically verifying)
    if (!userId) {
      const parts = authHeader.split(" ")[1]?.split(".");
      if (parts?.length === 3) {
        try {
          const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(parts[1]), (c) => c.charCodeAt(0))));
          userId = payload?.sub ?? payload?.user_metadata?.sub ?? null;
        } catch {}
      }
    }
    if (!userId) return new Response(JSON.stringify({ ok: false, error: "Cannot determine user id" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Upsert connection
    const { error: upsertErr } = await supabase.from("moodle_connections").upsert(
      {
        user_id: userId,
        moodle_base_url: baseUrl.replace(/\/$/, ""),
        token_encrypted: tokenEncrypted,
        private_token_encrypted: privateTokenEncrypted,
        status: "active",
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,moodle_base_url" },
    );
    if (upsertErr) return new Response(JSON.stringify({ ok: false, error: upsertErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
