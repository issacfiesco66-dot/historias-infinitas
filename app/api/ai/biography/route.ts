import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBiography, BIOGRAPHY_TONES, type BiographyTone } from '@/lib/biography';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Body {
  memorialId: string;
  notes: string;
  tone?: BiographyTone;
}

const VALID_TONES = new Set(BIOGRAPHY_TONES.map((t) => t.id));

/**
 * POST /api/ai/biography
 *
 * Genera un borrador de biografía a partir de viñetas/recuerdos que el dueño
 * del memorial escribe. No persiste nada — devuelve el texto para que el
 * usuario lo revise y edite antes de guardarlo.
 *
 * Requiere sesión. Solo el dueño del memorial puede generar para él.
 * Rate-limit compartido con los demás endpoints de IA (5/hora/usuario).
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
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))),
          },
        },
      );
    }

    const body = (await req.json()) as Body;

    if (!body.memorialId || typeof body.memorialId !== 'string' || body.memorialId.length > 64) {
      return NextResponse.json({ error: 'memorial_id_invalido' }, { status: 400 });
    }
    if (!body.notes || typeof body.notes !== 'string') {
      return NextResponse.json({ error: 'notes_requerido' }, { status: 400 });
    }
    const notes = body.notes.trim();
    if (notes.length < 20) {
      return NextResponse.json(
        { error: 'notes_too_short', hint: 'Escribe al menos un par de recuerdos (mínimo 20 caracteres).' },
        { status: 400 },
      );
    }
    if (notes.length > 4000) {
      return NextResponse.json(
        { error: 'notes_too_long', hint: 'Resume los recuerdos en menos de 4,000 caracteres.' },
        { status: 400 },
      );
    }

    const tone: BiographyTone = body.tone && VALID_TONES.has(body.tone) ? body.tone : 'calido';

    // Ownership check: solo el dueño puede generar para este memorial.
    const { data: memorial, error: mErr } = await supabase
      .from('memorials')
      .select('id, owner_id, name, type, birth_date, passing_date, epitaph')
      .eq('id', body.memorialId)
      .single();

    if (mErr || !memorial || memorial.owner_id !== user.id) {
      return NextResponse.json({ error: 'Memorial no encontrado' }, { status: 404 });
    }

    const { text, model } = await generateBiography({
      type: memorial.type,
      name: memorial.name,
      birthDate: memorial.birth_date,
      passingDate: memorial.passing_date,
      epitaph: memorial.epitaph,
      notes,
      tone,
    });

    return NextResponse.json({
      ok: true,
      text,
      tone,
      model,
    });
  } catch (err: any) {
    console.error('[api/ai/biography]', err);
    const msg = err?.message ?? 'Error interno';
    const userSafe =
      msg === 'notes_too_short' || msg === 'notes_too_long'
        ? msg
        : 'No pudimos generar el borrador. Intenta de nuevo en un momento.';
    return NextResponse.json({ error: userSafe }, { status: 500 });
  }
}
