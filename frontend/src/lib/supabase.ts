import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (_supabaseInstance) {
    return _supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a no-op proxy during build time to prevent crashes
    // This will never be called in production — only during static analysis
    console.warn('[Supabase] Missing environment variables — client not initialized.')
    return new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        if (prop === 'from') {
          return () =>
            new Proxy(
              {},
              {
                get() {
                  return () => Promise.resolve({ data: null, error: null })
                },
              },
            )
        }
        return () => Promise.resolve({ data: null, error: null })
      },
    })
  }

  _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return _supabaseInstance
}

/**
 * Lazily-initialized Supabase browser client.
 * Safe to import at module scope — actual client creation is deferred
 * until first property access, preventing build-time env var crashes.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
