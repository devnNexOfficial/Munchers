import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rateLimiter'
import { z } from 'zod'

const InitiatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  paymentMethod: z.enum(['jazzcash', 'easypaisa', 'card'])
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAllowed = checkRateLimit(`payment_${user.id}`, 5, 60 * 60 * 1000)
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many payment attempts' }, { status: 429 })
    }

    const body = await req.json()
    const result = InitiatePaymentSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { orderId, paymentMethod } = result.data
    const adminSupabase = createAdminClient()

    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select('id, user_id, status, total')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order is not in pending state' }, { status: 400 })
    }

    // PayMob Integration logic
    // For MVP, we mock the PayMob API calls since actual integration requires real API keys
    // Step 1: Authentication request -> get auth_token
    // Step 2: Order registration -> get paymob_order_id
    // Step 3: Payment key request -> get payment_key
    
    // MOCK RESPONSE:
    const paymob_order_id = `pm_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const payment_key = `pk_${Date.now()}_mock_key`
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${payment_key}`

    // Store idempotency key
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({ payment_intent_id: paymob_order_id })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to save payment intent:', updateError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      paymentKey: payment_key,
      iframeUrl
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
