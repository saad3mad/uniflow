// @ts-nocheck
// Supabase Edge Function: moodle-courses
// Returns the current user's synced courses from public.moodle_courses

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data, error } = await supabase
      .from("moodle_courses")
      .select("*")
      .order("fullname", { ascending: true });

    if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500 });
  }
});
