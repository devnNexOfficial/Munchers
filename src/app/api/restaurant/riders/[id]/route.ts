import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const { data: updatedRider, error } = await supabase
      .from('riders')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Update rider error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(updatedRider)
  } catch (error) {
    console.error('PATCH rider error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
