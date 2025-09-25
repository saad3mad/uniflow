"use client"

import Card from "../../../components/Card";
import SectionHeader from "../../../components/SectionHeader";
import { BookOpen, FileText, ListChecks, RefreshCcw, Check, Download } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { sanitizeHtml } from "@/lib/sanitize";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/UI/use-toast";

export default function CourseDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ courseId: string }>()
  const courseId = Number(params?.courseId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [course, setCourse] = useState<any | null>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])

  // Group materials by section
  const sections = useMemo(() => {
    const groups = new Map<string, any[]>();
    materials.forEach(m => {
      const key = `${m.section_id}::${m.section_name}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(m);
    });
    return Array.from(groups.entries());
  }, [materials]);

  const handleDownload = useCallback(async (moduleId: number) => {
    if (!user) return;
    
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch(`/api/moodle/file?module_id=${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to download: ${res.status} ${text}`);
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      // Create temporary link to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
      toast({
        title: 'Download failed',
        description: err.message || "Couldn't download file",
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  const handleMarkRead = useCallback(async (moduleId: number, courseId: number) => {
    if (!user) return;
    
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch('/api/moodle/mark-read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ moduleId, courseId })
      });
      
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Mark as read failed');
      
      toast({
        title: 'Marked as read',
        description: 'Your progress has been saved',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to mark as read',
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  // Load course data
  useEffect(() => {
    async function load() {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      
      try {
        // Fetch course, assignments, materials from Supabase
        // (Your existing data loading logic here)
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [courseId]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Course header */}
      <SectionHeader
        title={course?.fullname || `Course #${courseId}`}
        subtitle={course?.summary ? course.summary : ''}
      />
      
      {/* Course content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Materials list */}
        <div className="lg:col-span-2 space-y-6">
          {sections.map(([key, mods]) => {
            const [, secName] = key.split('::');
            return (
              <Card key={key}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-xl text-text-primary">{secName || 'Section'}</h3>
                  <FileText className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="space-y-3">
                  {mods.map((m) => {
                    const desc = m.raw?.description || m.raw?.intro || '';
                    const safe = sanitizeHtml(String(desc || ''));
                    return (
                      <div key={m.module_id} className="p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-text-primary">{m.module_name || m.modname || 'Resource'}</div>
                            <div className="text-sm text-text-secondary">{m.modname} • Module #{m.module_id}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDownload(m.module_id)}
                              className="btn-secondary text-sm inline-flex items-center gap-1"
                            >
                              <Download className="w-4 h-4" /> Download
                            </button>
                            <button 
                              onClick={() => handleMarkRead(m.module_id, m.course_id)}
                              className="btn-secondary text-sm inline-flex items-center gap-1"
                            >
                              <Check className="w-4 h-4"/> Mark as read
                            </button>
                          </div>
                        </div>
                        {safe && (
                          <div className="prose prose-invert mt-3 text-sm" dangerouslySetInnerHTML={{ __html: safe }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}