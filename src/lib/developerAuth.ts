import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Helper: verify the caller is a developer with AAL2 (2FA verified).
 * Returns the user on success, or a NextResponse error to return immediately.
 */
async function requireDeveloper(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // Check AAL level
  const { data: mfa } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (!mfa || mfa.currentLevel !== 'aal2') {
    return { error: NextResponse.json({ error: '2FA verification required' }, { status: 403 }) }
  }

  // Verify developer role via staff_accounts
  const { data: staff } = await supabase
    .from('staff_accounts')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!staff || staff.role !== 'owner') {
    // Only 'owner' maps to developer for now — adjust if you add a 'developer' role
    return { error: NextResponse.json({ error: 'Developer access required' }, { status: 403 }) }
  }

  return { user }
}

export { requireDeveloper }
