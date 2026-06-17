import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, status, payment_status, items, total, order_type, table_number, special_note, complexity, prep_time, accepted_at, created_at')
      .in('status', ['pending', 'accepted', 'preparing', 'ready'])
      // custom ordering: pending first, then accepted, etc
      .order('status', { ascending: false }) // Since 'pending' starts with p... actually we should just order by created_at and let frontend sort by status
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Sort by status manually: pending -> accepted -> preparing -> ready
    const statusOrder: Record<string, number> = {
      'pending': 1,
      'accepted': 2,
      'preparing': 3,
      'ready': 4
    }

    const sortedOrders = orders.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status]
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    return NextResponse.json(sortedOrders)
  } catch (error) {
    console.error('KDS get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
