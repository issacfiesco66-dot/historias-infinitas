import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTransactional } from '@/lib/emails/send';
import { getPlan, type PlanId } from '@/lib/plans';
import { buildPortraitPrompt } from '@/lib/replicate';

/* ============================================================================
 *  POST /api/stripe/webhook
 *
 *  Flujo:
 *   1. Verifica la firma de Stripe con STRIPE_WEBHOOK_SECRET (raw body).
 *   2. Filtra eventos: solo 'checkout.session.completed'.
 *   3. Idempotencia doble:
 *        a) stripe_events (event.id PK)
 *        b) orders (UNIQUE stripe_session_id)
 *   4. Metadata: memorial_id, user_id, plan_id, ar_addon.
 *   5. Lee memorial (slug + name + type) → INSERT orders → UPDATE memorials
 *      → encolar IA si aplica → correo payment_confirmed.
 *   6. Retries exponenciales por paso. Pasos críticos (orden + memorial)
 *      responden 500 → Stripe reintenta. Correo NO bloquea.
 *
 *  Esquema canónico de la tabla orders (supabase/orders.sql):
 *    id, user_id, memorial_id, stripe_session_id, plan_id, amount_total,
 *    currency, status ('pending'|'paid'|'shipped'|'cancelled'),
 *    has_ar_addon, shipping_address, tracking_number, slug_memorial.
 * ========================================================================== */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/* ============================================================================
 *  Handler
 * ========================================================================== */

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !stripeKey) {
    console.error('[stripe-webhook] Falta STRIPE_WEBHOOK_SECRET o STRIPE_SECRET_KEY');
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  /* ---------- 1. Verificación de firma ---------- */
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'missing_signature' }, { status: 400 });

  let rawBody: string;
  try { rawBody = await req.text(); }
  catch { return NextResponse.json({ error: 'invalid_body' }, { status: 400 }); }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    console.warn('[stripe-webhook] firma inválida:', err?.message);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  /* ---------- 2. Filtrado ---------- */
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const admin = createAdminClient();

  /* ---------- 3a. Idempotencia por event.id ---------- */
  try {
    const { error } = await admin
      .from('stripe_events')
      .insert({ id: event.id, type: event.type });
    if (error) {
      if (error.code === '23505') {
        console.info(`[stripe-webhook] evento duplicado ${event.id} — ignorado`);
        return NextResponse.json({ ok: true, duplicated: true });
      }
      // Otro error → seguimos, idempotencia por stripe_session_id cubre.
      console.warn('[stripe-webhook] no pude registrar evento, sigo:', error.message);
    }
  } catch (err) {
    console.warn('[stripe-webhook] stripe_events insert:', err);
  }

  /* ---------- 4. Extracción y validación de metadata ---------- */
  const memorialId = session.metadata?.memorial_id;
  const userId     = session.metadata?.user_id;
  const planIdRaw  = session.metadata?.plan_id;
  const hasArAddon = session.metadata?.ar_addon === '1';

  if (!memorialId || !userId || !planIdRaw) {
    console.error('[stripe-webhook] metadata incompleta:', session.metadata);
    return NextResponse.json({ ok: false, reason: 'missing_metadata' });
  }

  let plan;
  try { plan = getPlan(planIdRaw as PlanId); }
  catch {
    console.error('[stripe-webhook] plan_id inválido:', planIdRaw);
    return NextResponse.json({ ok: false, reason: 'invalid_plan' });
  }

  const amountTotal = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? 'usd').toLowerCase();

  // Dirección de envío (si Stripe la recogió — requiere shipping_address_collection
  // en la creación de la Checkout Session).
  const shippingAddress = session.shipping_details
    ? {
        name:        session.shipping_details.name ?? null,
        line1:       session.shipping_details.address?.line1 ?? null,
        line2:       session.shipping_details.address?.line2 ?? null,
        city:        session.shipping_details.address?.city ?? null,
        state:       session.shipping_details.address?.state ?? null,
        postal_code: session.shipping_details.address?.postal_code ?? null,
        country:     session.shipping_details.address?.country ?? null,
      }
    : null;

  /* ---------- 5. Leer memorial (ownership + slug + nombre) ---------- */
  const memorialLookup = await withRetry(
    () => admin
      .from('memorials')
      .select('id, name, slug, type, owner_id, cover_photo_url')
      .eq('id', memorialId)
      .single(),
    'memorials.select',
  );

  if (memorialLookup.error || !memorialLookup.data) {
    console.error('[stripe-webhook] memorial no encontrado:', memorialId);
    return NextResponse.json({ error: 'memorial_not_found' }, { status: 500 });
  }
  const memorial = memorialLookup.data;
  if (memorial.owner_id !== userId) {
    console.error('[stripe-webhook] owner mismatch', { memorialId, userId });
    return NextResponse.json({ ok: false, reason: 'owner_mismatch' });
  }

  /* ---------- 6a. Idempotencia por sesión ---------- */
  const existingOrder = await withRetry(
    () => admin.from('orders').select('id').eq('stripe_session_id', session.id).maybeSingle(),
    'orders.select(existing)',
  );
  if (existingOrder.data) {
    console.info(`[stripe-webhook] sesión ${session.id} ya tiene orden ${existingOrder.data.id}`);
    return NextResponse.json({ ok: true, duplicated: true, order_id: existingOrder.data.id });
  }

  /* ---------- 6b. INSERT orders ---------- */
  const orderInsert = await withRetry(
    () => admin
      .from('orders')
      .insert({
        user_id:            userId,
        memorial_id:        memorialId,
        stripe_session_id:  session.id,
        plan_id:            plan.id,           // 'digital' | 'artistico' | 'eterno'
        amount_total:       amountTotal,
        currency,
        status:             'paid',
        has_ar_addon:       hasArAddon,
        shipping_address:   shippingAddress,
        slug_memorial:      memorial.slug,
      })
      .select('id')
      .single(),
    'orders.insert',
  );

  if (orderInsert.error) {
    if (orderInsert.error.code === '23505') {
      // Carrera: otra ejecución ganó.
      console.info(`[stripe-webhook] carrera, sesión ${session.id} ya existe`);
      return NextResponse.json({ ok: true, duplicated: true });
    }
    console.error('[stripe-webhook] orders.insert falló:', orderInsert.error);
    return NextResponse.json({ error: 'orders_insert_failed' }, { status: 500 });
  }

  const order = orderInsert.data!;
  // Referencia legible para el cliente (no hay order_number en el esquema).
  const orderRef = `HI-${order.id.slice(0, 8).toUpperCase()}`;
  console.info(`[stripe-webhook] orden creada ${orderRef} (${order.id})`);

  /* ---------- 6c. UPDATE memorials ---------- */
  const updateMemorial = await withRetry(
    () => admin
      .from('memorials')
      .update({ status: 'publicado', plan_id: plan.id })
      .eq('id', memorialId)
      .eq('owner_id', userId),
    'memorials.update',
  );

  if (updateMemorial.error) {
    console.error('[stripe-webhook] memorials.update falló:', updateMemorial.error);
    return NextResponse.json({ error: 'memorial_update_failed' }, { status: 500 });
  }

  /* ---------- 6d. Encolar job de IA si el plan lo incluye ---------- */
  const planIncludesAI = plan.id === 'artistico' || plan.id === 'eterno';

  if (planIncludesAI) {
    try {
      const { data: existingJob } = await admin
        .from('ai_generations')
        .select('id, status')
        .eq('memorial_id', memorialId)
        .in('status', ['pendiente', 'procesando'])
        .limit(1)
        .maybeSingle();

      if (!existingJob) {
        const { data: firstPhoto } = await admin
          .from('memorial_media')
          .select('url')
          .eq('memorial_id', memorialId)
          .eq('kind', 'foto')
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();

        const sourceUrl = firstPhoto?.url ?? memorial.cover_photo_url ?? '';
        const prompt = buildPortraitPrompt({
          subject: memorial.name,
          style:  'oleo',
          type:   memorial.type as 'mascota' | 'ser_querido',
        });

        const { error: aiErr } = await admin
          .from('ai_generations')
          .insert({
            memorial_id: memorialId,
            user_id:     userId,
            source_url:  sourceUrl,
            prompt,
            model:       'stability-ai/sdxl',
            status:      'pendiente',
          });

        if (aiErr) {
          console.error('[stripe-webhook] ai_generations.insert falló:', aiErr);
        } else {
          console.info(`[stripe-webhook] job de IA encolado para ${memorialId}`);
        }
      } else {
        console.info(`[stripe-webhook] ya existe job ${existingJob.id} (${existingJob.status})`);
      }
    } catch (err) {
      console.error('[stripe-webhook] error al encolar job IA:', err);
    }
  }

  // Nota AR: el add-on AR no genera job; el flag has_ar_addon=true queda
  // registrado en orders y el usuario sube el video desde el editor.

  /* ---------- 7. Correo payment_confirmed ---------- */
  try {
    const { data: profile } = await admin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    const email = profile?.email ?? session.customer_details?.email ?? session.customer_email;
    if (!email) {
      console.warn('[stripe-webhook] sin email para notificar, skip correo');
    } else {
      await sendTransactional({
        event: 'payment_confirmed',
        to: email,
        data: {
          name:          profile?.full_name ?? null,
          orderNumber:   orderRef,
          memorialName:  memorial.name,
          memorialId:    memorial.id,
          planLabel:     `Plan ${plan.name}${hasArAddon ? ' + Portal AR' : ''}`,
          amount:        formatMoney(amountTotal, currency),
        },
      });
      console.info(`[stripe-webhook] correo payment_confirmed enviado a ${email}`);
    }
  } catch (err) {
    console.error('[stripe-webhook] fallo al enviar correo payment_confirmed:', err);
  }

  return NextResponse.json({
    ok:           true,
    order_id:     order.id,
    order_ref:    orderRef,
    ai_queued:    planIncludesAI,
  });
}

/* ============================================================================
 *  Helpers
 * ========================================================================== */

async function withRetry<T>(
  fn: () => PromiseLike<T>,    // acepta Promise<T> y thenables (p. ej. PostgrestBuilder)
  label: string,
  max = 3,
): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= max; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = 300 * 2 ** (attempt - 1);
      console.warn(
        `[stripe-webhook] ${label} falló (intento ${attempt}/${max})`,
        err instanceof Error ? err.message : err,
      );
      if (attempt < max) await sleep(delay);
    }
  }
  throw lastErr;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}
