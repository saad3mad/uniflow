import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET /api/moodle/fetch?baseUrl=...&courseId=...
// Returns structured JSON: { courses: [...], assignmentsByCourse: { [courseId]: [...] }, contentsByCourse: { [courseId]: [...] } }
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers })
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const baseUrl = searchParams.get('baseUrl') || undefined
    const courseId = searchParams.get('courseId') ? Number(searchParams.get('courseId')) : undefined

    // Filter connections
    const { data: conns, error: connErr } = await supabase
      .from('moodle_connections')
      .select('id, moodle_base_url, status, moodle_user_id')
      .eq('user_id', userRes.user.id)
      .order('created_at', { ascending: false })
    if (connErr) throw connErr

    const connectionIds = (conns || [])
      .filter(c => (baseUrl ? c.moodle_base_url === baseUrl : true))
      .map(c => c.id)

    // Courses
    let coursesQuery = supabase
      .from('moodle_courses')
      .select('*')
      .eq('user_id', userRes.user.id)
    if (connectionIds.length) coursesQuery = coursesQuery.in('connection_id', connectionIds)
    if (courseId) coursesQuery = coursesQuery.eq('course_id', courseId)
    const { data: courses, error: coursesErr } = await coursesQuery
    if (coursesErr) throw coursesErr

    const courseIds = courses.map(c => c.course_id)

    // Assignments
    let assignQuery = supabase
      .from('moodle_assignments')
      .select('*')
      .eq('user_id', userRes.user.id)
    if (courseId) assignQuery = assignQuery.eq('course_id', courseId)
    else if (courseIds.length) assignQuery = assignQuery.in('course_id', courseIds)
    const { data: assignments, error: assignErr } = await assignQuery
    if (assignErr) throw assignErr

    // Contents
    let contentsQuery = supabase
      .from('moodle_course_contents')
      .select('*')
      .eq('user_id', userRes.user.id)
    if (courseId) contentsQuery = contentsQuery.eq('course_id', courseId)
    else if (courseIds.length) contentsQuery = contentsQuery.in('course_id', courseIds)
    const { data: contents, error: contentsErr } = await contentsQuery
    if (contentsErr) throw contentsErr

    const assignmentsByCourse: Record<string, any[]> = {}
    for (const a of assignments || []) {
      assignmentsByCourse[a.course_id] = assignmentsByCourse[a.course_id] || []
      assignmentsByCourse[a.course_id].push(a)
    }

    const contentsByCourse: Record<string, any[]> = {}
    for (const m of contents || []) {
      contentsByCourse[m.course_id] = contentsByCourse[m.course_id] || []
      contentsByCourse[m.course_id].push(m)
    }

    return NextResponse.json({
      ok: true,
      connections: conns,
      courses,
      assignmentsByCourse,
      contentsByCourse,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
