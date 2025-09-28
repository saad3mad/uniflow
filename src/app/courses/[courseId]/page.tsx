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
  extra?: any;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = useMemo(() => {
    const raw = (params as any)?.courseId;
    const num = Number(raw);
    return Number.isFinite(num) ? num : NaN;
  }, [params]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [courseName, setCourseName] = useState<string>("");
  const functionsBaseUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return null;
    return `${base.replace(/\/$/, "")}/functions/v1/moodle-files`;
  }, []);

  useEffect(() => {
    if (!user || !Number.isFinite(courseId)) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error("You are not signed in. Please sign in and try again.");
        const { data, error } = await supabase.functions.invoke("moodle-contents", {
          body: { courseId: courseId },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (error) throw error;
        const raw = ((data as any)?.data as any[]) ?? [];
        const normalized: ContentItem[] = raw.map((row) => ({
          userId: row.user_id,
          connectionId: row.connection_id,
          courseId: Number(row.course_id),
          sectionId: row.section_id != null ? Number(row.section_id) : undefined,
          sectionName: row.section_name ?? row.extra?.sectionName ?? undefined,
          moduleId: row.module_id != null ? Number(row.module_id) : undefined,
          moduleName: row.module_name ?? row.extra?.moduleName ?? undefined,
          modname: row.modname ?? row.extra?.modname ?? undefined,
          url: row.url ?? row.extra?.url ?? undefined,
          extra: row.extra ?? undefined,
        }));
        setItems(normalized);
        const { data: courseRow, error: courseError } = await supabase
          .from("moodle_courses")
          .select("fullname")
          .eq("course_id", courseId)
          .maybeSingle();
        if (!courseError && courseRow?.fullname) {
          setCourseName(courseRow.fullname);
        }
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
    if (!Number.isFinite(courseId)) {
      setError("Invalid course. Please navigate back and open the course again.");
      return;
    }
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
      const { data, error } = await supabase.functions.invoke("moodle-contents", {
        body: { courseId: courseId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw error;
      const raw = ((data as any)?.data as any[]) ?? [];
      const normalized: ContentItem[] = raw.map((row) => ({
        userId: row.user_id,
        connectionId: row.connection_id,
        courseId: Number(row.course_id),
        sectionId: row.section_id != null ? Number(row.section_id) : undefined,
        sectionName: row.section_name ?? row.extra?.sectionName ?? undefined,
        moduleId: row.module_id != null ? Number(row.module_id) : undefined,
        moduleName: row.module_name ?? row.extra?.moduleName ?? undefined,
        modname: row.modname ?? row.extra?.modname ?? undefined,
        url: row.url ?? row.extra?.url ?? undefined,
        extra: row.extra ?? undefined,
      }));
      setItems(normalized);
      if (!courseName) {
        const { data: courseRow, error: courseError } = await supabase
          .from("moodle_courses")
          .select("fullname")
          .eq("course_id", courseId)
          .maybeSingle();
        if (!courseError && courseRow?.fullname) {
          setCourseName(courseRow.fullname);
        }
      }
      toast({ title: "Synced", description: "Course contents updated." });
    } catch (e: any) {
      setError(e.message || "Sync failed");
      toast({ title: "Sync failed", description: e.message || "", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }

  async function fetchModuleStream(moduleId: number, action: "open" | "download") {
    if (!functionsBaseUrl) throw new Error("Supabase URL is not configured");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("You are not signed in. Please sign in and try again.");
      const res = await fetch(functionsBaseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moduleId, action }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const fileName = res.headers.get("X-File-Name") || `file-${moduleId}`;
      return { blob, fileName, contentType: res.headers.get("Content-Type") || "application/octet-stream" };
    } catch (e) {
      throw e;
    }
  }

  async function openInBrowser(it: ContentItem) {
    if (!user || !it.moduleId) return;
    try {
      const result = await fetchModuleStream(it.moduleId, "open");
      if (!result) return;
      const blobUrl = URL.createObjectURL(result.blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      console.error(e);
      toast({ title: "Open failed", description: (e as any)?.message || "", variant: "destructive" });
    }
  }

  async function downloadFile(it: ContentItem) {
    if (!user || !it.moduleId) return;
    try {
      const result = await fetchModuleStream(it.moduleId, "download");
      if (!result) return;
      const blobUrl = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${result.fileName}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      toast({ title: "Download started" });
    } catch (e) {
      console.error(e);
      toast({ title: "Download failed", description: (e as any)?.message || "", variant: "destructive" });
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<number, ContentItem[]>();
    for (const it of items) {
      const key = it.sectionId ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [items]);

  function deriveActions(it: ContentItem) {
    const contents = Array.isArray(it.extra?.contents) ? it.extra.contents.filter((c: any) => c?.fileurl) : [];
    const primary = contents[0] || null;
    const mimetype: string | null = primary?.mimetype ?? null;
    const hasFileUrl = Boolean(primary?.fileurl || it.url);
    const inlineTypes = ["pdf", "image/", "text/", "audio/", "video/"];
    const canOpen = Boolean(
      hasFileUrl &&
        (mimetype
          ? inlineTypes.some((fragment) => mimetype.toLowerCase().includes(fragment))
          : (it.modname ?? "").toLowerCase() !== "assignment"),
    );
    const canDownload = Boolean(hasFileUrl);
    return { canOpen, canDownload };
  }

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
        <h1 className="text-2xl font-semibold">{courseName || `Course ${courseId}`}</h1>
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
                {arr.map((it) => {
                  const { canOpen, canDownload } = deriveActions(it);
                  const showActions = canOpen || canDownload;
                  return (
                    <div key={it.moduleId} className="flex items-center justify-between px-4 py-3 hover:bg-background-tertiary transition-colors">
                      <div className="truncate pr-4">
                        <div className="font-medium truncate">{it.moduleName || it.modname || `Module ${it.moduleId}`}</div>
                        {it.url && <div className="text-xs text-text-secondary truncate">{it.url}</div>}
                      </div>
                      {showActions && (
                        <div className="flex gap-2 shrink-0">
                          {canOpen && <button onClick={() => openInBrowser(it)} className="btn-secondary">Open</button>}
                          {canDownload && <button onClick={() => downloadFile(it)} className="btn-primary">Download</button>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
