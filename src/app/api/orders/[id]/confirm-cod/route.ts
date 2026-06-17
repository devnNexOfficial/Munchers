import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Rider auth check would happen here
    // But rider auth is a gap that hasn't been built yet (Gap 2 in Prompt 14).
    // For now, we will allow this since we only have admin/staff session checks 
    // or we'll bypass auth for MVP testing.
    
    const adminSupabase = createAdminClient()

    const { data: order, error } = await adminSupabase
      .from('orders')
      .select('id, payment_method, status')
      .eq('id', params.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_method !== 'cod') {
      return NextResponse.json({ error: 'Not a COD order' }, { status: 400 })
    }

    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Confirm COD error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
