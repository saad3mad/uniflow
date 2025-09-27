// @ts-nocheck
// Supabase Edge Function: moodle-assignments
// Returns assignments grouped by status for the authenticated user with refined logic

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function toDate(v: any): Date | undefined {
  if (!v) return undefined;
  try { return new Date(v); } catch { return undefined; }
}

function isCompleted(a: any): boolean {
  const status = String(a.status || "").toLowerCase();
  const grade = Number(a.grade ?? 0);
  // Treat as completed if we have a positive grade or a status indicating submission/grade
  if (grade > 0) return true;
  const completedHints = ["submitted", "graded", "submittedforgrading", "complete", "completed", "passed"]; 
  return completedHints.some((h) => status.includes(h));
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: list, error } = await supabase
      .from("moodle_assignments")
      .select("*");

    if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 864e5); // next 7 days
    // UTC day boundaries for "Due Today"
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dayEnd = new Date(dayStart.getTime() + 864e5);

    const src = (list ?? []).slice();

    const completed = src
      .filter((a) => isCompleted(a))
      .sort((a: any, b: any) => +new Date(a.duedate ?? 0) - +new Date(b.duedate ?? 0));

    const overdue = src
      .filter((a) => {
        const d = toDate(a.duedate);
        return !isCompleted(a) && d && d < now;
      })
      .sort((a: any, b: any) => +new Date(a.duedate) - +new Date(b.duedate));

    const dueToday = src
      .filter((a) => {
        const d = toDate(a.duedate);
        return !isCompleted(a) && d && d >= dayStart && d < dayEnd;
      })
      .sort((a: any, b: any) => +new Date(a.duedate) - +new Date(b.duedate));

    const dueSoon = src
      .filter((a) => {
        const d = toDate(a.duedate);
        return !isCompleted(a) && d && d >= now && d <= soon && !(d >= dayStart && d < dayEnd);
      })
      .sort((a: any, b: any) => +new Date(a.duedate) - +new Date(b.duedate));

    const upcoming = src
      .filter((a) => {
        const d = toDate(a.duedate);
        return !isCompleted(a) && d && d > soon;
      })
      .sort((a: any, b: any) => +new Date(a.duedate) - +new Date(b.duedate));

    const data = { DueToday: dueToday, DueSoon: dueSoon, Overdue: overdue, Upcoming: upcoming, Completed: completed };
    return new Response(JSON.stringify({ ok: true, data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
