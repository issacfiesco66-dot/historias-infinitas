import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildPhotoFrameGLB, readImageDimensions } from '@/lib/ar/glb-builder';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/ar/generate-frame
 *
 * Genera un .glb con la foto del memorial flotando dentro de un marco dorado.
 * El archivo se sube a Storage y se guarda en memorials.ar_model_url.
 *
 * Requisitos:
 *  - Sesión válida.
 *  - El memorial debe pertenecer al usuario.
 *  - La imagen fuente debe provenir de nuestro Storage (SSRF protegido).
 */

interface Body {
  memorialId: string;
  /** URL de la foto a usar como textura (opcional — si no, se usa la mejor disponible). */
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

/** Caps image download to 8 MB to avoid abuse. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

async function fetchImage(url: string): Promise<{ bytes: Uint8Array; mime: 'image/jpeg' | 'image/png' | 'image/webp' } | { error: string }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 15_000);
  let res: Response;
  try {
    res = await fetch(url, { signal: ac.signal, redirect: 'error' });
  } catch {
    clearTimeout(timer);
    return { error: 'image_fetch_failed' };
  }
  clearTimeout(timer);
  if (!res.ok) return { error: 'image_not_ok' };

  const contentLength = Number(res.headers.get('content-length') ?? 0);
  if (contentLength && contentLength > MAX_IMAGE_BYTES) {
    return { error: 'image_too_large' };
  }

  const ct = (res.headers.get('content-type') ?? '').toLowerCase();
  let mime: 'image/jpeg' | 'image/png' | 'image/webp';
  if (ct.includes('jpeg') || ct.includes('jpg'))      mime = 'image/jpeg';
  else if (ct.includes('png'))                        mime = 'image/png';
  else if (ct.includes('webp'))                       mime = 'image/webp';
  else return { error: 'image_mime_no_permitido' };

  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength > MAX_IMAGE_BYTES) return { error: 'image_too_large' };
  return { bytes: buf, mime };
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    if (!body.memorialId || typeof body.memorialId !== 'string' || body.memorialId.length > 64) {
      return NextResponse.json({ error: 'memorial_id_invalido' }, { status: 400 });
    }

    // Ownership check + obtener fotos disponibles
    const { data: memorial, error: mErr } = await supabase
      .from('memorials')
      .select('id, owner_id, portrait_ai_url, cover_photo_url')
      .eq('id', body.memorialId)
      .single();

    if (mErr || !memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: 'Memorial no encontrado' }, { status: 404 });
    }

    // Elegir imagen: preferencia → imageUrl recibido → portrait_ai_url → cover_photo_url
    const candidate = body.imageUrl ?? memorial.portrait_ai_url ?? memorial.cover_photo_url;
    if (!candidate) {
      return NextResponse.json(
        { error: 'sin_imagen', hint: 'Sube al menos una foto o genera el retrato IA antes.' },
        { status: 400 },
      );
    }
    if (!isSafeImageUrl(candidate)) {
      return NextResponse.json({ error: 'imagen_no_permitida' }, { status: 400 });
    }

    const imgRes = await fetchImage(candidate);
    if ('error' in imgRes) {
      return NextResponse.json({ error: imgRes.error }, { status: 400 });
    }

    const dims = readImageDimensions(imgRes.bytes);
    const aspect = dims && dims.width && dims.height
      ? dims.width / dims.height
      : 0.75;

    const glb = buildPhotoFrameGLB({
      imageBytes: imgRes.bytes,
      imageMimeType: imgRes.mime,
      aspectRatio: aspect,
    });

    // Upload a Storage con service_role para ignorar RLS del bucket.
    const admin = createAdminClient();
    const path = `${memorial.id}/ar-frame.glb`;
    const { error: upErr } = await admin.storage
      .from('memorials')
      .upload(path, glb, {
        contentType: 'model/gltf-binary',
        upsert: true,
        cacheControl: '3600',
      });

    if (upErr) {
      console.error('[ar/generate-frame] upload falló:', upErr.message);
      return NextResponse.json({ error: 'storage_upload_fallido' }, { status: 500 });
    }

    const publicUrl = admin.storage.from('memorials').getPublicUrl(path).data.publicUrl;
    // Cache-busting simple (la ruta no cambia entre regeneraciones).
    const arModelUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updErr } = await admin
      .from('memorials')
      .update({ ar_model_url: arModelUrl })
      .eq('id', memorial.id);

    if (updErr) {
      console.error('[ar/generate-frame] update falló:', updErr.message);
      return NextResponse.json({ error: 'db_update_fallido' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      ar_model_url: arModelUrl,
      bytes: glb.byteLength,
      aspect,
    });
  } catch (err: any) {
    console.error('[api/ar/generate-frame]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Error interno' },
      { status: 500 },
    );
  }
}
