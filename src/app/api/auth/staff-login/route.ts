import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const StaffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = StaffLoginSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
    }

    const { email, password } = result.data
    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    const adminSupabase = createAdminClient()

    if (authError || !authData.user) {
      await adminSupabase.from('activity_logs').insert({
        action: 'staff_login_fail',
        entity: 'email',
        new_value: { email }
      })
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check staff accounts table
    const { data: staff, error: staffError } = await supabase
      .from('staff_accounts')
      .select('role, is_active')
      .eq('user_id', authData.user.id)
      .single()

    if (staffError || !staff || !staff.is_active) {
      // Sign out to prevent invalid session creation
      await supabase.auth.signOut()
      await adminSupabase.from('activity_logs').insert({
        action: 'staff_login_fail',
        actor_id: authData.user.id,
        entity: 'email',
        new_value: { email, reason: 'inactive_or_not_found' }
      })
      return NextResponse.json({ error: 'Account inactive or not found' }, { status: 403 })
    }

    await adminSupabase.from('activity_logs').insert({
      action: 'staff_login_success',
      actor_id: authData.user.id,
      actor_role: staff.role
    })

    return NextResponse.json({ success: true, role: staff.role })
  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
