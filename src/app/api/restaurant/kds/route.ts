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
      .select('id, order_number, status, payment_status, total, subtotal, delivery_charge, gst_amount, gst_percent, discount_amount, order_type, table_number, special_note, complexity, prep_time, accepted_at, created_at, payment_method')
      .in('status', ['pending', 'accepted', 'preparing', 'ready'])
      .order('status', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Fetch actual order items for KOT printing and detailed view
    const orderIds = orders.map(o => o.id)
    let orderItemsMap: Record<string, any[]> = {}
    
    if (orderIds.length > 0) {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds)
        
      if (!itemsError && orderItems) {
        orderItems.forEach(item => {
          if (!orderItemsMap[item.order_id]) {
            orderItemsMap[item.order_id] = []
          }
          orderItemsMap[item.order_id].push(item)
        })
      }
    }

    // Map order items and sort manually: pending -> accepted -> preparing -> ready
    const statusOrder: Record<string, number> = {
      'pending': 1,
      'accepted': 2,
      'preparing': 3,
      'ready': 4
    }

    const decoratedOrders = orders.map(o => ({
      ...o,
      items: orderItemsMap[o.id] || []
    }))

    const sortedOrders = decoratedOrders.sort((a, b) => {
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
