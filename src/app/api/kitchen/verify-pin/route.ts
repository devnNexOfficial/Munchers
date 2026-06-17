import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const VerifyPinSchema = z.object({
  screenId: z.string().uuid(),
  pin: z.string().length(6)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = VerifyPinSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { screenId, pin } = result.data
    const adminSupabase = createAdminClient()

    // Using Admin client because the kitchen hasn't authenticated yet
    const { data: screen, error } = await adminSupabase
      .from('kitchen_screens')
      .select('id, pin, is_active, failed_attempts, lockout_until')
      .eq('id', screenId)
      .single()

    if (error || !screen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

    if (!screen.is_active) {
      return NextResponse.json({ error: 'Screen deactivated' }, { status: 403 })
    }

    if (screen.lockout_until && new Date(screen.lockout_until) > new Date()) {
      return NextResponse.json({ error: 'Screen locked. Try again later.' }, { status: 429 })
    }

    const isMatch = await bcrypt.compare(pin, screen.pin)

    if (!isMatch) {
      const attempts = (screen.failed_attempts || 0) + 1
      let lockout_until = null

      if (attempts >= 3) {
        lockout_until = new Date(Date.now() + 30 * 60 * 1000).toISOString()
        await adminSupabase.from('activity_logs').insert({
          action: 'kitchen_pin_lockout',
          entity: 'kitchen_screen',
          entity_id: screenId
        })
      }

      await adminSupabase
        .from('kitchen_screens')
        .update({ failed_attempts: attempts, lockout_until })
        .eq('id', screenId)

      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    // Success
    await adminSupabase
      .from('kitchen_screens')
      .update({ 
        last_seen: new Date().toISOString(),
        failed_attempts: 0,
        lockout_until: null
      })
      .eq('id', screenId)

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret')
    const token = await new SignJWT({ screenId, type: 'kitchen' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // Long-lived
      .sign(secret)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Verify PIN error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
