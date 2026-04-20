import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateOptoutPayload, verifyIndexaKey } from '@/lib/partner-leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/funeraria/optout
 *
 * indexa llama esto cuando detecta "BAJA" (u opt-out) en la respuesta WA.
 * Marca el lead como opted_out; indexa debe cruzar su lista contra
 * GET /api/leads/funeraria/optouts antes de cada tanda.
 *
 * Auth: header X-Indexa-Key
 * Body: { phone: string, reason?: string }
 *
 * Si el phone no existe en partner_leads (e.g. opt-out de un número que
 * indexa registró antes de esta integración), lo insertamos como
 * opted_out para garantizar que nunca se vuelva a contactar.
 */
export async function POST(req: Request) {
  if (!verifyIndexaKey(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'json_invalido' }, { status: 400 });
  }

  const parsed = validateOptoutPayload(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { phone, reason } = parsed;

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('partner_leads')
    .select('id, status, notes')
    .eq('phone', phone)
    .maybeSingle();

  const nowIso = new Date().toISOString();

  if (!existing) {
    const { error: insErr } = await admin
      .from('partner_leads')
      .insert({
        business_name: '(desconocido)',
        phone,
        status:        'opted_out',
        opted_out_at:  nowIso,
        notes:         reason,
        source:        'indexa',
      });
    if (insErr) {
      // Race: alguien insertó entre medias. Reintentamos como update.
      const { data: retry } = await admin
        .from('partner_leads')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();
      if (retry) {
        const update: Record<string, unknown> = {
          status:       'opted_out',
          opted_out_at: nowIso,
        };
        if (reason) update.notes = reason;
        const { error: updErr2 } = await admin
          .from('partner_leads')
          .update(update)
          .eq('id', retry.id);
        if (updErr2) {
          console.error('[optout] retry update falló:', updErr2.message);
          return NextResponse.json({ error: 'update_fallido' }, { status: 500 });
        }
        return NextResponse.json({ ok: true, phone, action: 'updated_opted_out' });
      }
      console.error('[optout] insert falló:', insErr.message);
      return NextResponse.json({ error: 'insert_fallido' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, phone, action: 'created_opted_out' });
  }

  const update: Record<string, unknown> = {
    status:       'opted_out',
    opted_out_at: nowIso,
  };
  // Solo sobreescribimos notes si viene un reason nuevo — no pisamos historia existente.
  if (reason) update.notes = reason;

  const { error: updErr } = await admin
    .from('partner_leads')
    .update(update)
    .eq('id', existing.id);

  if (updErr) {
    console.error('[optout] update falló:', updErr.message);
    return NextResponse.json({ error: 'update_fallido' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, phone, action: 'updated_opted_out' });
}
