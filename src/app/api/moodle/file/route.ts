import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET /api/moodle/file?module_id=123[&index=0]
// Streams a Moodle module file to the client using the user's encrypted token, server-side only.
export async function GET(req: NextRequest) {
  const supabase = createServerClient({ headers: req.headers })
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  
  // Properly validate session before proceeding
  if (userErr) {
    return new Response(JSON.stringify({ error: 'Auth error: ' + userErr.message }), { status: 401 })
  }
  if (!userRes || !userRes.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const moduleId = Number(searchParams.get('module_id'))
  const index = Number(searchParams.get('index') ?? '0')
  if (!moduleId || Number.isNaN(moduleId)) {
    return new Response(JSON.stringify({ error: 'module_id required' }), { status: 400 })
  }

  // Fetch module row and connection
  const { data: rows, error } = await supabase
    .from('moodle_course_contents')
    .select('*, connection_id, course_id, raw')
    .eq('user_id', userRes.user.id)
    .eq('module_id', moduleId)
    .limit(1)
  
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  if (!rows || rows.length === 0) return new Response(JSON.stringify({ error: 'Module not found' }), { status: 404 })
  const row = rows[0]

  // Get connection for base URL and token
  const { data: conn, error: connErr } = await supabase
    .from('moodle_connections')
    .select('*')
    .eq('id', row.connection_id)
    .maybeSingle()
    
  if (connErr) return new Response(JSON.stringify({ error: connErr.message }), { status: 500 })
  if (!conn) return new Response(JSON.stringify({ error: 'Connection not found' }), { status: 404 })

  // Decrypt token server-side
  const { decrypt } = await import('@/lib/crypto")
  const token = decrypt(conn.token_encrypted)

  // Decide which URL to fetch
  // Prefer raw.contents[index].fileurl if available (Moodle returns tokenizable URLs)
  let targetUrl: string | null = null
  try {
    const raw = row.raw as any
    if (raw?.contents?.length) {
      const item = raw.contents[index] || raw.contents[0]
      targetUrl = item.fileurl || item.url || row.url || null
    } else {
      targetUrl = (raw?.url as string) || (row as any).url || null
    }
  } catch {
    targetUrl = (row as any).url || null
  }
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'No file URL available for this module' }), { status: 400 })
  }

  // Ensure token is appended if not present
  const urlObj = new URL(targetUrl)
  if (!urlObj.searchParams.get('token')) {
    urlObj.searchParams.set('token', token)
  }

  // Stream the response back to the client
  const upstream = await fetch(urlObj.toString(), { method: 'GET' })
  if (!upstream.ok) {
    const text = await upstream.text()
    return new Response(JSON.stringify({ error: `Upstream error ${upstream.status}`, body: text.slice(0, 500) }), { status: 502 })
  }

  // Proxy headers: content-type, content-disposition, content-length
  const headers = new Headers()
  const ct = upstream.headers.get('content-type')
  const cd = upstream.headers.get('content-disposition')
  const cl = upstream.headers.get('content-length')
  if (ct) headers.set('content-type', ct)
  if (cd) headers.set('content-disposition', cd)
  if (cl) headers.set('content-length', cl)

  return new Response(upstream.body, { status: 200, headers })
