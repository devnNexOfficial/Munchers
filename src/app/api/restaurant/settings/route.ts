import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: settings, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .single()

    if (error || !settings) {
      return NextResponse.json({ error: 'Database settings not found' }, { status: 404 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Fetch the single row ID to update it specifically
    const { data: currentSettings } = await supabase
      .from('restaurant_settings')
      .select('id')
      .single()

    if (!currentSettings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    const { data: settings, error } = await supabase
      .from('restaurant_settings')
      .update(body)
      .eq('id', currentSettings.id)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Insert activity log for settings changes
    await supabase.from('activity_logs').insert({
      action: 'settings_updated',
      actor_id: user.id,
      entity: 'settings',
      entity_id: currentSettings.id,
      new_value: body
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
