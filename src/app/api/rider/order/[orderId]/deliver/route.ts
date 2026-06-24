import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

/**
 * ⚠️ SECURITY NOTICE & CAPABILITY URL EXPLANATION:
 * This endpoint is part of the unauthenticated Rider Order Portal.
 * The 'riders' table lacks auth credentials, password columns, or session token tracking.
 * Access is controlled solely via capability-URLs using the unguessable order UUID ([orderId]).
 * This allows riders to view and mark orders delivered without a traditional staff login session.
 * 
 * Potential Risk: If an order ID (UUID) is leaked, intercepted, or brute-forced (unlikely for UUIDv4),
 * an unauthorized actor can mark the order as delivered. This gap is documented and accepted for MVP stage.
 */

const DeliverOrderSchema = z.object({
  cod_confirmed: z.boolean().optional()
})

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const body = await req.json()
    const result = DeliverOrderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 1. Fetch current order status, payment method, and assigned rider
    const { data: order, error: fetchError } = await adminSupabase
      .from('orders')
      .select('id, status, payment_method, rider_id')
      .eq('id', params.orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Safeguard: If already delivered, return success early to avoid double-processing
    if (order.status === 'delivered') {
      return NextResponse.json({ success: true, message: 'Already delivered' })
    }

    // 2. Validate COD confirmation if payment method is cash on delivery
    const isCOD = order.payment_method === 'cod'
    if (isCOD && result.data.cod_confirmed !== true) {
      return NextResponse.json({ error: 'COD payment confirmation is required to deliver this order' }, { status: 400 })
    }

    // 3. Perform order update
    const orderUpdates: Record<string, any> = {
      status: 'delivered',
      delivered_at: new Date().toISOString()
    }

    if (isCOD) {
      orderUpdates.payment_status = 'paid'
    }

    const { error: orderUpdateError } = await adminSupabase
      .from('orders')
      .update(orderUpdates)
      .eq('id', params.orderId)

    if (orderUpdateError) {
      console.error('Failed to update order status:', orderUpdateError)
      return NextResponse.json({ error: 'Database error updating order' }, { status: 500 })
    }

    // 4. Update assigned rider to available again
    if (order.rider_id) {
      const { error: riderUpdateError } = await adminSupabase
        .from('riders')
        .update({ is_available: true })
        .eq('id', order.rider_id)

      if (riderUpdateError) {
        console.error('Failed to update rider availability:', riderUpdateError)
        // We do not fail the request if just the rider status update fails, 
        // but we log it for tracking.
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Rider deliver order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
