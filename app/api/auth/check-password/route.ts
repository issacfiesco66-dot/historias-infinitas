import { NextResponse } from 'next/server';
import { isPasswordPwned } from '@/lib/password/pwned';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/check-password
 *
 * Valida fuerza + consulta HIBP (k-anonymity). Se usa desde el formulario
 * de registro ANTES de llamar a supabase.auth.signUp().
 *
 * Request:  { password: string }
 * Response: { ok, strong, pwned, count?, hint? }
 *
 * - Rate-limited en memoria por IP (20 req/min) para evitar usarlo como
 *   oráculo de passwords.
 * - El password nunca sale del servidor en texto claro — HIBP solo recibe
 *   los 5 primeros hex chars del SHA-1.
 */

/* ---- rate limit ---- */
const rlBucket = new Map<string, { count: number; resetAt: number }>();
const RL_WINDOW_MS = 60_000;
const RL_MAX = 20;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rlBucket.get(key);
  if (!entry || entry.resetAt < now) {
    rlBucket.set(key, { count: 1, resetAt: now + RL_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= RL_MAX;
}

function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    h.get('cf-connecting-ip') ??
    'unknown'
  );
}

/** Misma regla que /api/partners/activate-now */
function checkStrength(p: string): { strong: boolean; hint?: string } {
  if (typeof p !== 'string' || p.length < 12 || p.length > 128) {
    return { strong: false, hint: 'Usa 12+ caracteres (máx 128).' };
  }
  if (!/[a-z]/.test(p)) return { strong: false, hint: 'Incluye al menos una minúscula.' };
  if (!/[A-Z]/.test(p)) return { strong: false, hint: 'Incluye al menos una mayúscula.' };
  if (!/\d/.test(p))    return { strong: false, hint: 'Incluye al menos un número.' };
  return { strong: true };
}

export async function POST(req: Request) {
  try {
    if (!rateLimit(`check-password:${clientIp(req)}`)) {
      return NextResponse.json(
        { ok: false, error: 'rate_limited' },
        { status: 429 },
      );
    }

    const { password } = (await req.json()) as { password?: string };
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'password_requerido' },
        { status: 400 },
      );
    }

    const strength = checkStrength(password);
    if (!strength.strong) {
      return NextResponse.json({
        ok: false,
        strong: false,
        pwned: false,
        hint: strength.hint,
      });
    }

    const pwn = await isPasswordPwned(password);

    if (pwn.pwned) {
      return NextResponse.json({
        ok: false,
        strong: true,
        pwned: true,
        count: pwn.count,
        hint: `Este password apareció en ${pwn.count.toLocaleString('es-MX')} brechas de datos públicas. Elige otro.`,
      });
    }

    return NextResponse.json({
      ok: true,
      strong: true,
      pwned: false,
      unavailable: pwn.unavailable ?? false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'error_interno' },
      { status: 500 },
    );
  }
}
