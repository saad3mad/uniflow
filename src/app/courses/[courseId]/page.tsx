"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/UI/use-toast";

interface ContentItem {
  userId: string;
  connectionId: string;
  courseId: number;
  sectionId?: number;
  sectionName?: string;
  moduleId?: number;
  moduleName?: string;
  modname?: string;
  url?: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = useMemo(() => Number(params?.courseId), [params]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user || !courseId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke("moodle-contents", {
          body: { courseId },
        });
        if (error) throw error;
        setItems((data?.data as ContentItem[]) || []);
      } catch (e: any) {
        setError(e.message || "Failed to load course contents");
        toast({ title: "Failed to load", description: e.message || "", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, courseId]);

  async function handleSync() {
    if (!user) return;
    setSyncing(true);
    setError(null);
    try {
      const { error: syncError } = await supabase.functions.invoke("moodle-sync", {
        body: { verify: true },
      });
      if (syncError) throw syncError;
      const { data, error } = await supabase.functions.invoke("moodle-contents", {
        body: { courseId },
      });
      if (error) throw error;
      setItems((data?.data as ContentItem[]) || []);
      toast({ title: "Synced", description: "Course contents updated." });
    } catch (e: any) {
      setError(e.message || "Sync failed");
      toast({ title: "Sync failed", description: e.message || "", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }

  async function openInBrowser(it: ContentItem) {
    if (!user || !it.moduleId) return;
    try {
      const { data, error } = await supabase.functions.invoke("moodle-files", {
        body: { moduleId: it.moduleId, action: "open" },
      });
      if (error) throw error;
      const url = (data as any)?.url as string | undefined;
      if (url) window.open(url, "_blank");
    } catch (e) {
      console.error(e);
      toast({ title: "Open failed", description: (e as any)?.message || "", variant: "destructive" });
    }
  }

  async function downloadFile(it: ContentItem) {
    if (!user || !it.moduleId) return;
    try {
      const { data, error } = await supabase.functions.invoke("moodle-files", {
        body: { moduleId: it.moduleId, action: "download" },
      });
      if (error) throw error;
      const url = (data as any)?.url as string | undefined;
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${it.moduleName || `file-${it.moduleId}`}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast({ title: "Download started" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Download failed", description: (e as any)?.message || "", variant: "destructive" });
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<number, ContentItem[]>();
    for (const it of items) {
      const key = it.sectionId || 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [items]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Course</h1>
        <p className="text-text-secondary">Please sign in to view this course.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Course {courseId}</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-secondary inline-flex items-center gap-2"
          aria-label="Sync course contents from Moodle"
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
        <div className="text-text-secondary">Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="text-text-secondary">No contents found. Try syncing or revisiting later.</div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([sectionId, arr]) => (
            <div key={sectionId} className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-background-secondary font-medium">
                {arr[0]?.sectionName || `Section ${sectionId}`}
              </div>
              <div className="divide-y divide-border">
                {arr.map((it) => (
                  <div key={it.moduleId} className="flex items-center justify-between px-4 py-3 hover:bg-background-tertiary transition-colors">
                    <div className="truncate pr-4">
                      <div className="font-medium truncate">{it.moduleName || it.modname || `Module ${it.moduleId}`}</div>
                      {it.url && <div className="text-xs text-text-secondary truncate">{it.url}</div>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openInBrowser(it)} className="btn-secondary">Open</button>
                      <button onClick={() => downloadFile(it)} className="btn-primary">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
