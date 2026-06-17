import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const AssignRiderSchema = z.object({
  riderId: z.string().uuid()
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = AssignRiderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Assuming we have a riders table or using profiles. Rider auth is Gap 2.
    // For now, we will mock the rider table update or just accept the request.
    
    // Check if rider is active and available
    // NOTE: This table does not exist in schema 001-002, so this is a placeholder or uses profiles
    /*
    const { data: rider } = await adminSupabase.from('riders').select('is_active, is_available').eq('id', result.data.riderId).single()
    if (!rider || !rider.is_active || !rider.is_available) {
      return NextResponse.json({ error: 'Rider unavailable' }, { status: 400 })
    }
    */

    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        status: 'dispatched',
        rider_id: result.data.riderId
      })
      .eq('id', params.id)
      .eq('status', 'ready')
      .eq('order_type', 'delivery')

    if (updateError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Update rider to unavailable
    // await adminSupabase.from('riders').update({ is_available: false }).eq('id', result.data.riderId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Assign rider error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
