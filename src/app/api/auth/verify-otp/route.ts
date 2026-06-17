import { NextRequest, NextResponse } from 'next/server'
import { OtpVerifyRequestSchema } from '@/types/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function normalizePhone(phone: string) {
  if (phone.startsWith('03')) {
    return '+92' + phone.slice(1)
  }
  return phone
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = OtpVerifyRequestSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 })
    }

    const rawPhone = result.data.phone
    const phone = normalizePhone(rawPhone)
    const token = result.data.token

    const supabase = await createClient()
    
    // Verify OTP
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })

    const adminSupabase = createAdminClient()

    if (authError || !authData.user) {
      await adminSupabase.from('activity_logs').insert({
        action: 'otp_verify_fail',
        entity: 'phone',
        new_value: { phone }
      })
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    await adminSupabase.from('activity_logs').insert({
      action: 'otp_verify_success',
      actor_id: authData.user.id,
      entity: 'phone',
      new_value: { phone }
    })

    // Check if profile exists
    let isNewUser = false
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    if (!profile) {
      // Create new profile using admin client as RLS might block insert if user context isn't fully established
      isNewUser = true
      const { error: profileError } = await adminSupabase.from('profiles').insert({
        id: authData.user.id,
        phone,
        language: 'en'
      })
      if (profileError) {
        console.error('Failed to create profile:', profileError)
      }
    }

    return NextResponse.json({ success: true, isNewUser })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
