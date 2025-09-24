import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET /api/moodle/assignment?id=123
// Returns a single assignment row (RLS-scoped) with raw intro/details for rendering on the client.
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers })
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const idStr = searchParams.get('id')
    const assignmentId = idStr ? Number(idStr) : NaN
    if (!assignmentId || Number.isNaN(assignmentId)) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data: row, error } = await supabase
      .from('moodle_assignments')
      .select('*')
      .eq('user_id', userRes.user.id)
      .eq('assignment_id', assignmentId)
      .maybeSingle()
    if (error) throw error
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ ok: true, assignment: row })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Unexpected error' }, { status: 500 })
  }
}
