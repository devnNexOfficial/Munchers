import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get('is_active')
    const isAvailable = searchParams.get('is_available')

    let query = supabase.from('riders').select('*')

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    if (isAvailable !== null) {
      query = query.eq('is_available', isAvailable === 'true')
    }

    const { data: riders, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch riders error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(riders)
  } catch (error) {
    console.error('GET riders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 })
    }

    const { data: newRider, error } = await supabase
      .from('riders')
      .insert({
        name,
        phone,
        is_active: true,
        is_available: true
      })
      .select()
      .single()

    if (error) {
      console.error('Insert rider error:', error)
      return NextResponse.json({ error: 'Database error or duplicate phone' }, { status: 500 })
    }

    return NextResponse.json(newRider)
  } catch (error) {
    console.error('POST rider error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
