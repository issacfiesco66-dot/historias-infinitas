import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { animatePortrait } from '@/lib/replicate';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * POST /api/ai/animate-portrait
 *
 * Genera un video corto (2-4 s) del retrato "cobrando vida" vía Replicate
 * (Stable Video Diffusion por defecto). Se guarda en Storage y se vincula
 * a `memorials.ar_video_url` — el ARPortal ya reproduce ese video cuando
 * existe, así que no hay que tocar la página pública.
 *
 * Requisitos:
 *  - Sesión válida
 *  - El memorial debe pertenecer al usuario
 *  - La imagen fuente debe provenir de nuestro Storage o de Replicate
 */

interface Body {
  memorialId: string;
  /** URL de la foto a animar. Si no viene, se usa portrait_ai_url → cover_photo_url. */
  imageUrl?: string;
}

const ALLOWED_IMAGE_HOSTS = (() => {
  const list = new Set<string>([
    'replicate.delivery',
    'pbxt.replicate.delivery',
  ]);
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (u) list.add(new URL(u).hostname);
  } catch { /* ignore */ }
  return list;
})();

function isSafeImageUrl(raw: string): boolean {
  let url: URL;
  try { url = new URL(raw); } catch { return false; }
  if (url.protocol !== 'https:') return false;
  if (!ALLOWED_IMAGE_HOSTS.has(url.hostname)) return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== '443') return false;
  return true;
}

