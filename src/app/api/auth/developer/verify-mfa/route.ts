import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VerifyMfaSchema = z.object({
  factorId: z.string(),
  code: z.string().length(6)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = VerifyMfaSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { factorId, code } = result.data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    })

    const adminSupabase = createAdminClient()

    if (error) {
      await adminSupabase.from('activity_logs').insert({
        action: 'mfa_verify_fail',
        actor_id: user.id
      })
      return NextResponse.json({ error: 'Invalid MFA code' }, { status: 401 })
    }

    await adminSupabase.from('activity_logs').insert({
      action: 'mfa_verify_success',
      actor_id: user.id
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify MFA error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
