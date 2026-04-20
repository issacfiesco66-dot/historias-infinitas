/**
 * Pipeline de leads de funerarias: scraper (indexa) → HI.
 *
 * Indexa corre como servicio externo (E:\Indexa). El flujo:
 *   1. indexa scrapea funeraria con WhatsApp
 *   2. POST /api/leads/funeraria (auth: X-Indexa-Key) registra lead y devuelve token+link
 *   3. indexa envía WhatsApp con el link /partners?lead=<token>
 *   4. al abrir el link marcamos 'engaged'
 *   5. al comprar, 'converted' (link vía converted_partner_id)
 *   6. si responde BAJA → POST /api/leads/funeraria/optout → 'opted_out'
 *   7. indexa consulta GET /api/leads/funeraria/optouts antes de cada tanda
 */

export type PartnerLeadStatus =
  | 'scraped'
  | 'contacted'
  | 'engaged'
  | 'opted_out'
  | 'converted';

export interface PartnerLead {
  id: string;
  business_name: string;
  phone: string;
  city: string | null;
  state: string | null;
  google_place_id: string | null;
  source: string;
  status: PartnerLeadStatus;
  token: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  converted_partner_id: string | null;
  contacted_at: string | null;
  engaged_at: string | null;
  opted_out_at: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IngestLeadPayload {
  business_name: string;
  phone: string;
  city?: string;
  state?: string;
  google_place_id?: string;
  source?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/** Normaliza teléfono: solo + y dígitos. Indexa debería mandar E.164 (+52...). */
function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '');
}

export function validateIngestPayload(
  body: unknown,
): { ok: true; data: IngestLeadPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'body_invalido' };
  const b = body as Record<string, unknown>;

  const name = typeof b.business_name === 'string' ? b.business_name.trim() : '';
  if (!name || name.length > 200) return { ok: false, error: 'business_name_invalido' };

  const phoneRaw = typeof b.phone === 'string' ? b.phone.trim() : '';
  if (!phoneRaw) return { ok: false, error: 'phone_requerido' };
  const phone = normalizePhone(phoneRaw);
  if (!/^\+?\d{8,15}$/.test(phone)) return { ok: false, error: 'phone_formato_invalido' };

  const out: IngestLeadPayload = { business_name: name, phone };

  if (typeof b.city === 'string' && b.city.trim()) out.city = b.city.trim().slice(0, 120);
  if (typeof b.state === 'string' && b.state.trim()) out.state = b.state.trim().slice(0, 120);
  if (typeof b.google_place_id === 'string' && b.google_place_id.trim()) {
    out.google_place_id = b.google_place_id.trim().slice(0, 200);
  }
  if (typeof b.source === 'string' && b.source.trim()) {
    out.source = b.source.trim().slice(0, 50);
  }
  if (typeof b.notes === 'string') out.notes = b.notes.slice(0, 1000);
  if (b.metadata && typeof b.metadata === 'object' && !Array.isArray(b.metadata)) {
    out.metadata = b.metadata as Record<string, unknown>;
  }

  return { ok: true, data: out };
}

export function validateOptoutPayload(
  body: unknown,
): { ok: true; phone: string; reason: string | null } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'body_invalido' };
  const b = body as Record<string, unknown>;

  const phoneRaw = typeof b.phone === 'string' ? b.phone.trim() : '';
  if (!phoneRaw) return { ok: false, error: 'phone_requerido' };
  const phone = normalizePhone(phoneRaw);
  if (!/^\+?\d{8,15}$/.test(phone)) return { ok: false, error: 'phone_formato_invalido' };

  const reason = typeof b.reason === 'string' && b.reason.trim()
    ? b.reason.trim().slice(0, 500)
    : null;

  return { ok: true, phone, reason };
}

/**
 * Verifica header X-Indexa-Key contra INDEXA_API_KEY.
 * Comparación en tiempo constante para no filtrar por timing.
 */
export function verifyIndexaKey(req: Request): boolean {
  const expected = process.env.INDEXA_API_KEY;
  if (!expected || expected.length < 16) return false; // fail-closed si no está configurado
  const got = req.headers.get('x-indexa-key') ?? '';
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ got.charCodeAt(i);
  }
  return diff === 0;
}

export function partnersLeadLink(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ??
    'https://historias-infinitas.com';
  return `${base}/partners?lead=${encodeURIComponent(token)}`;
}
