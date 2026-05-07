import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
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

const VALID_OTP_TYPES: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const rawType = searchParams.get('type');
  const type = VALID_OTP_TYPES.includes(rawType as EmailOtpType) ? (rawType as EmailOtpType) : null;
  const next = safeNext(searchParams.get('next'));

  const supabase = createClient();

  // Flujo 1 — PKCE (link generado desde nuestro frontend: signup,
  // resetPasswordForEmail iniciado por el usuario, magic-link, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Flujo 2 — OTP / token_hash (link generado por Supabase Dashboard
  // o por templates de email que usan {{ .TokenHash }}). Sin este branch,
  // los emails de "Send password recovery" del Dashboard no logran sesión.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
    // Para recovery siempre forzamos al usuario a definir nueva contraseña.
    const target = type === 'recovery' ? '/reset-password' : next;
    return NextResponse.redirect(`${origin}${target}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
