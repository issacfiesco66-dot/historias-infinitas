import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyIndexaKey } from '@/lib/partner-leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leads/funeraria/optouts[?since=<iso>]
 *
 * Devuelve los teléfonos con status='opted_out' para que indexa los cruce
 * contra su lista antes de enviar. Sin ?since devuelve el histórico completo.
 *
 * Auth: header X-Indexa-Key
 *
 * Respuesta:
 *   { count: number, phones: string[], since: string | null }
 *
 * Límite duro de 10k filas por respuesta — usa ?since=<iso> con la última
 * fecha sincronizada para paginar cuando el volumen crezca.
 */

const HARD_LIMIT = 10_000;

export async function GET(req: Request) {
  if (!verifyIndexaKey(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const sinceRaw = url.searchParams.get('since');

  let sinceIso: string | null = null;
  if (sinceRaw) {
    const d = new Date(sinceRaw);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: 'since_invalido' }, { status: 400 });
    }
    sinceIso = d.toISOString();
  }

  const admin = createAdminClient();
  let q = admin
    .from('partner_leads')
    .select('phone, opted_out_at')
    .eq('status', 'opted_out')
    .order('opted_out_at', { ascending: false })
    .limit(HARD_LIMIT);

  if (sinceIso) q = q.gte('opted_out_at', sinceIso);

  const { data, error } = await q;
  if (error) {
    console.error('[optouts] select falló:', error.message);
    return NextResponse.json({ error: 'select_fallido' }, { status: 500 });
  }

  return NextResponse.json({
    count:  data?.length ?? 0,
    phones: (data ?? []).map((r) => r.phone),
    since:  sinceIso,
  });
}
