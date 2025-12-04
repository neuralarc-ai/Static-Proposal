import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Server-side client with service role key (bypasses RLS for admin operations)
// Lazy initialization to avoid errors during build time
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Legacy export - lazy initialization
let _supabase: ReturnType<typeof createSupabaseServerClient> | null = null
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseServerClient>, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createSupabaseServerClient()
    }
    return (_supabase as any)[prop]
  },
})

