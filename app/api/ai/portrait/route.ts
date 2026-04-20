import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  generateArtisticPortrait,
  buildPortraitPrompt,
  PORTRAIT_STYLES,
  type PortraitStyleId,
} from '@/lib/replicate';
import { checkRateLimit } from '@/lib/rate-limit';
import type { MemorialType } from '@/types/database';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Body {
  memorialId: string;
  imageUrl: string;
  /** 'oleo' | 'celestial' | 'acuarela' — por defecto 'oleo'. */
  style?: PortraitStyleId;
}

/**
 * Allowlist de hosts desde los que aceptamos imágenes para enviar a Replicate.
 * Evita SSRF hacia recursos internos (169.254.169.254 AWS metadata, localhost,
 * servicios internos de Vercel, etc.) y ataques de rebind-DNS.
 */
const ALLOWED_IMAGE_HOSTS = (() => {
  const list = new Set<string>([
    'replicate.delivery',
    'pbxt.replicate.delivery',
  ]);
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (u) list.add(new URL(u).hostname); // e.g. lwiigdttrxvqsyglpool.supabase.co
  } catch { /* ignore */ }
  return list;
})();

function isSafeImageUrl(raw: string): boolean {
  let url: URL;
  try { url = new URL(raw); } catch { return false; }
  if (url.protocol !== 'https:') return false;
  if (!ALLOWED_IMAGE_HOSTS.has(url.hostname)) return false;
  // Bloquea credenciales inline (user@host) y puertos raros.
  if (url.username || url.password) return false;
  if (url.port && url.port !== '443') return false;
  return true;
}

/**
 * POST /api/ai/portrait
 *
 * Genera un retrato artístico (SDXL + refiner) a partir de una foto base.
 * Requiere sesión. Solo genera para memoriales propios.
 *
 * El cliente envía solo el `style` (id). El prompt real se compone en el
 * servidor con la plantilla maestra de `lib/replicate.ts` — el frontend
 * nunca puede inyectar prompts arbitrarios.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const rl = await checkRateLimit('ai', user.id);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'rate_limited', reset: rl.reset },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))) } },
      );
    }

    const body = (await req.json()) as Body;
    if (!body.memorialId || !body.imageUrl) {
      return NextResponse.json({ error: 'Parámetros incompletos' }, { status: 400 });
    }
    if (typeof body.memorialId !== 'string' || body.memorialId.length > 64) {
      return NextResponse.json({ error: 'memorial_id_invalido' }, { status: 400 });
    }
    if (!isSafeImageUrl(body.imageUrl)) {
      return NextResponse.json(
        { error: 'imagen_no_permitida', hint: 'La imagen debe venir de nuestro almacenamiento.' },
        { status: 400 },
      );
    }

    // Valida el id del estilo (si viene) contra el catálogo canónico.
    const style: PortraitStyleId =
      body.style && PORTRAIT_STYLES.some((s) => s.id === body.style)
        ? body.style
        : 'oleo';

    // Verifica ownership + obtiene nombre del memorial como SUBJECT del prompt.
    const { data: memorial, error: mErr } = await supabase
      .from('memorials')
      .select('id, owner_id, name, type')
      .eq('id', body.memorialId)
      .single();

    if (mErr || !memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: 'Memorial no encontrado' }, { status: 404 });
    }

    const admin = createAdminClient();
    const subject = memorial.name;
    const type = memorial.type as MemorialType;

    // Registra la generación como 'procesando' con el prompt definitivo.
    const { data: gen, error: gErr } = await admin
      .from('ai_generations')
      .insert({
        memorial_id: memorial.id,
        user_id: user.id,
        source_url: body.imageUrl,
        prompt: buildPortraitPrompt({ subject, style, type }),
        model: 'black-forest-labs/flux-kontext-pro',
        status: 'procesando',
      })
      .select('id')
      .single();
    if (gErr) throw gErr;

    try {
      const { url, prompt } = await generateArtisticPortrait({
        imageUrl: body.imageUrl,
        subject,
        type,
        style,
      });

      // Marca como completada + actualiza memorial.
      await admin
        .from('ai_generations')
        .update({
          output_url: url,
          prompt,
          status: 'completado',
          completed_at: new Date().toISOString(),
        })
        .eq('id', gen!.id);

      await admin
        .from('memorials')
        .update({ portrait_ai_url: url })
        .eq('id', memorial.id);

      return NextResponse.json({
        ok: true,
        output_url: url,
        generation_id: gen!.id,
        style,
      });
    } catch (err: any) {
      await admin
        .from('ai_generations')
        .update({ status: 'fallido', error: String(err?.message ?? err) })
        .eq('id', gen!.id);
      throw err;
    }
  } catch (err: any) {
    console.error('[api/ai/portrait]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Error interno' },
      { status: 500 },
    );
  }
}
