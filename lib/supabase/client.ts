import { createClient } from '@supabase/supabase-js'

// Client-side client (respects RLS policies)
// Lazy initialization to avoid errors during build time
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Only create client when actually used (not during build)
let _client: ReturnType<typeof getSupabaseClient> | null = null
export const supabaseClient = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(target, prop) {
    if (typeof window === 'undefined') {
      // Server-side: return a no-op or throw
      throw new Error('supabaseClient should only be used on the client side. Use createSupabaseServerClient() on the server.')
    }
    if (!_client) {
      _client = getSupabaseClient()
    }
    return (_client as any)[prop]
  },
})

