import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

type AllowedMime = 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * Detecta MIME por magic bytes en lugar de confiar en el Content-Type.
 * Por qué: three.js (el motor de model-viewer) construye un Blob con el
 * `mimeType` declarado en el GLB y lo pasa a <img src=objectURL>. Si el
 * MIME no coincide con los bytes reales, el <img> falla a decodificar
 * silenciosamente y la textura queda vacía (plano blanco visible en AR).
 */
function sniffMime(b: Uint8Array): AllowedMime | null {
  if (b.length < 12) return null;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return 'image/png';
  }
  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return 'image/jpeg';
  }
  // WebP: "RIFF" ... "WEBP"
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

async function fetchImage(url: string): Promise<{ bytes: Uint8Array; mime: AllowedMime } | { error: string }> {
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

  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength > MAX_IMAGE_BYTES) return { error: 'image_too_large' };

  const mime = sniffMime(buf);
  if (!mime) {
    console.warn('[ar/generate-frame] mime no reconocido — primeros bytes:',
      Array.from(buf.slice(0, 12)).map((x) => x.toString(16).padStart(2, '0')).join(' '),
    );
    return { error: 'image_mime_no_permitido' };
  }
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
      .select('id, owner_id, portrait_ai_url, cover_photo_url, slug, status')
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

    // Upload a Storage con path VERSIONADO — cada regeneración va a un archivo
    // nuevo. Esto elimina problemas de caché del CDN de Supabase, porque un
    // `upsert` al mismo path puede seguir sirviendo los bytes antiguos durante
    // el cacheControl (3600 s). Archivo versionado = URL completamente nueva
    // para el CDN y para cualquier navegador que tuviera el archivo guardado.
    const admin = createAdminClient();
    const stamp = Date.now();
    const newPath = `${memorial.id}/ar-frame-${stamp}.glb`;
    const { error: upErr } = await admin.storage
      .from('memorials')
      .upload(newPath, glb, {
        contentType: 'model/gltf-binary',
        upsert: false,
        cacheControl: '3600',
      });

    if (upErr) {
      console.error('[ar/generate-frame] upload falló:', upErr.message);
      return NextResponse.json({ error: 'storage_upload_fallido' }, { status: 500 });
    }

    // Borra versiones anteriores del mismo memorial (best-effort, no bloquea).
    try {
      const { data: older } = await admin.storage
        .from('memorials')
        .list(memorial.id, { limit: 100 });
      const stale = (older ?? [])
        .filter((f) => f.name.startsWith('ar-frame-') && f.name.endsWith('.glb') && f.name !== `ar-frame-${stamp}.glb`)
        .map((f) => `${memorial.id}/${f.name}`);
      if (stale.length) await admin.storage.from('memorials').remove(stale);
    } catch (e) {
      console.warn('[ar/generate-frame] cleanup previo falló (no bloquea):', e);
    }

    const arModelUrl = admin.storage.from('memorials').getPublicUrl(newPath).data.publicUrl;

    const { error: updErr } = await admin
      .from('memorials')
      .update({ ar_model_url: arModelUrl })
      .eq('id', memorial.id);

    if (updErr) {
      console.error('[ar/generate-frame] update falló:', updErr.message);
      return NextResponse.json({ error: 'db_update_fallido' }, { status: 500 });
    }

    // Invalida el cache ISR de la página pública para que el móvil vea el AR
    // de inmediato en lugar de esperar los 60 s de revalidate por defecto.
    if (memorial.status === 'publicado' && memorial.slug) {
      try {
        revalidatePath(`/memorial/${memorial.slug}`);
      } catch (e) {
        console.warn('[ar/generate-frame] revalidate falló (no bloquea):', e);
      }
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
