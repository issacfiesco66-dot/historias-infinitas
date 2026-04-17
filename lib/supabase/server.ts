import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 *
 * API de cookies actualizada a la forma nueva (getAll / setAll) requerida
 * por @supabase/ssr >= 0.4. Esta API garantiza que el SDK pueda encontrar
 * correctamente todas las cookies de sesión (el nombre del cookie incluye
 * el project-ref y puede cambiar entre versiones).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Los Server Components no pueden escribir cookies; se ignora.
            // El middleware se encargará de refrescarlas en el siguiente request.
          }
        },
      },
    },
  );
}
