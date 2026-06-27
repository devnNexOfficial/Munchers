import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface SupabaseCookie {
  name: string
  value: string
  options: CookieOptions
}

const PUBLIC_AUTH_PATHS = new Set([
  '/login',
  '/restaurant/login',
  '/developer/login',
])

function redirectTo(pathname: string, request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  return NextResponse.redirect(url)
}

function jsonUnauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: SupabaseCookie[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const path = request.nextUrl.pathname

  if (PUBLIC_AUTH_PATHS.has(path)) {
    return response
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (path.startsWith('/restaurant') && path !== '/restaurant/login') {
    if (!user) {
      return redirectTo('/restaurant/login', request)
    }
  }

  const isDeveloperPage = path.startsWith('/developer') && path !== '/developer/login'
  const isDeveloperApi = path.startsWith('/api/developer')

  if (isDeveloperPage || isDeveloperApi) {
    if (!user) {
      return isDeveloperApi ? jsonUnauthorized() : redirectTo('/developer/login', request)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
