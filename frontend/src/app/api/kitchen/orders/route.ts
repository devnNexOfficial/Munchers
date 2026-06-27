import { jwtVerify } from 'jose/jwt/verify'
import { NextResponse, type NextRequest } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
  const jwtSecret = process.env.JWT_SECRET

  if (!token || !jwtSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret)
    await jwtVerify(token, secret)

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('orders')
      .select('*')
      .in('status', ['accepted', 'preparing', 'ready'])
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Unable to load kitchen orders' }, { status: 500 })
    }

    return NextResponse.json({ orders: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
