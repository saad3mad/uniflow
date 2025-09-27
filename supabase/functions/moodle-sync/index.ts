// @ts-nocheck
// Supabase Edge Function: moodle-sync (implementation)
// - Decrypt stored token
// - Fetch site info, courses, assignments, and contents from Moodle
// - Upsert into Supabase tables

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

async function fetchJson(url: string, init?: RequestInit) {
  const resp = await fetch(url, init);
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json?.message || `Upstream error ${resp.status}`);
  if (json?.exception) throw new Error(json.message || json.error || "Moodle error");
  return json;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE");
    const MOODLE_TOKEN_ENC_KEY = Deno.env.get("MOODLE_TOKEN_ENC_KEY")!;

    if (!SUPABASE_SERVICE_ROLE) {
      return new Response(JSON.stringify({ ok: false, error: "SUPABASE_SERVICE_ROLE is required for sync" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Identify user
    const { data: userInfo } = await supabaseUser.auth.getUser();
    const userId: string | undefined = userInfo?.user?.id;
    if (!userId) return new Response(JSON.stringify({ ok: false, error: "Cannot determine user id" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Find active connection
    const { data: connections, error: connErr } = await supabaseUser
      .from("moodle_connections")
      .select("id, moodle_base_url, token_encrypted, private_token_encrypted")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1);
    if (connErr) return new Response(JSON.stringify({ ok: false, error: connErr.message }), { status: 400 });
    const connection = connections?.[0];
    if (!connection) return new Response(JSON.stringify({ ok: false, error: "No active connection" }), { status: 400 });

    const baseUrl: string = String(connection.moodle_base_url).replace(/\/$/, "");
    const aesKey = await importAesGcmKey(MOODLE_TOKEN_ENC_KEY);
    const token = await decryptAesGcm(String(connection.token_encrypted), aesKey);

    // 1) Site info (userid)
    const siteInfo = await fetchJson(
      `${baseUrl}/webservice/rest/server.php?moodlewsrestformat=json&wstoken=${encodeURIComponent(token)}&wsfunction=core_webservice_get_site_info`,
    );
    const moodle_user_id: number = siteInfo?.userid;
    if (!moodle_user_id) throw new Error("Failed to get Moodle user id");

    await supabaseAdmin
      .from("moodle_connections")
      .update({ moodle_user_id, last_verified_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", connection.id)
      .eq("user_id", userId);

    let coursesCount = 0;
    let assignCount = 0;
    let contentsCount = 0;

    // 2) Courses
    const courseList = await fetchJson(
      `${baseUrl}/webservice/rest/server.php?moodlewsrestformat=json&wstoken=${encodeURIComponent(
        token,
      )}&wsfunction=core_enrol_get_users_courses&userid=${moodle_user_id}`,
    );
    const nowIso = new Date().toISOString();
    for (const c of courseList || []) {
      const row = {
        user_id: userId,
        connection_id: connection.id,
        course_id: Number(c.id),
        fullname: String(c.fullname ?? ""),
        shortname: c.shortname ?? null,
        summary: c.summary ?? null,
        visible: c.visible ?? null,
        progress: c.progress ?? null,
        startdate: c.startdate ? new Date(c.startdate * 1000).toISOString() : null,
        enddate: c.enddate ? new Date(c.enddate * 1000).toISOString() : null,
        categoryid: c.categoryid ?? null,
        raw: c,
        updated_at: nowIso,
        created_at: nowIso,
      };
      const { error } = await supabaseAdmin.from("moodle_courses").upsert(row, { onConflict: "user_id,course_id" });
      if (!error) coursesCount++;
    }

    // 3) Assignments
    if ((courseList?.length ?? 0) > 0) {
      const params = new URLSearchParams();
      params.set("moodlewsrestformat", "json");
      params.set("wstoken", token);
      params.set("wsfunction", "mod_assign_get_assignments");
      courseList.forEach((c: any, idx: number) => params.set(`courseids[${idx}]`, String(c.id)));

      const assignResp = await fetch(`${baseUrl}/webservice/rest/server.php`, { method: "POST", body: params });
      const assignJson = await assignResp.json().catch(() => ({}));
      if (!assignResp.ok || assignJson?.exception) throw new Error(assignJson?.message || "Failed to fetch assignments");

      const courses = assignJson?.courses ?? [];
      for (const cc of courses) {
        const courseId = Number(cc.id);
        for (const a of cc.assignments ?? []) {
          const row = {
            user_id: userId,
            connection_id: connection.id,
            assignment_id: Number(a.id),
            course_id: courseId,
            name: String(a.name ?? "Assignment"),
            duedate: a.duedate ? new Date(a.duedate * 1000).toISOString() : null,
            allowsubmissionsfromdate: a.allowsubmissionsfromdate ? new Date(a.allowsubmissionsfromdate * 1000).toISOString() : null,
            cutoffdate: a.cutoffdate ? new Date(a.cutoffdate * 1000).toISOString() : null,
            grade: a.grade ?? null,
            status: a?.introformat ? null : null,
            raw: a,
            updated_at: nowIso,
            created_at: nowIso,
          };
          const { error } = await supabaseAdmin
            .from("moodle_assignments")
            .upsert(row, { onConflict: "user_id,assignment_id" });
          if (!error) assignCount++;
        }
      }
    }

    // 4) Course contents
    for (const c of courseList || []) {
      const cc = await fetchJson(
        `${baseUrl}/webservice/rest/server.php?moodlewsrestformat=json&wstoken=${encodeURIComponent(
          token,
        )}&wsfunction=core_course_get_contents&courseid=${Number(c.id)}`,
      );
      for (const section of cc || []) {
        const sectionId = Number(section.id ?? 0);
        const sectionName = section.name ?? null;
        for (const mod of section.modules ?? []) {
          const row = {
            user_id: userId,
            connection_id: connection.id,
            course_id: Number(c.id),
            section_id: sectionId,
            section_name: sectionName,
            module_id: Number(mod.id),
            module_name: String(mod.name ?? "Module"),
            modname: mod.modname ?? null,
            url: mod.url ?? null,
            raw: mod,
            updated_at: nowIso,
            created_at: nowIso,
          };
          const { error } = await supabaseAdmin
            .from("moodle_course_contents")
            .upsert(row, { onConflict: "user_id,course_id,module_id" });
          if (!error) contentsCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, counts: { courses: coursesCount, assignments: assignCount, contents: contentsCount } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
