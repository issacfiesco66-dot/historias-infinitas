import 'server-only';
import Replicate from 'replicate';
import {
  PORTRAIT_STYLES,
  NEGATIVE_PROMPT,
  getStyle,
  type PortraitStyleId,
} from './portrait-styles';

// Re-export para quien importe desde '@/lib/replicate' (server only).
export {
  PORTRAIT_STYLES,
  NEGATIVE_PROMPT,
  getStyle,
  type PortraitStyleId,
};

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

/* ============================================================================
 *  Composición del prompt — formato INSTRUCCIÓN para Flux Kontext
 *  Kontext no usa tags estilo SDXL; espera una instrucción de edición.
 * ========================================================================== */

export interface BuildPromptInput {
  subject?: string | null;
  style: PortraitStyleId;
  type?: 'mascota' | 'ser_querido';
}

export function buildPortraitPrompt({ style, type }: BuildPromptInput) {
  const s = getStyle(style);
  const subjectWord = type === 'mascota' ? 'animal' : 'person';
  const preserveList = type === 'mascota'
    ? 'breed, fur color, fur length, markings, ear shape, eye color and snout shape'
    : 'skin tone, hair color, hair style, eye color, jawline and facial structure';

  // Flux Kontext espera instrucciones naturales. Estrategia:
  //  1. Anclar primero la PRESERVACIÓN (antes del cambio).
  //  2. Luego pedir sólo el cambio estilístico.
  //  3. Cerrar con una restricción explícita anti-deformación.
  return [
    // Anclaje identidad: Kontext Max responde mejor si la preservación
    // llega ANTES del prompt de estilo.
    `Preserve identity exactly. This is a memorial portrait — the ${subjectWord} in the input photograph must remain 100% recognizable.`,
    `Keep the exact same face, ${preserveList}, proportions, pose, expression and framing.`,
    // Transformación sólo de estilo / medio:
    `Repaint the image in the style of ${s.stylePrompt}.`,
    `Only the artistic medium and lighting may change. Do not redraw, restructure or idealize the subject.`,
    `Add cinematic soft lighting and a gentle, reverent atmosphere — museum-quality fine-art finish.`,
    // Restricciones negativas explícitas:
    `Do not alter anatomy, age, weight, breed or gender. Do not add or remove accessories. Do not stylize the face into a different person or animal.`,
  ].join(' ');
}

/* ============================================================================
 *  Generación — Flux Kontext Max (identity-preserving image editing, premium)
 *
 *  Por qué este modelo:
 *   - Flux Kontext Max duplica la fidelidad de Pro a rasgos faciales y
 *     anatomía. Específicamente diseñado para edición preservando sujeto.
 *   - SDXL img2img deforma rasgos aún con prompt_strength bajo.
 *   - Coste ~$0.08/imagen (vs $0.04 de Pro) — aceptable para un memorial.
 *
 *  Parámetros clave:
 *   - `prompt_upsampling: true` → Kontext Max se beneficia de esto para
 *     captar mejor la instrucción de "preservar identidad".
 *   - `safety_tolerance: 2` → balance entre permisividad y seguridad.
 * ========================================================================== */

const FLUX_KONTEXT_MODEL = 'black-forest-labs/flux-kontext-max';

export interface GenerateArtisticPortraitInput {
  imageUrl: string;
  subject?: string | null;
  type?: 'mascota' | 'ser_querido';
  style?: PortraitStyleId;
}

export async function generateArtisticPortrait(input: GenerateArtisticPortraitInput) {
  const style: PortraitStyleId = input.style ?? 'oleo';

  const prompt = buildPortraitPrompt({
    subject: input.subject,
    style,
    type: input.type,
  });

  const output = await replicate.run(FLUX_KONTEXT_MODEL, {
    input: {
      prompt,
      input_image: input.imageUrl,
      aspect_ratio: 'match_input_image',
      output_format: 'jpg',
      safety_tolerance: 2,
      prompt_upsampling: true,
    },
  });

  // Kontext devuelve un stream/URL; normalizamos a string.
  let url: string;
  if (typeof output === 'string') {
    url = output;
  } else if (Array.isArray(output)) {
    url = output[0] as unknown as string;
  } else if (output && typeof (output as any).url === 'function') {
    url = (output as any).url();
  } else {
    url = String(output);
  }

  return { url, prompt, style };
}
