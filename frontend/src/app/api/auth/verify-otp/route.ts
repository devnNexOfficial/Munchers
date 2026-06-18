// File: src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

const bodySchema = z.object({
  phone: z.string().regex(/^\+92[0-9]{10}$/, 'Phone must be in +92XXXXXXXXXX format').optional(),
  email: z.string().email().optional(),
  otp: z.string().regex(/^[0-9]{6}$/, 'OTP must be a 6 digit numeric string'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 })
    }

    // Mock verification: accept any 6-digit code for demo/testing.
    // Respond with a session object compatible with client expectations.
    const session = {
      access_token: 'mock_jwt_string',
      user: {
        id: 'mock_uuid',
        phone: parsed.data.phone ?? parsed.data.email ?? '+923001234567',
        user_metadata: { role: 'customer' },
      },
    }

    return NextResponse.json({ session }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}
