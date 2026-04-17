import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPartnerPlan, type PartnerPlanId } from '@/lib/partner-plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/partners/activate-now
 *
 * Convierte una compra de partner recién hecha en una cuenta lista para entrar,
 * sin depender del correo de bienvenida.
 *
 * Flujo:
 *  1. Recibe { session_id, password } desde /partners/exito.
 *  2. Busca la partner_account por stripe_session_id.
 *     - Si no existe aún (webhook no corrió) → la reconcilia leyendo la Stripe
 *       Checkout Session y creándola a partir de la metadata.
 *  3. Crea el usuario en auth con email_confirm=true y la contraseña provista.
 *     - El trigger `link_partner_on_signup` en la BD vincula user_id automáticamente.
 *  4. Responde con { email } — el cliente hace signInWithPassword y redirige.
 */

interface Body {
  session_id?: string;
  password?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const sessionId = body.session_id?.trim();
    const password  = body.password;

    if (!sessionId || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'campos_invalidos', hint: 'session_id y password (min 8) son requeridos.' },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // 1. Buscar partner_account
    let { data: partner } = await admin
      .from('partner_accounts')
      .select('id, business_name, contact_email, user_id, onboarding_token, status')
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

    // Si ya tenía user_id (alguien re-entra a exito con session_id ya activado)
    if (partner.user_id) {
      return NextResponse.json({
        ok: true,
        already_activated: true,
        email: partner.contact_email,
      });
    }

    // 3. Crear usuario con email confirmado. El trigger vincula user_id.
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
      // Si ya existe el usuario (ej: reintento, o había cuenta previa) → intentamos
      // actualizarle la contraseña con el mismo admin y vincular manualmente.
      const existingUser = await findUserByEmail(admin, partner.contact_email);
      if (existingUser) {
        await admin.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true,
        });
        // Vincular partner_account si aún no lo estaba
        if (!partner.user_id) {
          await admin
            .from('partner_accounts')
            .update({ user_id: existingUser.id, onboarded_at: new Date().toISOString() })
            .eq('id', partner.id);
        }
        return NextResponse.json({
          ok: true,
          reused_existing_user: true,
          email: partner.contact_email,
        });
      }
      console.error('[activate-now] createUser falló:', createRes.error);
      return NextResponse.json(
        { error: 'no_se_pudo_crear_usuario', detail: createRes.error.message },
        { status: 500 },
      );
    }

    // El trigger SQL `link_partner_on_signup` debería haber vinculado user_id.
    // Por si acaso, lo forzamos aquí también (idempotente).
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
    console.error('[activate-now] error:', err);
    return NextResponse.json(
      { error: 'error_interno', detail: err?.message ?? String(err) },
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
  onboarding_token: string | null;
  status: string;
};

async function reconcileFromStripe(
  sessionId: string,
  admin: ReturnType<typeof createAdminClient>,
): Promise<PartnerRow | { error: string; detail?: string }> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { error: 'stripe_no_configurado' };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err: any) {
    return { error: 'stripe_session_no_encontrada', detail: err?.message };
  }

  if (session.payment_status !== 'paid') {
    return { error: 'pago_no_completado', detail: String(session.payment_status) };
  }
  if (session.metadata?.kind !== 'partner_pack') {
    return { error: 'no_es_partner_pack' };
  }

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

  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + validityMonths);
  const onboardingToken = randomBytes(24).toString('hex');

  // Double-check por si el webhook corrió entre medias
  const { data: justInserted } = await admin
    .from('partner_accounts')
    .select('id, business_name, contact_email, user_id, onboarding_token, status')
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
    .select('id, business_name, contact_email, user_id, onboarding_token, status')
    .single();

  if (insertErr || !partner) {
    // Race: otra llamada lo insertó. Re-lee.
    const { data: again } = await admin
      .from('partner_accounts')
      .select('id, business_name, contact_email, user_id, onboarding_token, status')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
    if (again) return again as PartnerRow;
    return { error: 'insert_fallido', detail: insertErr?.message };
  }

  // Log inicial de créditos
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
    // Supabase v2: listUsers paginado. Con la base que tenemos (pocos usuarios)
    // una sola página basta; si crece, habría que buscar con filter.
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const lower = email.toLowerCase();
    const found = data?.users.find((u) => u.email?.toLowerCase() === lower);
    return found ? { id: found.id } : null;
  } catch {
    return null;
  }
}
