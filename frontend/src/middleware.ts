import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

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
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/restaurant') && !pathname.startsWith('/restaurant/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/restaurant/login', request.url))
    }
  }

  if (pathname.startsWith('/developer') && !pathname.startsWith('/developer/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/developer/login', request.url))
    }
  }

  if (['/cart', '/checkout', '/profile'].includes(pathname) || pathname.startsWith('/track')) {
    // TODO: use "muncherz-user-session" as placeholder since actual name comes from backend
    const userSession = request.cookies.get('muncherz-user-session')
    if (!userSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/restaurant/:path*',
    '/developer/:path*',
    '/cart',
    '/checkout',
    '/profile',
    '/track/:path*',
  ],
}
