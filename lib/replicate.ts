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

const DEFAULT_VIDEO_MODEL = 'stability-ai/stable-video-diffusion';
const VIDEO_MODEL = (process.env.REPLICATE_VIDEO_MODEL || DEFAULT_VIDEO_MODEL) as `${string}/${string}`;

export interface AnimatePortraitInput {
  imageUrl: string;
  subject?: string | null;
}

export async function animatePortrait({ imageUrl, subject }: AnimatePortraitInput) {
  // Input por modelo. El API de Replicate acepta ambos formatos —
  // los modelos ignoran campos que no reconocen, así que pasamos los dos.
  const motionPrompt = subject
    ? `A reverent memorial portrait of ${subject} softly coming to life. Subtle natural breathing, gentle eye blink, warm expression. Preserve every facial feature exactly. Cinematic stillness, no camera motion.`
    : 'A reverent memorial portrait softly coming to life with subtle breathing and a gentle blink. Preserve every facial feature. No camera motion.';

  const output = await replicate.run(VIDEO_MODEL, {
    input: {
      // SVD (stability-ai/stable-video-diffusion)
      input_image: imageUrl,
      video_length: '25_frames_with_svd_xt',
      sizing_strategy: 'maintain_aspect_ratio',
      frames_per_second: 6,
      motion_bucket_id: 80,
      cond_aug: 0.02,
      // Minimax video-01-live / Kling — ignorados por SVD
      first_frame_image: imageUrl,
      prompt: motionPrompt,
      prompt_optimizer: true,
    },
  });

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

  return { url, prompt: motionPrompt, model: VIDEO_MODEL };
}
