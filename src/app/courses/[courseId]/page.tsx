"use client"

import Card from "../../../components/Card";
import SectionHeader from "../../../components/SectionHeader";
import { BookOpen, FileText, ListChecks, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>()
  const courseId = Number(params?.courseId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [course, setCourse] = useState<any | null>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])

  async function authHeaders(): Promise<HeadersInit> {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function fetchCourse() {
    if (!courseId) return
    setLoading(true)
    setError(null)
    try {
      const headers: HeadersInit = { ...(await authHeaders()) }
      const res = await fetch(`/api/moodle/fetch?courseId=${courseId}`, { headers })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to load')
      setCourse((json.courses || [])[0] || null)
      setAssignments((json.assignmentsByCourse?.[courseId] as any[]) || [])
      setMaterials((json.contentsByCourse?.[courseId] as any[]) || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const sections = useMemo(() => {
    const bySection: Record<string, any[]> = {}
    for (const m of materials) {
      const key = `${m.section_id || '0'}::${m.section_name || 'General'}`
      bySection[key] = bySection[key] || []
      bySection[key].push(m)
    }
    // preserve some ordering by section_id
    const entries = Object.entries(bySection).sort((a, b) => {
      const [aId] = a[0].split('::')
      const [bId] = b[0].split('::')
      return Number(aId) - Number(bId)
    })
    return entries
  }, [materials])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><BookOpen className="w-4 h-4" /> Course</span>}
        title={course?.fullname || `Course #${courseId}`}
        subtitle={course?.shortname || ''}
        actions={<button onClick={fetchCourse} className="btn-secondary inline-flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Refresh</button>}
      />

      {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-xl text-text-primary">Assignments</h3>
            <ListChecks className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="space-y-4">
            {assignments.map((a) => (
              <div key={a.assignment_id} className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-text-primary">{a.name}</div>
                  <div className="text-sm text-text-secondary">{a.duedate ? `Due ${new Date(a.duedate).toLocaleString()}` : 'No due date'}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">{a.status || '—'}</span>
              </div>
            ))}
            {assignments.length === 0 && <div className="text-sm text-text-secondary">No assignments</div>}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {sections.map(([key, mods]) => {
            const [, secName] = key.split('::')
            return (
              <Card key={key}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-xl text-text-primary">{secName || 'Section'}</h3>
                  <FileText className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="space-y-3">
                  {mods.map((m) => (
                    <a key={m.module_id} href={m.url || '#'} target="_blank" rel="noreferrer" className="block p-3 rounded-lg border border-border hover:bg-background-secondary transition">
                      <div className="font-medium text-text-primary">{m.module_name || m.modname || 'Resource'}</div>
                      <div className="text-sm text-text-secondary">{m.modname} • Module #{m.module_id}</div>
                    </a>
                  ))}
                </div>
              </Card>
            )
          })}
          {sections.length === 0 && (
            <Card>
              <div className="text-sm text-text-secondary">No materials</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
