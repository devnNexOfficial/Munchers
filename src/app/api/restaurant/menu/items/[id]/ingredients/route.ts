import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: staff } = await supabase.from('staff_accounts').select('role').eq('user_id', user?.id).single()
  if (!staff || staff.role === 'chef') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  
  // Copy defaults from ingredients table
  const { data: ingredient } = await supabase.from('ingredients').select('is_core, is_required, max_limit').eq('id', body.ingredientId).single()
  
  const insertPayload = {
    menu_item_id: params.id,
    ingredient_id: body.ingredientId,
    is_core: ingredient?.is_core ?? true,
    is_required: ingredient?.is_required ?? false,
    max_limit: ingredient?.max_limit ?? 1,
    sort_order: body.sort_order ?? 0
  }

  const { error } = await supabase.from('menu_item_ingredients').insert(insertPayload)
  if (error) return NextResponse.json({ error: 'DB Error' }, { status: 500 })
  return NextResponse.json({ success: true })
}
