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

  // Onboarding: redirigir a alumnos sin plan SOLO cuando intentan ir al dashboard raíz.
  // El alumno puede navegar libremente entre secciones (pagos, perfil, calificaciones, etc.)
  // El acceso al CONTENIDO de materias se bloquea a nivel de API, no de middleware.
  const pathname = request.nextUrl.pathname
  const isAlumnoPageRoute =
    pathname.startsWith('/alumno') &&
    !pathname.startsWith('/api/')

  if (user && isAlumnoPageRoute) {
    const { data: alumno } = await supabase
      .from('alumnos')
      .select('plan_estudio_id, inscripcion_pagada')
      .eq('usuario_id', user.id)
      .single()

    if (alumno) {
      const url = request.nextUrl.clone()

      if (!alumno.plan_estudio_id) {
        // Sin plan → redirigir solo desde el dashboard raíz a elegir-plan
        if (pathname === '/alumno') {
          url.pathname = '/alumno/elegir-plan'
          return NextResponse.redirect(url)
        }
      } else if (pathname === '/alumno/elegir-plan') {
        // Ya tiene plan → no puede volver a elegir-plan
        url.pathname = '/alumno'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
