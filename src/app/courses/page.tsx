"use client"

import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { BookOpen, RefreshCcw, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CoursesPage() {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<any[]>([])

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const headers: HeadersInit = { ...(await authHeaders()) }
      const res = await fetch(`/api/moodle/fetch`, { headers })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to load courses')
      setCourses(json.courses || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c: any) =>
      (c.fullname || '').toLowerCase().includes(q) ||
      (c.shortname || '').toLowerCase().includes(q)
    )
  }, [search, courses])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4" /> Courses</span>}
        title="Manage your courses"
        subtitle="Organize all classes in one place. Track progress, see upcoming deadlines, and jump into resources fast."
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search courses"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-lg bg-background-secondary border border-border text-sm focus-ring"
              />
            </div>
            <button onClick={fetchCourses} className="btn-secondary inline-flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Refresh</button>
          </div>
        }
      />

      {error && (
        <div className="text-sm text-red-500 mb-4">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c: any) => {
          const progress = typeof c.progress === 'number' ? Math.round(c.progress) : 0
          return (
            <Link key={c.course_id} href={`/courses/${c.course_id}`}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-xl text-text-primary">{c.fullname}</h3>
                    <p className="text-text-secondary text-sm">{c.shortname || `Course #${c.course_id}`}</p>
                  </div>
                  <span className="text-sm text-text-secondary">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div className="h-full bg-accent-primary" style={{ width: `${progress}%` }} />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
      {(!loading && filtered.length === 0) && (
        <div className="text-text-secondary text-sm mt-6">No courses yet. Go to Settings → Moodle to connect and sync.</div>
      )}
    </div>
  );
}
