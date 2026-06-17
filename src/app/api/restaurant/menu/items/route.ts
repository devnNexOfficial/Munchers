import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('menu_items').select('*, category:menu_categories(*)').eq('is_available', true)
  if (error) return NextResponse.json({ error: 'DB Error' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: staff } = await supabase.from('staff_accounts').select('role').eq('user_id', user?.id).single()
  if (!staff || staff.role === 'chef') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  // Generic insert for MVP
  const { error } = await supabase.from('menu_items').insert(body)
  if (error) return NextResponse.json({ error: 'DB Error' }, { status: 500 })
  return NextResponse.json({ success: true })
}
