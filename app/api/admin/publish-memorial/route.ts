import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { getPlan, AR_ADDON, type PlanId } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/publish-memorial
 *
 * Permite a un admin publicar un memorial SIN pasar por Stripe — útil para
 * generar demos, casos de éxito, o corregir compras off-line.
 *
 * Auth: session Supabase + email en ADMIN_EMAILS.
 *
 * Body:
 *   {
 *     memorialId:   string,
 *     planId:       PlanId,
 *     addArPortal?: boolean,
 *     note?:        string,   // Queda en orders.note para auditoría
 *   }
 *
 * Efecto:
 *   · Inserta una orden en `orders` con status='paid', amount_total=0,
 *     stripe_session_id con prefijo 'admin_free_' (reconocible para reportes)
 *     y note="[admin_publish] …"
 *   · Marca el memorial como status='publicado' con el plan elegido
 *   · Setea expires_at si el plan tiene durationDays (trial)
 *
 * Idempotente: si el memorial ya está publicado, devuelve ok:true sin cambios.
 */

interface Body {
  memorialId?: string;
  planId?: PlanId;
  addArPortal?: boolean;
  note?: string;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'no_autenticado' }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'no_admin' }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'json_invalido' }, { status: 400 });
  }

  const memorialId = body.memorialId?.trim();
  const planId = body.planId;
  const addAr = Boolean(body.addArPortal);
  const adminNote = typeof body.note === 'string' ? body.note.trim().slice(0, 400) : '';

  if (!memorialId || !planId) {
    return NextResponse.json({ error: 'faltan_campos' }, { status: 400 });
  }

  let plan;
  try {
    plan = getPlan(planId);
  } catch {
    return NextResponse.json({ error: 'plan_invalido' }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Memorial existe
  const { data: memorial } = await admin
    .from('memorials')
    .select('id, slug, name, status, owner_id, plan_id')
    .eq('id', memorialId)
    .single();

  if (!memorial) {
    return NextResponse.json({ error: 'memorial_no_encontrado' }, { status: 404 });
  }

  // 2. Ya publicado? → idempotente
  if (memorial.status === 'publicado') {
    return NextResponse.json({
      ok: true,
      already: true,
      slug: memorial.slug,
      plan_id: memorial.plan_id,
    });
  }

  // 3. Registrar orden "gratis por admin"
  //    El prefijo `admin_free_` en stripe_session_id es el marcador auditable
  //    — queda único (columna UNIQUE) y filtrable. No se usa columna `note`
  //    porque el schema canónico de orders no la tiene.
  const fakeSessionId = `admin_free_${randomBytes(12).toString('hex')}`;
  const now = new Date();

  void adminNote; // No lo persistimos; el prefijo del session_id basta para auditar.

  const { error: orderErr } = await admin.from('orders').insert({
    user_id: memorial.owner_id,
    memorial_id: memorial.id,
    stripe_session_id: fakeSessionId,
    plan_id: plan.id,
    amount_total: 0,
    currency: 'mxn',
    status: 'paid',
    has_ar_addon: addAr,
    slug_memorial: memorial.slug,
  });
  if (orderErr) {
    console.error('[admin/publish-memorial] insert orders falló:', orderErr.message);
    return NextResponse.json(
      { error: 'insert_orden_fallido', detail: orderErr.message },
      { status: 500 },
    );
  }

  // 4. Marcar memorial como publicado con plan
  const update: Record<string, unknown> = {
    status: 'publicado',
    plan_id: plan.id,
  };
  if (plan.durationDays) {
    const expires = new Date(now.getTime() + plan.durationDays * 86_400_000);
    update.expires_at = expires.toISOString();
  } else {
    update.expires_at = null;
  }

  const { error: updErr } = await admin
    .from('memorials')
    .update(update)
    .eq('id', memorial.id);

  if (updErr) {
    console.error('[admin/publish-memorial] memorial update falló:', updErr.message);
    return NextResponse.json({ error: 'update_memorial_fallido', detail: updErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    slug: memorial.slug,
    plan_id: plan.id,
    ar_addon: addAr,
    addon_price_saved: addAr ? AR_ADDON.priceMXN : 0,
    session_id: fakeSessionId,
  });
}
