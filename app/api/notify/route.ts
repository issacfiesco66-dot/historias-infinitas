import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTransactional, type NotifyEvent } from '@/lib/emails/send';
import { PLANS } from '@/lib/plans';

export const runtime = 'nodejs';

/* ============================================================================
 *  POST /api/notify
 *
 *  Acepta dos formatos:
 *   (A) Directo:   { event, to, data }
 *   (B) Supabase Database Webhook:
 *       { type: 'INSERT'|'UPDATE', table, record, old_record, schema }
 *
 *  Autenticación: header x-webhook-secret == NOTIFY_WEBHOOK_SECRET.
 *
 *  Eventos reconocidos:
 *   - profiles INSERT                       → welcome
 *   - ai_generations UPDATE → 'completado'  → ai_ready
 *   - orders UPDATE → 'shipped'             → plate_shipped
 *
 *  Nota: el correo payment_confirmed NO se dispara desde aquí. Lo envía
 *  directamente /api/stripe/webhook justo tras insertar la orden, para
 *  mantener la secuencia pago → correo sin depender de reintentos de BD.
 * ========================================================================== */

export async function POST(req: Request) {
  // 1) Autenticación
  const secret = req.headers.get('x-webhook-secret') ?? '';
  const expected = process.env.NOTIFY_WEBHOOK_SECRET;
  if (!expected || !safeEqual(secret, expected)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2) Parse
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  try {
    // ---------- (B) Supabase Database Webhook ----------
    if (body?.type && body?.table && body?.record) {
      const event = await fromSupabaseWebhook(body);
      if (!event) return NextResponse.json({ skipped: true });
      const result = await sendTransactional(event);
      return NextResponse.json({ ok: true, ...result });
    }

    // ---------- (A) Llamada directa ----------
    if (!body?.event || !body?.to) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    const result = await sendTransactional(body as NotifyEvent);
    return NextResponse.json({ ok: true, ...result });

  } catch (err: any) {
    console.error('[api/notify]', err);
    return NextResponse.json(
      { error: err?.message ?? 'internal_error' },
      { status: 500 },
    );
  }
}

/* ============================================================================
 *  Traduce un payload de Supabase DB Webhook al evento transaccional.
 * ========================================================================== */

interface SbWebhook {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: any;
  old_record: any | null;
}

async function fromSupabaseWebhook(hook: SbWebhook): Promise<NotifyEvent | null> {
  const admin = createAdminClient();

  /* ---------- 1. Nuevo perfil ---------- */
  if (hook.type === 'INSERT' && hook.table === 'profiles') {
    const p = hook.record;
    if (!p?.email) return null;
    return {
      event: 'welcome',
      to: p.email,
      data: { name: p.full_name, email: p.email },
    };
  }

  /* ---------- 2. Generación IA completada ---------- */
  if (hook.table === 'ai_generations' && hook.type === 'UPDATE') {
    const prev = hook.old_record;
    const cur = hook.record;
    const becameCompleted =
      cur?.status === 'completado' &&
      prev?.status !== 'completado' &&
      !!cur?.output_url;

    if (!becameCompleted) return null;

    const [{ data: memorial }, { data: profile }] = await Promise.all([
      admin.from('memorials').select('id, name').eq('id', cur.memorial_id).single(),
      admin.from('profiles').select('email, full_name').eq('id', cur.user_id).single(),
    ]);

    if (!memorial || !profile?.email) return null;

    return {
      event: 'ai_ready',
      to: profile.email,
      data: {
        name: profile.full_name,
        memorialName: memorial.name,
        memorialId: memorial.id,
        portraitUrl: cur.output_url,
      },
    };
  }

  /* ---------- 3. Placa enviada ---------- */
  // Esquema de orders (canónico): status ∈ {pending,paid,shipped,cancelled}.
  // Los datos auxiliares de transportista viven en shipping_address JSONB.
  if (hook.table === 'orders' && hook.type === 'UPDATE') {
    const prev = hook.old_record;
    const cur = hook.record;

    const becameShipped =
      cur?.status === 'shipped' &&
      prev?.status !== 'shipped' &&
      !!cur?.tracking_number;
    if (!becameShipped) return null;

    const [{ data: memorial }, { data: profile }] = await Promise.all([
      admin.from('memorials').select('id, name').eq('id', cur.memorial_id).single(),
      admin.from('profiles').select('email, full_name').eq('id', cur.user_id).single(),
    ]);
    if (!memorial || !profile?.email) return null;

    const addr = (cur.shipping_address ?? {}) as Record<string, any>;

    return {
      event: 'plate_shipped',
      to: profile.email,
      data: {
        name: profile.full_name,
        memorialName: memorial.name,
        trackingNumber: cur.tracking_number,
        carrier: addr.carrier ?? 'Nuestro transportista',
        trackingUrl: addr.tracking_url ?? null,
        estimatedDelivery: addr.estimated_delivery ?? null,
      },
    };
  }

  return null;
}

/* ============================================================================
 *  Helpers
 * ========================================================================== */

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Busca el nombre bonito del plan por id para los correos. */
function planLabel(planId: string): string {
  const p = PLANS.find((x) => x.id === planId);
  return p ? `Plan ${p.name}` : 'Plan';
}
void planLabel;  // reservado para futuras ramas; silencia "unused"
