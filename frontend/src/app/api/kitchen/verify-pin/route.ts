import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { createAdminClient } from '@/lib/supabase/admin'

const VerifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/),
})

interface KitchenScreen {
  id: string
  pin?: string | null
  pin_hash?: string | null
  is_active: boolean
  failed_attempts?: number | null
  lockout_until?: string | null
}

export async function POST(request: NextRequest) {
  const parsed = VerifyPinSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid PIN.' }, { status: 400 })
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return NextResponse.json({ message: 'Kitchen auth is not configured.' }, { status: 500 })
  }

  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('kitchen_screens')
    .select('id, pin, pin_hash, is_active, failed_attempts, lockout_until')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  const screen = data as KitchenScreen | null

  if (error || !screen) {
    return NextResponse.json({ message: 'Kitchen screen not found.' }, { status: 404 })
  }

  if (screen.lockout_until && new Date(screen.lockout_until) > new Date()) {
    return NextResponse.json({ message: 'Screen locked. Try again later.', isLocked: true }, { status: 429 })
  }

  const storedPin = screen.pin_hash ?? screen.pin
  const isMatch = storedPin?.startsWith('$2')
    ? await bcrypt.compare(parsed.data.pin, storedPin)
    : storedPin === parsed.data.pin

  if (!isMatch) {
    const attempts = (screen.failed_attempts ?? 0) + 1
    const lockoutUntil = attempts >= 3 ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null

    await adminSupabase
      .from('kitchen_screens')
      .update({ failed_attempts: attempts, lockout_until: lockoutUntil })
      .eq('id', screen.id)

    if (attempts >= 3) {
      await adminSupabase.from('activity_logs').insert({
        action: 'kitchen_pin_lockout',
        entity: 'kitchen_screen',
        entity_id: screen.id,
      })
    }

    return NextResponse.json(
      { message: attempts >= 3 ? 'Screen locked. Contact Manager.' : 'Incorrect PIN.', isLocked: attempts >= 3 },
      { status: attempts >= 3 ? 429 : 401 }
    )
  }

  await adminSupabase
    .from('kitchen_screens')
    .update({
      failed_attempts: 0,
      last_seen: new Date().toISOString(),
      lockout_until: null,
    })
    .eq('id', screen.id)

  const secret = new TextEncoder().encode(jwtSecret)
  const token = await new SignJWT({ screenId: screen.id, type: 'kitchen' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)

  return NextResponse.json({ token })
}
