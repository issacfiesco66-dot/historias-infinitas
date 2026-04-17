import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/debug/whoami
 * Debug endpoint — SOLO disponible en development.
 *
 * En producción devuelve 404 para no filtrar información de la sesión.
 * Útil en local para diagnosticar problemas de cookies:
 *   { user: { id, email }, hasSession: true, cookieNames: [...] }
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }

  const supabase = createClient();

  const [{ data: userData, error: userErr }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  const cookieNames = cookies().getAll().map((c) => c.name);

  return NextResponse.json({
    user: userData.user
      ? { id: userData.user.id, email: userData.user.email }
      : null,
    hasSession: !!sessionData.session,
    userError: userErr?.message ?? null,
    cookieNames,
    cookieCount: cookieNames.length,
  });
}
