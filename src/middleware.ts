import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Kitchen routes: JWT based (pages AND API, except verify-pin)
  const isKitchenRoute = (path.startsWith('/kitchen') || path.startsWith('/api/kitchen')) 
    && path !== '/kitchen' 
    && !path.startsWith('/api/kitchen/verify-pin')
  if (isKitchenRoute) {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    
    if (!token) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/kitchen', request.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret')
      const { payload } = await jwtVerify(token, secret)
      
      // Call DB to verify screen is still active (kitchen screen revocation)
      const { data: screen } = await supabase
        .from('kitchen_screens')
        .select('is_active')
        .eq('id', payload.screenId)
        .single()
        
      if (!screen || !screen.is_active) {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Screen deactivated' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/kitchen', request.url))
      }
    } catch (e) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/kitchen', request.url))
    }
    return supabaseResponse
  }

  // Developer API routes — require AAL2
  if (path.startsWith('/api/developer')) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: staff } = await supabase
      .from('staff_accounts')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!staff || (staff.role !== 'owner' && staff.role !== 'developer')) {
      return NextResponse.json({ error: 'Developer access required' }, { status: 403 })
    }

    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (mfaData?.currentLevel !== 'aal2') {
      return NextResponse.json({ error: '2FA verification required' }, { status: 403 })
    }
  }

  // Restaurant routes (pages only — API routes have internal auth checks)
  if (path.startsWith('/restaurant') && !path.startsWith('/restaurant/login') && !path.startsWith('/api/restaurant')) {
    if (!user) {
      return NextResponse.redirect(new URL('/restaurant/login', request.url))
    }
    const { data: staff } = await supabase
      .from('staff_accounts')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!staff) {
      return NextResponse.redirect(new URL('/restaurant/login', request.url))
    }
  }

  // Developer routes
  if (path.startsWith('/developer') && !path.startsWith('/developer/login') && !path.startsWith('/developer/verify-2fa') && !path.startsWith('/api/auth/developer')) {
    if (!user) {
      return NextResponse.redirect(new URL('/developer/login', request.url))
    }
    const { data: staff } = await supabase
      .from('staff_accounts')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!staff || (staff.role !== 'owner' && staff.role !== 'developer')) {
      return NextResponse.redirect(new URL('/developer/login', request.url))
    }

    // Check 2FA (MFA)
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (mfaData?.currentLevel !== 'aal2') {
      return NextResponse.redirect(new URL('/developer/verify-2fa', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
