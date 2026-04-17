import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/debug/whoami
 * Debug endpoint — muestra qué ve el servidor sobre tu sesión.
 *
 * Visita http://localhost:3002/api/debug/whoami y deberías ver:
 *   { user: { id, email }, hasSession: true, cookieNames: [...] }
 *
 * Si hasSession es false o user es null, el problema está en cookies.
 * Borra las cookies de localhost, vuelve a loguearte y reintenta.
 */
export async function GET() {
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
