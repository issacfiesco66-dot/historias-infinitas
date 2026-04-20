import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlan, AR_ADDON, type PlanId } from '@/lib/plans';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface Body {
  memorialId: string;
  planId: PlanId;
  addArPortal?: boolean;
}

/**
 * POST /api/checkout
 *
 * Crea una Stripe Checkout Session con:
 *  · Línea principal = plan elegido
 *  · Línea opcional  = add-on AR
 *  · Metadata        = memorialId, planId, userId (para reconciliar luego en webhook)
 *
 * Valida ownership del memorial. El precio NUNCA viene del cliente: sólo el planId.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'stripe_no_configurado' }, { status: 500 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 });

    const rl = await checkRateLimit('checkout', user.id);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'rate_limited', reset: rl.reset },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))) } },
      );
    }

    const body = (await req.json()) as Body;
    if (!body?.memorialId || !body?.planId) {
      return NextResponse.json({ error: 'faltan_campos' }, { status: 400 });
    }

    // Verifica ownership y existencia
    const admin = createAdminClient();
    const { data: memorial } = await admin
      .from('memorials')
      .select('id, name, owner_id')
      .eq('id', body.memorialId)
      .single();

    if (!memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: 'memorial_no_encontrado' }, { status: 404 });
    }

    const plan = getPlan(body.planId);
    const addAr = Boolean(body.addArPortal);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `Plan ${plan.name} — Historias Infinitas`,
            description: `Memorial: ${memorial.name}`,
          },
          unit_amount: plan.priceMXN * 100,
        },
        quantity: 1,
      },
    ];

    if (addAr) {
      line_items.push({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: AR_ADDON.name,
            description: AR_ADDON.description,
          },
          unit_amount: AR_ADDON.priceMXN * 100,
        },
        quantity: 1,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      new URL(req.url).origin;

    // Plan Eterno incluye placa física → requerimos dirección de envío
    // dentro del propio Checkout. México y EEUU por ahora.
    const needsShipping = plan.id === 'eterno';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'hosted',
      line_items,
      customer_email: user.email ?? undefined,
      allow_promotion_codes: true,
      phone_number_collection: needsShipping ? { enabled: true } : undefined,
      shipping_address_collection: needsShipping
        ? { allowed_countries: ['MX', 'US'] }
        : undefined,
      success_url: `${baseUrl}/dashboard/memorial/${memorial.id}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/memorial/${memorial.id}/checkout`,
      metadata: {
        memorial_id: memorial.id,
        user_id: user.id,
        plan_id: plan.id,
        ar_addon: addAr ? '1' : '0',
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err: any) {
    console.error('[api/checkout]', err);
    return NextResponse.json(
      { error: err?.message ?? 'error_interno' },
      { status: 500 },
    );
  }
}
