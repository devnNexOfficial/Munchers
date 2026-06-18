// File: src/app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

const bodySchema = z.object({ phone: z.string().regex(/^\+92[0-9]{10}$/, 'Phone must be in +92XXXXXXXXXX format') })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues.map((i) => i.message).join(', ') }, { status: 400 })
    }

    // In production this is where you'd enqueue/send an SMS OTP via provider.
    // Here we return a successful mock response to drive the UI.
    return NextResponse.json({ success: true, message: 'Token successfully dispatched' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, message: (err as Error).message ?? 'Unknown error' }, { status: 500 })
  }
}
