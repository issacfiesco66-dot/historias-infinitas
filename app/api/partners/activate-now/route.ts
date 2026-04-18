import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPartnerPlan, type PartnerPlanId } from '@/lib/partner-plans';
import { isPasswordPwned } from '@/lib/password/pwned';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/partners/activate-now
 *
 * Convierte una compra de partner recién hecha en una cuenta lista para entrar,
 * sin depender del correo de bienvenida.
 *
 * SEGURIDAD:
 *  - NUNCA actualizamos la contraseña de un usuario existente por este endpoint
 *    (eso sería un account-takeover si el atacante conoce un session_id ajeno).
 *    Si el email ya tiene cuenta, pedimos que inicie sesión por /login.
 *  - Rate-limit en memoria por IP para ralentizar enumeración de session_ids.
 *  - Validamos que el pago en Stripe esté "paid" y que la metadata coincida
 *    con un pack de partners válido.
 *  - Password fuerte obligatoria (>=12 y complejidad).
 *
 * Flujo:
 *  1. Recibe { session_id, password } desde /partners/exito.
 *  2. Busca partner_account por stripe_session_id.
 *     - Si no existe (webhook no corrió) → reconcilia desde Stripe.
 *  3. Si ya tiene user_id → devuelve ok=false (el partner ya activó, redirige a login).
 *  4. Si NO existe usuario con ese email → crea con email_confirm=true.
 *     El trigger `link_partner_on_signup` vincula user_id automáticamente.
 *  5. Si SÍ existe usuario con ese email → rechaza con `email_already_registered`.
 *     El socio debe iniciar sesión con su contraseña existente.
 */

interface Body {
  session_id?: string;
  password?: string;
}

/* ----- rate limit en memoria (por instancia serverless) ----- */
const rlBucket = new Map<string, { count: number; resetAt: number }>();
const RL_WINDOW_MS = 60_000;
const RL_MAX = 5;

