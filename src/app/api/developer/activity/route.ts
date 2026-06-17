import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireDeveloper } from '@/lib/developerAuth'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await requireDeveloper(supabase)
    if ('error' in auth) return auth.error

    const adminSupabase = createAdminClient()
    const url = new URL(req.url)
    const actorRole = url.searchParams.get('actor_role')
    const action = url.searchParams.get('action')
    const entity = url.searchParams.get('entity')

    let query = adminSupabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (actorRole) {
      query = query.eq('actor_role', actorRole)
    }
    if (action) {
      query = query.eq('action', action)
    }
    if (entity) {
      query = query.eq('entity', entity)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Developer activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
