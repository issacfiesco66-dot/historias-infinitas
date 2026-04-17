import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware — protege /dashboard y refresca las cookies de sesión de
 * Supabase en cada request.
 *
 * Usa la API nueva (getAll/setAll) requerida por @supabase/ssr >= 0.4.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: llamar getUser() aquí dispara el refresh de cookies en CADA
  // navegación — así la sesión no muere cuando el usuario vuelve al sitio
  // desde otra pestaña o tras un rato inactivo.
  const { data: { user } } = await supabase.auth.getUser();

  // Rutas protegidas
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// Corremos el middleware en TODAS las rutas excepto assets y webhooks.
// Antes sólo se ejecutaba en /dashboard/*, lo que causaba que la sesión
// caducara al volver al sitio desde la landing o el memorial público.
export const config = {
  matcher: [
    /*
     * Excluye:
     *   - _next/static  (archivos estáticos de build)
     *   - _next/image   (optimización de imágenes)
     *   - favicon / icon / robots / sitemap / manifest
     *   - archivos con extensión (png, jpg, svg, etc.)
     *   - /api/stripe/webhook  (necesita raw body sin cookies intermediarias)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|api/stripe/webhook|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)',
  ],
};
