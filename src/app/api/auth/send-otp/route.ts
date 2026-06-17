import { NextRequest, NextResponse } from 'next/server'
import { OtpSendRequestSchema } from '@/types/auth'
import { checkRateLimit } from '@/lib/rateLimiter'
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
    const result = OtpSendRequestSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    const rawPhone = result.data.phone
    const phone = normalizePhone(rawPhone)

    // Rate Limit: 3 attempts per 10 minutes
    const isAllowed = checkRateLimit(phone, 3, 10 * 60 * 1000)
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again in 10 minutes.' }, { status: 429 })
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
      phone
    })

    // Log the attempt via Admin Client (as user is not authenticated yet)
    const adminSupabase = createAdminClient()
    await adminSupabase.from('activity_logs').insert({
      action: 'otp_send',
      entity: 'phone',
      new_value: { phone }
    })

    if (error) {
      // Return a generic error, don't leak Supabase internal errors
      console.error('OTP Send error:', error.message)
      return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
