import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { encrypt } from '@/lib/crypto'
import { getMoodleToken, verifyToken } from '@/lib/moodle'

// POST /api/moodle/connect
// Body: { baseUrl: string, username?: string, password?: string, token?: string, privateToken?: string }
// Obtains (or accepts) a Moodle token, verifies it, and stores encrypted in Supabase
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers })
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userRes.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { baseUrl, username, password, token: tokenInput, privateToken } = body || {}

    if (!baseUrl) return NextResponse.json({ error: 'baseUrl is required' }, { status: 400 })
    if (!tokenInput && !(username && password)) {
      return NextResponse.json({ error: 'Provide either token or username+password' }, { status: 400 })
    }

    // Retrieve or use provided token
    const token = tokenInput ? String(tokenInput) : await getMoodleToken(String(baseUrl), String(username), String(password))

    // Verify token and obtain Moodle user id
    const site = await verifyToken(String(baseUrl), token)

    const enc = encrypt(token)
    const encPrivate = privateToken ? encrypt(String(privateToken)) : null

    // Upsert connection
    const { error: upsertErr } = await supabase
      .from('moodle_connections')
      .upsert(
        {
          user_id: userRes.user.id,
          moodle_base_url: String(baseUrl),
          moodle_user_id: site.userid,
          token_encrypted: enc,
          private_token_encrypted: encPrivate,
          status: 'active',
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,moodle_base_url' }
      )
    if (upsertErr) throw upsertErr

    const payload = {
      baseUrl: String(baseUrl),
      site: {
        userid: site.userid,
        username: site.username,
        fullname: site.fullname,
        firstname: site.firstname,
        lastname: site.lastname,
      },
    }

    return NextResponse.json({ ok: true, connection: payload })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
