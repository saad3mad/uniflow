"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/UI/use-toast";

type Assignment = {
  userId: string;
  connectionId: string;
  assignmentId: number;
  courseId: number;
  name: string;
  duedate?: string;
  grade?: number;
  status?: string;
};

type Groups = {
  DueToday: Assignment[];
  DueSoon: Assignment[];
  Overdue: Assignment[];
  Upcoming: Assignment[];
  Completed: Assignment[];
};

export default function AssignmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Groups | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);

  async function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("moodle-assignments");
      if (error) throw error;
      setGroups((data?.data as Groups) || null);
    } catch (e: any) {
      setError(e.message || "Failed to load assignments");
      toast({ title: "Failed to load assignments", description: e.message || "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function handleSync() {
    if (!user) return;
    setSyncing(true);
    setError(null);
    try {
      const { error: syncError } = await supabase.functions.invoke("moodle-sync", {
        body: { verify: true },
      });
      if (syncError) throw syncError;
      await load();
      toast({ title: "Synced", description: "Assignments updated." });
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
        <h1 className="text-2xl font-semibold mb-4">Assignments</h1>
        <p className="text-text-secondary">Please sign in to view your assignments.</p>
      </div>
    );
  }

  const sections: { key: keyof Groups; title: string }[] = [
    { key: "DueToday", title: "Due Today" },
    { key: "DueSoon", title: "Due Soon" },
    { key: "Overdue", title: "Overdue" },
    { key: "Upcoming", title: "Upcoming" },
    { key: "Completed", title: "Completed" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Assignments</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary select-none">
            <input
              type="checkbox"
              className="accent-emerald-600"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              aria-label="Hide completed assignments"
            />
            Hide Completed
          </label>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-secondary inline-flex items-center gap-2"
            aria-label="Sync assignments from Moodle"
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
      </div>

      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true" aria-label="Loading assignments">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-background-secondary font-medium">
                <div className="h-4 w-24 bg-background-tertiary rounded animate-pulse" />
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: 4 }).map((__, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="h-4 w-3/4 bg-background-tertiary rounded animate-pulse mb-2" />
                    <div className="h-3 w-1/2 bg-background-tertiary rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !groups ? (
        <div className="text-text-secondary">No assignments yet. Connect and sync your account from Settings → Moodle.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections
            .filter(({ key }) => !(hideCompleted && key === "Completed"))
            .map(({ key, title }) => {
            const arr = groups[key] || [];
            return (
              <div key={key} className="border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-background-secondary font-medium">{title}</div>
                {arr.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-text-secondary">No items</div>
                ) : (
                  <ul className="divide-y divide-border">
                    {arr.map((a) => (
                      <li key={a.assignmentId} className="px-4 py-3 hover:bg-background-tertiary transition-colors">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-text-secondary flex gap-3">
                          {a.duedate && <span>Due: {new Date(a.duedate).toLocaleString()}</span>}
                          {typeof a.grade === "number" && <span>Grade: {a.grade}</span>}
                          {a.status && <span>Status: {a.status}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
