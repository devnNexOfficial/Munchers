import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RejectOrderSchema = z.object({
  reason: z.string().min(1).max(200)
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = RejectOrderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        rejection_reason: result.data.reason
      })
      .eq('id', params.id)
      .eq('status', 'pending')

    if (updateError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    await supabase.from('activity_logs').insert({
      action: 'order_rejected',
      actor_id: user.id,
      entity: 'order',
      entity_id: params.id,
      new_value: { reason: result.data.reason }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reject order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
