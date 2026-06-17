import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: staff } = await supabase.from('staff_accounts').select('role').eq('user_id', user?.id).single()
  if (!staff || staff.role === 'chef') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { error } = await supabase.from('ingredients').update(body).eq('id', params.id)
  if (error) return NextResponse.json({ error: 'DB Error' }, { status: 500 })
  return NextResponse.json({ success: true })
}
