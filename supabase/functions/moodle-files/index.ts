// @ts-nocheck
// Supabase Edge Function: moodle-files (secure proxy)
// Fetches the stored URL server-side and streams the file to the client.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function inferDisposition(contentType: string | null | undefined, filename: string) {
  const ct = (contentType || "").toLowerCase();
  const inline = ct.includes("pdf") || ct.startsWith("image/") || ct.startsWith("text/") || ct.includes("audio/") || ct.includes("video/");
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return `${inline ? "inline" : "attachment"}; filename="${safeName}"`;
}

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });

    const { moduleId, action } = await req.json().catch(() => ({}));
    if (!moduleId || typeof moduleId !== "number") {
      return new Response(JSON.stringify({ ok: false, error: "moduleId is required" }), { status: 400 });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data, error } = await supabase
      .from("moodle_course_contents")
      .select("url, module_name")
      .eq("module_id", moduleId)
      .limit(1)
      .maybeSingle();

    if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400 });
    if (!data?.url) return new Response(JSON.stringify({ ok: false, error: "URL not found" }), { status: 404 });

    // Fetch upstream file
    const upstream = await fetch(data.url);
    if (!upstream.ok || !upstream.body) {
      const txt = await upstream.text().catch(() => "");
      return new Response(JSON.stringify({ ok: false, error: `Upstream error ${upstream.status}: ${txt}` }), { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const fileName = data.module_name || `file-${moduleId}`;
    const disposition = inferDisposition(contentType, fileName);

    // Stream response
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", disposition);
    // Avoid leaking origin to upstream in client; we're proxying the stream back to the browser.
    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500 });
  }
});
