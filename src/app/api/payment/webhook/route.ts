import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const url = new URL(req.url)
    const hmacHeader = url.searchParams.get('hmac')

    const adminSupabase = createAdminClient()

    if (!hmacHeader) {
      await adminSupabase.from('activity_logs').insert({
        action: 'payment_webhook_no_hmac',
        entity: 'webhook'
      })
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const payload = JSON.parse(rawBody)

    // Paymob HMAC construction based on docs
    const concatenatedString = [
      payload.obj.amount_cents,
      payload.obj.created_at,
      payload.obj.currency,
      payload.obj.error_occured,
      payload.obj.has_parent_transaction,
      payload.obj.id,
      payload.obj.integration_id,
      payload.obj.is_3d_secure,
      payload.obj.is_auth,
      payload.obj.is_capture,
      payload.obj.is_refunded,
      payload.obj.is_standalone_payment,
      payload.obj.is_voided,
      payload.obj.order.id,
      payload.obj.owner,
      payload.obj.pending,
      payload.obj.source_data.pan,
      payload.obj.source_data.sub_type,
      payload.obj.source_data.type,
      payload.obj.success
    ].join('')

    const secret = process.env.PAYMOB_HMAC_SECRET || ''
    const hash = crypto.createHmac('sha512', secret).update(concatenatedString).digest('hex')

    if (hash !== hmacHeader) {
      await adminSupabase.from('activity_logs').insert({
        action: 'payment_webhook_hmac_mismatch',
        entity: 'webhook'
      })
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const paymobOrderId = String(payload.obj.order.id)
    const isSuccess = payload.obj.success

    const { data: order } = await adminSupabase
      .from('orders')
      .select('id, payment_status')
      .eq('payment_intent_id', paymobOrderId)
      .single()

    if (!order) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (isSuccess) {
      await adminSupabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'pending' })
        .eq('id', order.id)
    } else {
      await adminSupabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order.id)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    // Always return 200 to PayMob
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
