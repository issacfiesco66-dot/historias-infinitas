import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlan, type PlanId } from '@/lib/plans';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

interface Body {
  memorialId: string;
}

/**
 * POST /api/checkout/reconcile
 *
 * Rescate para memoriales huérfanos: el usuario pagó, pero el webhook de
 * Stripe no llegó o falló. Esta ruta busca en Stripe las últimas sesiones
 * de checkout del email del usuario y, si encuentra una `paid` que coincide
 * con `memorialId`, activa el memorial e inserta la orden (idempotente).
 */
export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'stripe_no_configurado' }, { status: 500 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 });

    const body = (await req.json()) as Body;
    if (!body?.memorialId) {
      return NextResponse.json({ error: 'faltan_campos' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Ownership
    const { data: memorial } = await admin
      .from('memorials')
      .select('id, slug, name, status, owner_id')
      .eq('id', body.memorialId)
      .single();
    if (!memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: 'memorial_no_encontrado' }, { status: 404 });
    }

    if (memorial.status === 'publicado') {
      return NextResponse.json({ ok: true, already: true });
    }

    // Ya hay una orden pagada registrada?
    const { data: existingOrder } = await admin
      .from('orders')
      .select('id, plan_id')
      .eq('memorial_id', memorial.id)
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .maybeSingle();

    if (existingOrder) {
      // Activar memorial
      await admin
        .from('memorials')
        .update({ status: 'publicado', plan_id: existingOrder.plan_id })
        .eq('id', memorial.id);
      return NextResponse.json({ ok: true, source: 'orders_table' });
    }

    // Buscar en Stripe por email — últimas 20 sessions del cliente.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    const sessions = await stripe.checkout.sessions.list({
      limit: 20,
      customer_details: undefined, // no filter directo por email aquí
    });

    // Filtrado manual: email + metadata.memorial_id + paid
    const matched = sessions.data.find((s) => {
      const okEmail = (s.customer_details?.email ?? s.customer_email) === user.email;
      const okMemorial = s.metadata?.memorial_id === memorial.id;
      const paid = s.payment_status === 'paid' || s.payment_status === 'no_payment_required';
      return okEmail && okMemorial && paid;
    });

    if (!matched) {
      return NextResponse.json({
        ok: false,
        reason: 'no_paid_session_found',
      }, { status: 404 });
    }

    const planId = (matched.metadata?.plan_id ?? 'digital') as PlanId;
    let plan;
    try { plan = getPlan(planId); } catch {
      return NextResponse.json({ error: 'invalid_plan' }, { status: 500 });
    }

    // Insertar orden (idempotente)
    try {
      await admin.from('orders').insert({
        user_id: user.id,
        memorial_id: memorial.id,
        stripe_session_id: matched.id,
        plan_id: plan.id,
        amount_total: (matched.amount_total ?? 0) / 100,
        currency: (matched.currency ?? 'mxn').toLowerCase(),
        status: 'paid',
        has_ar_addon: matched.metadata?.ar_addon === '1',
        slug_memorial: memorial.slug,
      });
    } catch { /* duplicado — ok */ }

    // Activar memorial
    await admin
      .from('memorials')
      .update({ status: 'publicado', plan_id: plan.id })
      .eq('id', memorial.id);

    return NextResponse.json({ ok: true, source: 'stripe_list', session_id: matched.id });
  } catch (err: any) {
    console.error('[reconcile]', err);
    return NextResponse.json({ error: err?.message ?? 'error_interno' }, { status: 500 });
  }
}
