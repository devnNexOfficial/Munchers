import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireDeveloper } from '@/lib/developerAuth'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await requireDeveloper(supabase)
    if ('error' in auth) return auth.error

    const adminSupabase = createAdminClient()
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    // Active order count by status
    const { data: ordersByStatus } = await adminSupabase
      .from('orders')
      .select('status')
      .in('status', ['pending', 'accepted', 'preparing', 'ready', 'dispatched'])

    const statusCounts: Record<string, number> = {}
    ordersByStatus?.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
    })

    // Today's order count and revenue
    const { data: todayOrders } = await adminSupabase
      .from('orders')
      .select('total')
      .gte('created_at', todayStart)

    const todayCount = todayOrders?.length || 0
    const todayRevenue = todayOrders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0

    // Payment success rate (last 24h)
    const { data: recentPayments } = await adminSupabase
      .from('orders')
      .select('payment_status')
      .gte('created_at', twentyFourHoursAgo)
      .in('payment_status', ['paid', 'failed'])

    const paid = recentPayments?.filter(p => p.payment_status === 'paid').length || 0
    const failed = recentPayments?.filter(p => p.payment_status === 'failed').length || 0
    const paymentSuccessRate = paid + failed > 0 ? ((paid / (paid + failed)) * 100).toFixed(1) : 'N/A'

    // DB connection status
    let dbStatus: 'ok' | 'error' = 'ok'
    try {
      const { error } = await adminSupabase
        .from('restaurant_settings')
        .select('id')
        .limit(1)
        .single()
      if (error) dbStatus = 'error'
    } catch {
      dbStatus = 'error'
    }

    return NextResponse.json({
      activeOrders: statusCounts,
      today: {
        orderCount: todayCount,
        revenue: todayRevenue
      },
      paymentSuccessRate: `${paymentSuccessRate}%`,
      db: dbStatus
    })
  } catch (error) {
    console.error('Developer stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
