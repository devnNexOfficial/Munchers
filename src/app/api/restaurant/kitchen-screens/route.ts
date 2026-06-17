import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'

const CreateScreenSchema = z.object({
  name: z.string().min(1)
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role check happens in middleware, but we can verify again
    const body = await req.json()
    const result = CreateScreenSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    const { name } = result.data

    // Generate PIN
    const plainPin = randomInt(100000, 999999).toString()
    const hashedPin = await bcrypt.hash(plainPin, 12)

    const { data, error } = await supabase
      .from('kitchen_screens')
      .insert({
        name,
        pin: hashedPin
      })
      .select('id, name')
      .single()

    if (error) {
      console.error('Failed to insert screen:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, name: data.name, pin: plainPin })
  } catch (error) {
    console.error('Create screen error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('kitchen_screens')
      .select('id, name, is_active, last_seen')

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get screens error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
