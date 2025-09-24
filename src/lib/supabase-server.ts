import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Create a Supabase client for server-side usage that preserves the caller's RLS context
// by forwarding the Authorization bearer token from the incoming request headers.
export function createServerClient(req?: { headers: Headers | Record<string, string> }): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  let authorization: string | undefined
  if (req?.headers) {
    if (typeof (global as any).Headers !== 'undefined' && req.headers instanceof (global as any).Headers) {
      authorization = (req.headers as Headers).get('authorization') ?? undefined
    } else {
      const h = req.headers as Record<string, string>
      authorization = h['authorization'] || h['Authorization']
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authorization ? { Authorization: authorization } : undefined,
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}