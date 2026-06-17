import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('ingredients').select('id, name, stock_count, low_stock_alert, is_available')
  if (error) return NextResponse.json({ error: 'DB Error' }, { status: 500 })
  
  const inventory = data.map(i => ({
    ...i,
    is_low_stock: i.stock_count <= (i.low_stock_alert || 0)
  }))
  return NextResponse.json(inventory)
}
