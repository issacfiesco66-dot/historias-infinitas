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

/* ============================================================================
 *  Animación de retrato — image-to-video para "retrato que respira"
 *
 *  Caso de uso: los memoriales en móvil fallaban en Scene Viewer (AR nativo)
 *  con el cuadro plano. Un video corto (2-4 s) del retrato cobrando vida
 *  —parpadeo, respiración, sonrisa sutil— tiene más impacto emocional y
 *  reproduce en el 100 % de los dispositivos via HTML5 <video>.
 *
 *  Modelo por defecto: stable-video-diffusion. Reemplazable vía
 *  REPLICATE_VIDEO_MODEL para probar alternativas (minimax, kling, runway)
 *  sin tocar código.
 *
 *  Coste: ~$0.30-0.70 USD por generación (ver análisis de costos en CLAUDE.md).
 * ========================================================================== */

/**
 * Modelo por defecto — MiniMax video-01-live.
 *
 * Por qué: está entrenado específicamente para "still portrait → subtle
 * motion" (respiración, parpadeo, micro-expresiones) preservando la
 * identidad facial. Es EXACTAMENTE lo que queremos para un retrato de
 * memorial. SVD da más artefactos en rostros humanos/mascotas.
 *
 * Coste: ~$0.50 USD por generación (2-4 s de video). Con $9 de crédito
 * alcanza para ~18 animaciones.
 *
 * Reemplazable vía `REPLICATE_VIDEO_MODEL`. Alternativas probadas:
 *   · minimax/video-01            (más genérico, img o texto)
 *   · kwaivgi/kling-v2.0          (Kling 2, excelente para humanos)
 *   · bytedance/seedance-1-pro    (Bytedance Seedance)
 *
 * IMPORTANTE: cada modelo tiene su propio schema de input. Detectamos
 * la familia abajo y mandamos solo los campos válidos.
 */
const DEFAULT_VIDEO_MODEL = 'minimax/video-01-live';
const VIDEO_MODEL = (process.env.REPLICATE_VIDEO_MODEL || DEFAULT_VIDEO_MODEL) as `${string}/${string}`;

export interface AnimatePortraitInput {
  imageUrl: string;
  subject?: string | null;
}

export async function animatePortrait({ imageUrl, subject }: AnimatePortraitInput) {
  const motionPrompt = subject
    ? `A reverent memorial portrait of ${subject} softly coming to life. Subtle natural breathing, gentle eye blink, warm expression. Preserve every facial feature exactly. Cinematic stillness, no camera motion.`
    : 'A reverent memorial portrait softly coming to life with subtle breathing and a gentle blink. Preserve every facial feature. No camera motion.';

  // Construcción de input por familia de modelo (evita 422 por campos extra).
  const modelLower = VIDEO_MODEL.toLowerCase();
  let input: Record<string, unknown>;

  if (modelLower.includes('minimax') || modelLower.includes('kling') || modelLower.includes('hailuo')) {
    // MiniMax / Kling / Hailuo — "bring still to life" con prompt textual
    input = {
      prompt: motionPrompt,
      first_frame_image: imageUrl,
      prompt_optimizer: true,
    };
  } else if (modelLower.includes('luma') || modelLower.includes('ray')) {
    // Luma Ray/Dream Machine
    input = {
      prompt: motionPrompt,
      start_image_url: imageUrl,
      loop: false,
    };
  } else {
    // Stable Video Diffusion (y variantes XT)
    input = {
      input_image: imageUrl,
      video_length: '25_frames_with_svd_xt',
      sizing_strategy: 'maintain_aspect_ratio',
      frames_per_second: 6,
      motion_bucket_id: 80,
      cond_aug: 0.02,
    };
  }

  let output: unknown;
  try {
    output = await replicate.run(VIDEO_MODEL, { input });
  } catch (err: any) {
    // Enriquecemos el error con el contexto del modelo + input para que en
    // Vercel logs se vea exactamente qué falló (p. ej. "Invalid input:
    // field 'motion_bucket_id' not recognized by model X").
    const detail = err?.response?.data ?? err?.detail ?? err?.message ?? String(err);
    const enriched = new Error(
      `Replicate animatePortrait falló (model=${VIDEO_MODEL}): ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`,
    );
    (enriched as any).cause = err;
    throw enriched;
  }

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

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(
      `Replicate devolvió output inesperado para ${VIDEO_MODEL}: ${JSON.stringify(output)}`,
    );
  }

  return { url, prompt: motionPrompt, model: VIDEO_MODEL };
}
