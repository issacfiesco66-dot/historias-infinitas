import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Valida que el parámetro `next` sea un path relativo interno seguro:
 *  - arranca con "/" pero NO con "//" (que sería protocol-relative)
 *  - NO contiene "\" ni control chars
 *  - NO es un esquema (http:, data:, javascript:, mailto:, etc.)
 *
 * Devuelve el path si es válido, o '/dashboard' como fallback.
 * Mitiga open-redirect: ?next=https://evil.com tras login.
 */
function safeNext(raw: string | null): string {
  const fallback = '/dashboard';
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/')) return fallback;
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) return fallback;
  if (/[\x00-\x1f]/.test(trimmed)) return fallback;
  // Rechaza paths con host inyectado (raro, pero defensivo)
  if (trimmed.includes('://')) return fallback;
  // Largo máximo razonable
  if (trimmed.length > 512) return fallback;
  return trimmed;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
