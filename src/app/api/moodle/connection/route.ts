import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET /api/moodle/connection
// Returns the current user's active Moodle connection (if any)
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient({ headers: req.headers })
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) return new Response(JSON.stringify({ error: 'Auth error: ' + userErr.message }), { status: 401 })
    const user = userRes?.user
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const { data, error } = await supabase
      .from('moodle_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('last_verified_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

    return new Response(JSON.stringify({ ok: true, connection: data || null }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}
