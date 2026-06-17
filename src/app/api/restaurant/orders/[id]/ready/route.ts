import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'ready',
        ready_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .in('status', ['preparing', 'accepted'])

    if (updateError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark ready error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
