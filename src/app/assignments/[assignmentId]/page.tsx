"use client"

import Card from "../../../components/Card"
import SectionHeader from "../../../components/SectionHeader"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { sanitizeHtml } from "@/lib/sanitize"
import { RefreshCcw, Upload } from "lucide-react"

export default function AssignmentDetailPage() {
  const params = useParams<{ assignmentId: string }>()
  const assignmentId = Number(params?.assignmentId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignment, setAssignment] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  const load = useCallback(async () => {
    if (!assignmentId) return
    setLoading(true)
    setError(null)
    try {
      const headers: HeadersInit = { ...(await authHeaders()) }
      const res = await fetch(`/api/moodle/assignment?id=${assignmentId}`, { headers })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to load assignment')
      setAssignment(json.assignment)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [assignmentId, authHeaders])

  useEffect(() => {
    load()
  }, [load])

  const introHtml = useMemo(() => sanitizeHtml(String(assignment?.raw?.intro || '')), [assignment])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0) return
    const file = fileInputRef.current.files[0]
    setUploading(true)
    setMessage(null)
    try {
      const headers: HeadersInit = { ...(await authHeaders()) }
      // Note: fetch will set boundary automatically for FormData
      const form = new FormData()
      form.append('assignmentId', String(assignmentId))
      form.append('file', file)
      const res = await fetch('/api/moodle/submission', {
        method: 'POST',
        headers, // do not set content-type for multipart
        body: form,
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Upload failed')
      setMessage('Uploaded successfully')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <SectionHeader
        eyebrow={<span>Assignment</span>}
        title={assignment?.name || `Assignment #${assignmentId}`}
        subtitle={assignment?.duedate ? `Due ${new Date(assignment.duedate).toLocaleString()}` : ''}
        actions={<button onClick={load} className="btn-secondary inline-flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Refresh</button>}
      />

      {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <div className="font-heading text-lg text-text-primary mb-3">Details</div>
          <div className="space-y-2 text-sm text-text-secondary">
            <div><span className="text-text-primary">Course:</span> #{assignment?.course_id}</div>
            <div><span className="text-text-primary">Status:</span> {assignment?.status || '—'}</div>
            {assignment?.allowsubmissionsfromdate && <div>Opens: {new Date(assignment.allowsubmissionsfromdate).toLocaleString()}</div>}
            {assignment?.cutoffdate && <div>Cutoff: {new Date(assignment.cutoffdate).toLocaleString()}</div>}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="font-heading text-lg text-text-primary mb-3">Instructions</div>
          {introHtml ? (
            <div className="prose prose-invert text-sm" dangerouslySetInnerHTML={{ __html: introHtml }} />
          ) : (
            <div className="text-sm text-text-secondary">No instructions provided.</div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3">
          <form onSubmit={handleUpload} className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" className="text-sm" />
            <button disabled={uploading} className="btn-primary inline-flex items-center gap-2"><Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload submission'}</button>
            {message && <span className="text-sm text-text-secondary">{message}</span>}
          </form>
        </Card>
      </div>
    </div>
  )
}
