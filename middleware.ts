// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  function redirect(url: string) {
    const res = NextResponse.redirect(new URL(url, request.url))
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => res.cookies.set(name, value))
    return res
  }

  // Root redirect
  if (request.nextUrl.pathname === "/") {
    return redirect(user ? "/dashboard" : "/login")
  }

  // Protect dashboard and courses — redirect to login if not authenticated
  if (!user && (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/courses")
  )) {
    return redirect("/login")
  }

  if (!user && request.nextUrl.pathname.startsWith("/upgrade")) {
    return redirect("/login")
  }

  // Redirect logged in users away from login/signup
  if (user && (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")
  )) {
    return redirect("/dashboard")
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/signup", "/profile", "/courses", "/search", "/upgrade"],
}