import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// POST /api/moodle/submission
// form-data: assignmentId (number), file (Blob)
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers })
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const assignmentIdStr = form.get('assignmentId') as string | null
    const file = form.get('file') as File | null
    if (!assignmentIdStr) return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 })
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    const assignmentId = Number(assignmentIdStr)
    if (!assignmentId || Number.isNaN(assignmentId)) return NextResponse.json({ error: 'assignmentId invalid' }, { status: 400 })

    // Ensure the assignment belongs to the user (RLS table check)
    const { data: row, error: aErr } = await supabase
      .from('moodle_assignments')
      .select('assignment_id')
      .eq('user_id', userRes.user.id)
      .eq('assignment_id', assignmentId)
      .maybeSingle()
    if (aErr) throw aErr
    if (!row) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    // Upload to Supabase Storage under a user-scoped path
    const bucket = 'submissions'
    const path = `${userRes.user.id}/${assignmentId}/${Date.now()}-${file.name}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, new Uint8Array(arrayBuffer), {
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    })
    if (uploadErr) throw uploadErr

    // Optional: store a metadata row in a table for submissions (not created yet)
    // We return the storage path so client can display or request a signed URL later
    return NextResponse.json({ ok: true, path })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Unexpected error' }, { status: 500 })
  }
}
