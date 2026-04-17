import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPartnerPlan, partnerPlanHasDirectCheckout, type PartnerPlanId } from '@/lib/partner-plans';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

interface Body {
  planId: PartnerPlanId;
  /** Nombre comercial del partner (funeraria / clínica / etc.) */
  businessName: string;
  /** Correo del contacto del partner */
  email: string;
}

/**
 * POST /api/checkout/partner
 *
 * Crea un Stripe Checkout Session para los PACKS del programa de socios
 * (planes anuales e institucionales van por /contacto — cierre manual).
 *
 * Metadata guardada en la session para el webhook / reconciliación:
 *   - kind: 'partner_pack'
 *   - partner_plan_id
 *   - business_name
 *   - contact_email
 *   - memorials_included
 *
 * Este endpoint NO requiere auth — el partner paga antes de registrarse;
 * el webhook de Stripe se encarga de crear la cuenta partner después
 * (manualmente por ahora, hasta que se implemente el onboarding).
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'stripe_no_configurado' }, { status: 500 });
    }

    const body = (await req.json()) as Partial<Body>;
    if (!body?.planId || !body?.businessName || !body?.email) {
      return NextResponse.json({ error: 'faltan_campos' }, { status: 400 });
    }

    let plan;
    try { plan = getPartnerPlan(body.planId); } catch {
      return NextResponse.json({ error: 'plan_no_valido' }, { status: 400 });
    }

    if (!partnerPlanHasDirectCheckout(plan) || plan.priceMXN === null) {
      return NextResponse.json({
        error: 'plan_sin_checkout',
        hint: 'Los planes anuales e institucionales se cierran con ventas.',
      }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'hosted',
      line_items: [{
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `Programa Socios · ${plan.name} — Historias Infinitas`,
            description: `${plan.memorialsIncluded ?? 0} memoriales incluidos · Vigencia ${plan.validityMonths ?? 12} meses`,
          },
          unit_amount: plan.priceMXN * 100,
        },
        quantity: 1,
      }],
      customer_email: body.email,
      allow_promotion_codes: true,
      success_url: `${baseUrl}/partners/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/partners`,
      metadata: {
        kind: 'partner_pack',
        partner_plan_id: plan.id,
        business_name: body.businessName,
        contact_email: body.email,
        memorials_included: String(plan.memorialsIncluded ?? 0),
        validity_months: String(plan.validityMonths ?? 12),
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err: any) {
    console.error('[api/checkout/partner]', err);
    return NextResponse.json(
      { error: err?.message ?? 'error_interno' },
      { status: 500 },
    );
  }
}
