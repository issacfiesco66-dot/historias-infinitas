import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  validateIngestPayload,
  verifyIndexaKey,
  partnersLeadLink,
  type PartnerLead,
} from '@/lib/partner-leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/funeraria
 *
 * Ingesta de leads desde indexa (scraper externo en E:\Indexa).
 *
 * Auth: header X-Indexa-Key === env INDEXA_API_KEY
 *
 * Body:
 *   {
 *     business_name: string,
 *     phone:         string (E.164 recomendado: +525512345678),
 *     city?:         string,
 *     state?:        string,
 *     google_place_id?: string,
 *     source?:       string,  // default 'indexa'
 *     notes?:        string,
 *     metadata?:     object
 *   }
 *
 * Respuesta 200:
 *   {
 *     ok: true,
 *     is_new: boolean,
 *     status: PartnerLeadStatus,
 *     lead_id: string,
 *     token: string,
 *     link:  string   // absoluta /partners?lead=<token>
 *   }
 *
 * Respuesta 403 { error: 'opted_out' }            → indexa NO debe enviar WhatsApp.
 * Respuesta 409 { error: 'already_in_funnel' }    → ya abrió el link o compró.
 */

const rlBucket = new Map<string, { count: number; resetAt: number }>();
const RL_WINDOW_MS = 60_000;
const RL_MAX = 120; // ~2/s sostenidos desde indexa

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

export async function POST(req: Request) {
  if (!verifyIndexaKey(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!rateLimit(`ingest:${clientIp(req)}`)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'json_invalido' }, { status: 400 });
  }

  const parsed = validateIngestPayload(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;

  const admin = createAdminClient();

  // 1. ¿Existe ya por teléfono? → idempotente.
  const { data: existing } = await admin
    .from('partner_leads')
    .select('*')
    .eq('phone', data.phone)
    .maybeSingle<PartnerLead>();

  if (existing) {
    if (existing.status === 'opted_out') {
      return NextResponse.json(
        {
          error: 'opted_out',
          status: existing.status,
          hint: 'La funeraria pidió no ser contactada. No enviar WhatsApp.',
        },
        { status: 403 },
      );
    }
    if (existing.status === 'engaged' || existing.status === 'converted') {
      return NextResponse.json(
        {
          error: 'already_in_funnel',
          status: existing.status,
          lead_id: existing.id,
          token: existing.token,
          link: partnersLeadLink(existing.token),
          hint: 'Ya está en funnel — no re-enviar.',
        },
        { status: 409 },
      );
    }
    // 'scraped' | 'contacted' → devuelve el token existente
    return NextResponse.json({
      ok: true,
      is_new: false,
      status: existing.status,
      lead_id: existing.id,
      token: existing.token,
      link: partnersLeadLink(existing.token),
    });
  }

  // 2. Nuevo lead. Insert directo con status='contacted' (indexa enviará WA ahora).
  const { data: inserted, error } = await admin
    .from('partner_leads')
    .insert({
      business_name:   data.business_name,
      phone:           data.phone,
      city:            data.city ?? null,
      state:           data.state ?? null,
      google_place_id: data.google_place_id ?? null,
      source:          data.source ?? 'indexa',
      notes:           data.notes ?? null,
      metadata:        data.metadata ?? {},
      status:          'contacted',
      contacted_at:    new Date().toISOString(),
    })
    .select('*')
    .single<PartnerLead>();

  if (error || !inserted) {
    // Race condition: otra request insertó el mismo phone entre el select y el insert.
    const { data: again } = await admin
      .from('partner_leads')
      .select('*')
      .eq('phone', data.phone)
      .maybeSingle<PartnerLead>();
    if (again) {
      return NextResponse.json({
        ok: true,
        is_new: false,
        status: again.status,
        lead_id: again.id,
        token: again.token,
        link: partnersLeadLink(again.token),
      });
    }
    console.error('[leads/funeraria] insert falló:', error?.message);
    return NextResponse.json({ error: 'insert_fallido' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    is_new: true,
    status: inserted.status,
    lead_id: inserted.id,
    token: inserted.token,
    link: partnersLeadLink(inserted.token),
  });
}
