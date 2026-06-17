import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    // Middleware has already verified the kitchen JWT and screenId
    const adminSupabase = createAdminClient()
    
    // We only fetch 'accepted' and 'preparing' orders
    const { data, error } = await adminSupabase
      .from('orders')
      .select('*')
      .in('status', ['accepted', 'preparing'])
      .order('accepted_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch kitchen orders:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Kitchen orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
