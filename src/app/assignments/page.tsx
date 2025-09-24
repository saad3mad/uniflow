"use client"

import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import { CheckSquare, AlertTriangle, Filter, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Assignment = {
  assignment_id: number
  course_id: number
  name: string
  duedate: string | null
  allowsubmissionsfromdate: string | null
  cutoffdate: string | null
  status: string | null
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function authHeaders(): Promise<HeadersInit> {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function fetchAssignments() {
    setLoading(true)
    setError(null)
    try {
      const headers: HeadersInit = { ...(await authHeaders()) }
      const res = await fetch('/api/moodle/fetch', { headers })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to load')
      const list: Assignment[] = []
      for (const courseId of Object.keys(json.assignmentsByCourse || {})) {
        for (const a of json.assignmentsByCourse[courseId]) list.push(a)
      }
      // sort by duedate ascending
      list.sort((a, b) => (new Date(a.duedate || 0).getTime() || 0) - (new Date(b.duedate || 0).getTime() || 0))
      setAssignments(list)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const now = Date.now()
  const groups = useMemo(() => {
    const overdue: Assignment[] = []
    const dueSoon: Assignment[] = []
    const completed: Assignment[] = []
    for (const a of assignments) {
      const due = a.duedate ? new Date(a.duedate).getTime() : null
      if (a.status === 'submitted' || a.status === 'graded') completed.push(a)
      else if (due && due < now) overdue.push(a)
      else dueSoon.push(a)
    }
    return { overdue, dueSoon, completed }
  }, [assignments])

  function renderGroup(title: string, icon: React.ReactNode, items: Assignment[]) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl text-text-primary">{title}</h3>
          {icon}
        </div>
        <div className="space-y-4">
          {items.map((a) => (
            <div key={a.assignment_id} className="flex items-start justify-between">
              <div>
                <div className="font-medium text-text-primary">{a.name}</div>
                <div className="text-sm text-text-secondary">Course #{a.course_id}{a.duedate ? ` • Due ${new Date(a.duedate).toLocaleString()}` : ''}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">{a.status || '—'}</span>
            </div>
          ))}
          {(!loading && items.length === 0) && (
            <div className="text-sm text-text-secondary">No items</div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span className="inline-flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Assignments</span>}
        title="Stay ahead of every deadline"
        subtitle="Fast filtering, clear priorities, and a simple overview keep you on track."
        actions={<button onClick={fetchAssignments} className="btn-secondary inline-flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Refresh</button>}
      />

      {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {renderGroup('Due Soon', <Filter className="w-4 h-4 text-text-secondary" />, groups.dueSoon)}
        {renderGroup('Overdue', <AlertTriangle className="w-4 h-4 text-text-secondary" />, groups.overdue)}
        {renderGroup('Completed', <CheckSquare className="w-4 h-4 text-text-secondary" />, groups.completed)}
      </div>
    </div>
  );
}
