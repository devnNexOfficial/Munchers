import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireDeveloper } from '@/lib/developerAuth'

const SECURITY_ACTIONS = [
  'price_mismatch_attempt',
  'kitchen_pin_lockout',
  'role_access_denied',
  'otp_verify_fail',
  'staff_login_fail',
  'payment_webhook_hmac_mismatch'
]

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await requireDeveloper(supabase)
    if ('error' in auth) return auth.error

    const adminSupabase = createAdminClient()
    const url = new URL(req.url)
    const severity = url.searchParams.get('severity') // 'error' | 'warning'
    const route = url.searchParams.get('route')
    const since = url.searchParams.get('since')

    let query = adminSupabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    // Filter by error-like actions or security events
    const errorActions = SECURITY_ACTIONS.slice()
    if (severity === 'error') {
      // Only critical security events
      query = query.in('action', ['price_mismatch_attempt', 'kitchen_pin_lockout', 'payment_webhook_hmac_mismatch'])
    } else if (severity === 'warning') {
      query = query.in('action', ['otp_verify_fail', 'staff_login_fail', 'role_access_denied'])
    } else {
      // Return all security-related actions
      query = query.in('action', errorActions)
    }

    if (since) {
      query = query.gte('created_at', since)
    }

    // Route filter — match entity field
    if (route) {
      query = query.eq('entity', route)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Developer errors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
