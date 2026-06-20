import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const adminSupabase = createAdminClient()
    const { data: order, error } = await adminSupabase
      .from('orders')
      .select('order_number, user_phone, delivery_address, landmark, payment_method, status')
      .eq('id', params.orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Map columns to the expected RiderOrderView shape
    const riderOrderView = {
      order_number: order.order_number,
      customer_phone: order.user_phone,
      delivery_address: order.delivery_address || 'No address provided',
      landmark: order.landmark || null,
      payment_method: order.payment_method || 'cod',
      status: order.status
    }

    return NextResponse.json(riderOrderView)
  } catch (error) {
    console.error('Fetch rider order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
