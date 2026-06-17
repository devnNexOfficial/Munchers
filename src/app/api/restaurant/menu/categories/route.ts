import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateCategorySchema = z.object({
  name: z.string().min(1),
  name_ur: z.string().optional(),
  slug: z.string().min(1),
  image_url: z.string().optional(),
  sort_order: z.number().int().optional()
})

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('menu_categories').select('*').eq('is_active', true).order('sort_order')
  if (error) return NextResponse.json({ error: 'DB Error' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: staff } = await supabase.from('staff_accounts').select('role').eq('user_id', user?.id).single()
  if (!staff || staff.role === 'chef') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const result = CreateCategorySchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { error } = await supabase.from('menu_categories').insert(result.data)
  if (error) return NextResponse.json({ error: 'DB Error' }, { status: 500 })
  return NextResponse.json({ success: true })
}
