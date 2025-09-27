"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/UI/use-toast";

type Course = {
  userId: string;
  connectionId: string;
  courseId: number;
  fullname: string;
  shortname?: string;
  progress?: number;
};

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error("You are not signed in. Please sign in and try again.");
        const { data, error } = await supabase.functions.invoke("moodle-courses", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (error) throw error;
        setCourses((data?.data as Course[]) || []);
      } catch (e: any) {
        setError(e.message || "Failed to load courses");
        toast({ title: "Failed to load courses", description: e.message || "", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function handleSync() {
    if (!user) return;
    setSyncing(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("You are not signed in. Please sign in and try again.");
      const { error: syncError } = await supabase.functions.invoke("moodle-sync", {
        body: { verify: true },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (syncError) throw syncError;
      const { data, error } = await supabase.functions.invoke("moodle-courses", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw error;
      setCourses((data?.data as Course[]) || []);
      toast({ title: "Synced", description: "Courses updated." });
    } catch (e: any) {
      setError(e.message || "Sync failed");
      toast({ title: "Sync failed", description: e.message || "", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Courses</h1>
        <p className="text-text-secondary">Please sign in to view your courses.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Courses</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-secondary inline-flex items-center gap-2"
          aria-label="Sync courses from Moodle"
          aria-busy={syncing}
        >
          {syncing && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading courses">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-background-secondary">
              <div className="h-4 w-3/4 bg-background-tertiary rounded animate-pulse mb-2" />
              <div className="h-3 w-1/3 bg-background-tertiary rounded animate-pulse" />
              <div className="h-8 w-24 bg-background-tertiary rounded animate-pulse mt-4" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-text-secondary">
          No courses found. Connect your Moodle account and sync from
          {" "}
          <Link href="/settings/moodle" className="underline">Moodle settings</Link>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.courseId} className="p-4 rounded-lg border border-border bg-background-secondary hover:bg-background-tertiary transition-colors">
              <div className="font-medium mb-1 line-clamp-2">{c.fullname}</div>
              {typeof c.progress === "number" && (
                <div className="text-xs text-text-secondary mb-2">Progress: {Math.round(c.progress)}%</div>
              )}
              <Link href={`/courses/${c.courseId}`} className="btn-primary inline-block mt-2" aria-label={`Open course ${c.fullname}`}>Open</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
