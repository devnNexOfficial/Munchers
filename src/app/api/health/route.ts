import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const adminSupabase = createAdminClient()

    // Ping Supabase with a simple query
    let dbStatus: 'ok' | 'error' = 'ok'
    try {
      const { error } = await adminSupabase.rpc('ping', undefined as any).maybeSingle()
      // If the rpc doesn't exist, fall back to a simple query
      if (error) {
        const { error: selectError } = await adminSupabase
          .from('restaurant_settings')
          .select('id')
          .limit(1)
          .single()
        if (selectError) dbStatus = 'error'
      }
    } catch {
      dbStatus = 'error'
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: dbStatus
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'error'
    })
  }
}
