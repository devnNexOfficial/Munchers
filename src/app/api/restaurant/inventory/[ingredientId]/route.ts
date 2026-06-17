import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest, { params }: { params: { ingredientId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: staff } = await supabase.from('staff_accounts').select('role').eq('user_id', user?.id).single()
  if (!staff || staff.role === 'chef') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const adminSupabase = createAdminClient()
  
  const { error } = await supabase.from('ingredients').update({
    stock_count: body.stock_count,
    is_available: body.is_available
  }).eq('id', params.ingredientId)

  if (error) return NextResponse.json({ error: 'DB Error' }, { status: 500 })

  await adminSupabase.from('activity_logs').insert({
    action: 'inventory_update',
    actor_id: user?.id,
    entity: 'ingredient',
    entity_id: params.ingredientId,
    new_value: body
  })

  return NextResponse.json({ success: true })
}
