import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/auth/confirm']
  const isPublicRoute = publicRoutes.some(route =>
    route === '/'
      ? request.nextUrl.pathname === '/'
      : request.nextUrl.pathname.startsWith(route)
  )

  // Usuario autenticado intentando acceder a ruta pública → redirigir a su dashboard
  // Excepción: "/" es la landing pública, no se redirige aunque esté autenticado
  const isLandingRoot = request.nextUrl.pathname === '/'
  if (user && isPublicRoute && !isLandingRoot) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    const roleRedirects: Record<string, string> = {
      ADMIN: '/admin',
      ALUMNO: '/alumno',
    }

    const destination = usuario?.rol ? (roleRedirects[usuario.rol] ?? '/login') : '/login'
    const url = request.nextUrl.clone()
    url.pathname = destination
    return NextResponse.redirect(url)
  }

  // Usuario no autenticado intentando acceder a ruta protegida → redirigir a login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Segunda capa de seguridad: verificar rol para rutas de administración
  const isAdminRoute =
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/api/admin')

  if (user && isAdminRoute) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (usuario?.rol !== 'ADMIN') {
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/alumno'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
