import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { decrypt } from '@/lib/crypto'
import { getAssignments, getCourseContents, getUserCourses, verifyToken } from '@/lib/moodle'

// POST /api/moodle/sync
// Body: { baseUrl: string, verify?: boolean }
// Fetches courses, assignments, and course contents, then upserts into Supabase
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers })
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { baseUrl, verify } = body || {}
    if (!baseUrl) return NextResponse.json({ error: 'baseUrl is required' }, { status: 400 })

    const { data: conn, error: connErr } = await supabase
      .from('moodle_connections')
      .select('*')
      .eq('user_id', userRes.user.id)
      .eq('moodle_base_url', String(baseUrl))
      .maybeSingle()
    if (connErr) throw connErr
    if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

    const token = decrypt(conn.token_encrypted)
    const site = verify ? await verifyToken(String(baseUrl), token) : { userid: conn.moodle_user_id }

    const userid = Number(site.userid || conn.moodle_user_id)
    if (!userid) return NextResponse.json({ error: 'Unable to determine Moodle user id' }, { status: 400 })

    // 1) Courses
    const courses = await getUserCourses(String(baseUrl), token, userid)

    // Normalize times from epoch seconds to ISO if present
    const courseRows = courses.map((c: any) => ({
      user_id: userRes.user.id,
      connection_id: conn.id,
      course_id: c.id,
      fullname: c.fullname ?? '',
      shortname: c.shortname ?? null,
      summary: c.summary ?? null,
      visible: c.visible !== undefined ? Boolean(c.visible) : null,
      progress: c.progress ?? null,
      startdate: c.startdate ? new Date(c.startdate * 1000).toISOString() : null,
      enddate: c.enddate ? new Date(c.enddate * 1000).toISOString() : null,
      categoryid: c.categoryid ?? null,
      raw: c,
    }))

    if (courseRows.length) {
      const { error: upCoursesErr } = await supabase
        .from('moodle_courses')
        .upsert(courseRows)
      if (upCoursesErr) throw upCoursesErr
    }

    const courseIds = courses.map((c: any) => Number(c.id))

    // 2) Assignments (batched via Moodle API)
    const assignmentsResp = courseIds.length ? await getAssignments(String(baseUrl), token, courseIds) : { courses: [] }
    const assignmentRows: any[] = []
    for (const c of assignmentsResp.courses || []) {
      for (const a of c.assignments || []) {
        assignmentRows.push({
          user_id: userRes.user.id,
          connection_id: conn.id,
          assignment_id: a.id,
          course_id: a.course,
          name: a.name,
          duedate: a.duedate ? new Date(a.duedate * 1000).toISOString() : null,
          allowsubmissionsfromdate: a.allowsubmissionsfromdate ? new Date(a.allowsubmissionsfromdate * 1000).toISOString() : null,
          cutoffdate: a.cutoffdate ? new Date(a.cutoffdate * 1000).toISOString() : null,
          grade: a.grade ?? null,
          status: a.visible === 1 ? 'visible' : 'hidden',
          raw: a,
        })
      }
    }
    if (assignmentRows.length) {
      const { error: upAssignErr } = await supabase
        .from('moodle_assignments')
        .upsert(assignmentRows)
      if (upAssignErr) throw upAssignErr
    }

    // 3) Course contents per course
    const contentRows: any[] = []
    for (const cid of courseIds) {
      const contents = await getCourseContents(String(baseUrl), token, cid)
      for (const section of contents || []) {
        for (const mod of section.modules || []) {
          contentRows.push({
            user_id: userRes.user.id,
            connection_id: conn.id,
            course_id: cid,
            section_id: section.id ?? null,
            section_name: section.name ?? null,
            module_id: mod.id,
            module_name: mod.name ?? null,
            modname: mod.modname ?? null,
            url: mod.url ?? null,
            raw: mod,
          })
        }
      }
    }
    if (contentRows.length) {
      const { error: upContentsErr } = await supabase
        .from('moodle_course_contents')
        .upsert(contentRows)
      if (upContentsErr) throw upContentsErr
    }

    return NextResponse.json({ ok: true, counts: { courses: courseRows.length, assignments: assignmentRows.length, contents: contentRows.length } })
  } catch (err: any) {
    // On token related errors, mark connection invalid
    try {
      const supabase = createServerClient({ headers: req.headers })
      const { data: userRes } = await supabase.auth.getUser()
      const body = await req.json().catch(() => ({}))
      const { baseUrl } = body || {}
      if (userRes?.user && baseUrl) {
        await supabase
          .from('moodle_connections')
          .update({ status: 'invalid' })
          .eq('user_id', userRes.user.id)
          .eq('moodle_base_url', String(baseUrl))
      }
    } catch {}
    return NextResponse.json({ ok: false, error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
