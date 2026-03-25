import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = [
    '/',
    '/iniciar-sesion',
    '/registro',
    '/api/webhooks',
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute && !pathname.startsWith('/landing')) {
    const url = request.nextUrl.clone();
    url.pathname = '/iniciar-sesion';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated, get user role for route protection
  if (user && !isPublicRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    // Role-based route protection
    // Transportista routes
    if (pathname.startsWith('/t-')) {
      if (role !== 'transportista' && role !== 'admin') {
        return NextResponse.redirect(new URL('/c-panel', request.url));
      }
    }

    // Cargador routes
    if (pathname.startsWith('/c-')) {
      if (role !== 'cargador' && role !== 'admin') {
        return NextResponse.redirect(new URL('/t-panel', request.url));
      }
    }

    // Admin routes
    if (pathname.startsWith('/a-')) {
      if (role !== 'admin') {
        const redirectPath = role === 'transportista' ? '/t-panel' : '/c-panel';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  // Redirect authenticated users away from auth pages to their role dashboard
  if (user && (pathname === '/iniciar-sesion' || pathname === '/registro')) {
    return NextResponse.redirect(new URL('/t-panel', request.url));
  }

  return response;
}
