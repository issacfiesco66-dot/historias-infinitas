import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  generateArtisticPortrait,
  buildPortraitPrompt,
  PORTRAIT_STYLES,
  type PortraitStyleId,
} from '@/lib/replicate';
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

    const body = (await req.json()) as Body;
    if (!body.memorialId || !body.imageUrl) {
      return NextResponse.json({ error: 'Parámetros incompletos' }, { status: 400 });
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
