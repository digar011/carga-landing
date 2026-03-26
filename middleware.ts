import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { apiRateLimiter, authRateLimiter } from '@/lib/security/rate-limiter';

/**
 * Extrae la IP del cliente desde los headers del request.
 * Usa X-Forwarded-For en producción (detrás de proxy/CDN), o fallback a 'unknown'.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0];
    return first ? first.trim() : 'unknown';
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const clientIp = getClientIp(request);

  // --- Rate limiting para rutas de autenticación (solo POST, no GET/navegación) ---
  if ((pathname === '/iniciar-sesion' || pathname === '/registro') && request.method === 'POST') {
    const authResult = authRateLimiter.check(`auth:${clientIp}`);

    if (!authResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Demasiados intentos. Esperá unos minutos antes de intentar de nuevo.',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(authResult.resetIn / 1000)),
            'Retry-After': String(Math.ceil(authResult.resetIn / 1000)),
          },
        },
      );
    }
  }

  // --- Rate limiting para rutas de API (excepto webhooks) ---
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks')) {
    const apiResult = apiRateLimiter.check(`api:${clientIp}`);

    if (!apiResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Límite de solicitudes alcanzado. Intentá de nuevo en unos segundos.',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(apiResult.resetIn / 1000)),
            'Retry-After': String(Math.ceil(apiResult.resetIn / 1000)),
          },
        },
      );
    }

    // Ejecutar la sesión de Supabase y luego agregar headers de rate limit
    const response = await updateSession(request);

    response.headers.set('X-RateLimit-Limit', '60');
    response.headers.set('X-RateLimit-Remaining', String(apiResult.remaining));
    response.headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil(apiResult.resetIn / 1000)),
    );

    return response;
  }

  // --- Sesión de Supabase para todas las demás rutas ---
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|landing/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
