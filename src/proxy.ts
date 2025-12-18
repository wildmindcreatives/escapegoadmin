import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Skip proxy for POST requests (Server Actions avec uploads)
  if (request.method === 'POST') {
    return NextResponse.next()
  }

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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Rafraîchir la session si nécessaire
  // C'est important pour que les Server Actions puissent accéder à la session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si pas d'utilisateur et sur une route protégée, rediriger vers la page de login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

// Export par défaut pour Next.js
export default proxy

export const config = {
  matcher: ['/dashboard/:path*']
}