/** Límite prudente para el video resultante (evita subidas enormes a Storage). */
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

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
    if (!body.memorialId || typeof body.memorialId !== 'string' || body.memorialId.length > 64) {
      return NextResponse.json({ error: 'memorial_id_invalido' }, { status: 400 });
    }

    // Ownership + obtener imagen candidata
    const { data: memorial, error: mErr } = await supabase
      .from('memorials')
      .select('id, owner_id, name, portrait_ai_url, cover_photo_url, slug, status')
      .eq('id', body.memorialId)
      .single();

    if (mErr || !memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: 'Memorial no encontrado' }, { status: 404 });
    }

    const candidate = body.imageUrl ?? memorial.portrait_ai_url ?? memorial.cover_photo_url;
    if (!candidate) {
      return NextResponse.json(
        { error: 'sin_imagen', hint: 'Genera primero el retrato IA o sube una foto de portada.' },
        { status: 400 },
      );
    }
    if (!isSafeImageUrl(candidate)) {
      return NextResponse.json({ error: 'imagen_no_permitida' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Registro en ai_generations para trazabilidad + debugging
    const { data: gen, error: gErr } = await admin
      .from('ai_generations')
      .insert({
        memorial_id: memorial.id,
        user_id: user.id,
        source_url: candidate,
        prompt: 'video_animation',
        model: process.env.REPLICATE_VIDEO_MODEL || 'stability-ai/stable-video-diffusion',
        status: 'procesando',
      })
      .select('id')
      .single();
    if (gErr) throw gErr;

    let videoUrl: string;
    try {
      const result = await animatePortrait({
        imageUrl: candidate,
        subject: memorial.name,
      });
      videoUrl = result.url;
    } catch (err: any) {
      await admin
        .from('ai_generations')
        .update({ status: 'fallido', error: String(err?.message ?? err) })
        .eq('id', gen!.id);

      // Traducir errores de Replicate a mensajes accionables para el usuario.
      // 429 = throttling por billing (<$5 de crédito en Replicate) o burst.
      const msg = String(err?.message ?? err);
      if (msg.includes('429') || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('throttled')) {
        return NextResponse.json(
          {
            error: 'Servicio de IA saturado',
            hint: 'Estamos procesando muchas animaciones. Intenta de nuevo en 1 minuto.',
          },
          { status: 429 },
        );
      }
      if (msg.includes('402') || msg.toLowerCase().includes('insufficient')) {
        return NextResponse.json(
          {
            error: 'Animación temporalmente no disponible',
            hint: 'Vuelve a intentar en unos minutos.',
          },
          { status: 503 },
        );
      }
      throw err;
    }

    // Descargar el video y subirlo a NUESTRO Storage (igual que el retrato)
    // — así cualquier downstream (AR portal, CSP) ve un origen conocido.
    let videoBytes: Uint8Array;
    try {
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error(`video_fetch_${res.status}`);
      const contentLength = Number(res.headers.get('content-length') ?? 0);
      if (contentLength && contentLength > MAX_VIDEO_BYTES) {
        throw new Error('video_too_large');
      }
      videoBytes = new Uint8Array(await res.arrayBuffer());
      if (videoBytes.byteLength > MAX_VIDEO_BYTES) throw new Error('video_too_large');
    } catch (err: any) {
      await admin
        .from('ai_generations')
        .update({ status: 'fallido', error: `download: ${err?.message ?? err}` })
        .eq('id', gen!.id);
      throw err;
    }

    const stamp = Date.now();
    const path = `${memorial.id}/portrait-anim-${stamp}.mp4`;
    const { error: upErr } = await admin.storage
      .from('memorials')
      .upload(path, videoBytes, {
        contentType: 'video/mp4',
        upsert: false,
        cacheControl: '3600',
      });

    if (upErr) {
      console.error('[ai/animate-portrait] upload falló:', upErr.message);
      await admin
        .from('ai_generations')
        .update({ status: 'fallido', error: `upload: ${upErr.message}` })
        .eq('id', gen!.id);
      return NextResponse.json({ error: 'storage_upload_fallido' }, { status: 500 });
    }

    // Limpia animaciones previas del mismo memorial
    try {
      const { data: older } = await admin.storage
        .from('memorials')
        .list(memorial.id, { limit: 100 });
      const stale = (older ?? [])
        .filter((f) => f.name.startsWith('portrait-anim-') && f.name.endsWith('.mp4') && f.name !== `portrait-anim-${stamp}.mp4`)
        .map((f) => `${memorial.id}/${f.name}`);
      if (stale.length) await admin.storage.from('memorials').remove(stale);
    } catch (e) {
      console.warn('[ai/animate-portrait] cleanup previo falló (no bloquea):', e);
    }

    const publicUrl = admin.storage.from('memorials').getPublicUrl(path).data.publicUrl;

    await admin
      .from('ai_generations')
      .update({
        output_url: publicUrl,
        status: 'completado',
        completed_at: new Date().toISOString(),
      })
      .eq('id', gen!.id);

    const { error: updErr } = await admin
      .from('memorials')
      .update({ ar_video_url: publicUrl })
      .eq('id', memorial.id);

    if (updErr) {
      console.error('[ai/animate-portrait] update falló:', updErr.message);
      return NextResponse.json({ error: 'db_update_fallido' }, { status: 500 });
    }

    if (memorial.status === 'publicado' && memorial.slug) {
      try {
        revalidatePath(`/memorial/${memorial.slug}`);
      } catch (e) {
        console.warn('[ai/animate-portrait] revalidate falló (no bloquea):', e);
      }
    }

    return NextResponse.json({
      ok: true,
      ar_video_url: publicUrl,
      generation_id: gen!.id,
      bytes: videoBytes.byteLength,
    });
  } catch (err: any) {
    // Log estructurado para Vercel — `cause` guarda el error original de
    // Replicate (con response.data si vino).
    console.error('[api/ai/animate-portrait] ERROR:', {
      message: err?.message,
      cause: err?.cause?.message ?? err?.cause,
      stack: err?.stack?.split('\n').slice(0, 4),
    });
    return NextResponse.json(
      {
        error: err?.message ?? 'Error interno',
        // `detail` permite al front mostrar la causa exacta (sin exponer
        // stack completo).
        detail: err?.cause?.message ?? undefined,
      },
      { status: 500 },
    );
  }
}