function rateLimit(key: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = rlBucket.get(key);
  if (!entry || entry.resetAt < now) {
    rlBucket.set(key, { count: 1, resetAt: now + RL_WINDOW_MS });
    return { ok: true, remaining: RL_MAX - 1 };
  }
  entry.count += 1;
  if (entry.count > RL_MAX) return { ok: false, remaining: 0 };
  return { ok: true, remaining: RL_MAX - entry.count };
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

/** Valida complejidad de la contraseña. */
function isStrongPassword(p: string): boolean {
  if (typeof p !== 'string') return false;
  if (p.length < 12 || p.length > 128) return false;
  if (!/[a-z]/.test(p)) return false;
  if (!/[A-Z]/.test(p)) return false;
  if (!/\d/.test(p)) return false;
  // No exigimos símbolo para no bloquear a usuarios poco técnicos,
  // pero longitud 12 + 3 clases es razonable.
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`activate-now:${ip}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'rate_limited', hint: 'Demasiados intentos, espera un minuto.' },
        { status: 429 },
      );
    }

    const body = (await req.json()) as Body;
    const sessionId = body.session_id?.trim();
    const password  = body.password;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 200) {
      return NextResponse.json({ error: 'session_id_invalido' }, { status: 400 });
    }
    if (!password || !isStrongPassword(password)) {
      return NextResponse.json(
        {
          error: 'password_debil',
          hint: 'Usa 12+ caracteres con mayúscula, minúscula y número.',
        },
        { status: 400 },
      );
    }

    // HIBP check (k-anonymity). Si HIBP está caído, continuamos (failure-open).
    const pwn = await isPasswordPwned(password);
    if (pwn.pwned) {
      return NextResponse.json(
        {
          error: 'password_filtrado',
          hint: `Ese password ha aparecido en ${pwn.count.toLocaleString('es-MX')} brechas públicas. Elige otro.`,
        },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // 1. Buscar partner_account
    let { data: partner } = await admin
      .from('partner_accounts')
      .select('id, business_name, contact_email, user_id, status')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    // 2. Reconciliar desde Stripe si no existe (webhook aún no corrió)
    if (!partner) {
      const reconciled = await reconcileFromStripe(sessionId, admin);
      if ('error' in reconciled) {
        return NextResponse.json(reconciled, { status: 400 });
      }
      partner = reconciled;
    }

    if (!partner) {
      return NextResponse.json({ error: 'partner_no_encontrado' }, { status: 404 });
    }
    if (partner.status !== 'active') {
      return NextResponse.json({ error: 'cuenta_no_activa' }, { status: 400 });
    }

    // 3. Si ya tenía user_id → alguien ya activó. Que inicie sesión.
    if (partner.user_id) {
      return NextResponse.json({
        error: 'ya_activada',
        hint: 'Esta cuenta ya fue activada. Inicia sesión con tu correo.',
      }, { status: 409 });
    }

    // 4. Si YA existe un auth.user con ese email → NO lo sobreescribimos
    //    (account takeover). Le pedimos al legítimo dueño iniciar sesión.
    const existingUser = await findUserByEmail(admin, partner.contact_email);
    if (existingUser) {
      // Vinculamos el partner_account al usuario ya existente (si aún no estaba),
      // pero NO tocamos su password.
      await admin
        .from('partner_accounts')
        .update({ user_id: existingUser.id, onboarded_at: new Date().toISOString() })
        .eq('id', partner.id)
        .is('user_id', null);

      return NextResponse.json({
        error: 'email_already_registered',
        hint: 'Ya existe una cuenta con este correo. Inicia sesión con tu contraseña habitual.',
      }, { status: 409 });
    }

    // 5. Crear usuario nuevo con email confirmado.
    const createRes = await admin.auth.admin.createUser({
      email: partner.contact_email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: partner.business_name,
        role: 'partner',
      },
    });

    if (createRes.error) {
      console.error('[activate-now] createUser falló:', createRes.error.message);
      return NextResponse.json(
        { error: 'no_se_pudo_crear_usuario' },
        { status: 500 },
      );
    }

    // Backup: asegura el vínculo aunque el trigger SQL fallara.
    const newUserId = createRes.data.user?.id;
    if (newUserId) {
      await admin
        .from('partner_accounts')
        .update({ user_id: newUserId, onboarded_at: new Date().toISOString() })
        .eq('id', partner.id)
        .is('user_id', null);
    }

    return NextResponse.json({
      ok: true,
      email: partner.contact_email,
    });
  } catch (err: any) {
    console.error('[activate-now] error:', err?.message ?? err);
    return NextResponse.json(
      { error: 'error_interno' },
      { status: 500 },
    );
  }
}

/* ============================================================================
 *  Reconciliación con Stripe si el webhook aún no corrió
 * ========================================================================== */

type PartnerRow = {
  id: string;
  business_name: string;
  contact_email: string;
  user_id: string | null;
  status: string;
};

async function reconcileFromStripe(
  sessionId: string,
  admin: ReturnType<typeof createAdminClient>,
): Promise<PartnerRow | { error: string }> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { error: 'stripe_no_configurado' };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { error: 'stripe_session_no_encontrada' };
  }

  if (session.payment_status !== 'paid')         return { error: 'pago_no_completado' };
  if (session.metadata?.kind !== 'partner_pack') return { error: 'no_es_partner_pack' };

  const planIdRaw   = session.metadata?.partner_plan_id as PartnerPlanId | undefined;
  const businessName = session.metadata?.business_name ?? '';
  const contactEmail = (session.metadata?.contact_email ?? session.customer_email ?? '').toLowerCase();
  const creditsIncluded = Number(session.metadata?.memorials_included ?? 0);
  const validityMonths  = Number(session.metadata?.validity_months ?? 12);

  if (!planIdRaw || !businessName || !contactEmail) {
    return { error: 'metadata_incompleta' };
  }
  let plan;
  try { plan = getPartnerPlan(planIdRaw); } catch {
    return { error: 'plan_invalido' };
  }

  // ANTI-TAMPERING: el monto pagado debe coincidir con el catálogo local.
  const expectedAmount = (plan.priceMXN ?? 0) * 100; // Stripe usa centavos
  const paidAmount = session.amount_total ?? 0;
  if (!plan.priceMXN || Math.abs(paidAmount - expectedAmount) > 1) {
    console.error('[activate-now] amount mismatch', { paidAmount, expectedAmount, plan: plan.id });
    return { error: 'monto_no_coincide' };
  }

  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + validityMonths);
  const onboardingToken = randomBytes(24).toString('hex');

  // Double-check por si el webhook corrió entre medias
  const { data: justInserted } = await admin
    .from('partner_accounts')
    .select('id, business_name, contact_email, user_id, status')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();
  if (justInserted) return justInserted as PartnerRow;

  const { data: partner, error: insertErr } = await admin
    .from('partner_accounts')
    .insert({
      business_name:     businessName,
      contact_email:     contactEmail,
      plan_id:           plan.id,
      credits_total:     creditsIncluded,
      credits_used:      0,
      valid_until:       validUntil.toISOString(),
      stripe_session_id: sessionId,
      status:            'active',
      onboarding_token:  onboardingToken,
    })
    .select('id, business_name, contact_email, user_id, status')
    .single();

  if (insertErr || !partner) {
    // Race: otra llamada lo insertó. Re-lee.
    const { data: again } = await admin
      .from('partner_accounts')
      .select('id, business_name, contact_email, user_id, status')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
    if (again) return again as PartnerRow;
    return { error: 'insert_fallido' };
  }

  try {
    await admin.from('partner_credits_log').insert({
      partner_id: partner.id,
      delta:      creditsIncluded,
      reason:     'pack_purchase_reconciled',
    });
  } catch { /* no bloquea */ }

  return partner as PartnerRow;
}

async function findUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<{ id: string } | null> {
  try {
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const lower = email.toLowerCase();
    const found = data?.users.find((u) => u.email?.toLowerCase() === lower);
    return found ? { id: found.id } : null;
  } catch {
    return null;
  }
}
