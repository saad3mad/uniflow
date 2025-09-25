import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { encrypt } from '@/lib/crypto'

// POST /api/moodle/save-connection
// Body: { baseUrl: string, token: string, id?: string }
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers })
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) return new Response(JSON.stringify({ error: 'Auth error: ' + userErr.message }), { status: 401 })
    const user = userRes?.user
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const body = await req.json().catch(() => null)
    const baseUrl: string | undefined = body?.baseUrl
    const token: string | undefined = body?.token
    const id: string | undefined = body?.id
    if (!baseUrl || !token) {
      return new Response(JSON.stringify({ error: 'baseUrl and token are required' }), { status: 400 })
    }

    // Encrypt token server-side
    const token_encrypted = encrypt(token)

    const payload: any = {
      user_id: user.id,
      moodle_base_url: baseUrl,
      token_encrypted,
      status: 'active',
      last_verified_at: new Date().toISOString(),
    }
    if (id) payload.id = id

    const { data, error } = await supabase
      .from('moodle_connections')
      .upsert(payload)
      .select('id')
      .maybeSingle()

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

    return new Response(JSON.stringify({ ok: true, id: data?.id ?? null }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}
