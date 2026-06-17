import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    })

    if (error) {
      console.error('MFA enroll error:', error)
      return NextResponse.json({ error: 'Failed to enroll MFA' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret // if needed for manual entry
    })
  } catch (error) {
    console.error('Enroll MFA error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
