import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { decrypt, encrypt } from '@/lib/crypto'
import { verifyToken } from '@/lib/moodle'

// POST /api/moodle/verify
// Body: { baseUrl: string }
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers })
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userRes.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { baseUrl } = body || {}
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
    const site = await verifyToken(String(baseUrl), token)

    const { error: updErr } = await supabase
      .from('moodle_connections')
      .update({
        status: 'active',
        moodle_user_id: site.userid,
        last_verified_at: new Date().toISOString(),
        token_encrypted: encrypt(token), // re-encrypt rotates IV/tag
      })
      .eq('id', conn.id)
    if (updErr) throw updErr

    return NextResponse.json({ ok: true, site: { userid: site.userid, username: site.username, fullname: site.fullname } })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
