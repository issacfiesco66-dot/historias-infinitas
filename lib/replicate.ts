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

  // Flux Kontext responde mejor a instrucciones naturales en inglés.
  // La clave: pedir transformación de ESTILO, no de contenido — y dejar
  // explícito qué se debe preservar.
  return [
    `Transform this photograph into a ${s.stylePrompt}.`,
    `Keep the exact same ${subjectWord}, identity, face, features, ${
      type === 'mascota' ? 'breed, fur color, markings' : 'skin tone, hair'
    }, proportions, pose and expression from the original image.`,
    `Do not alter the subject's anatomy or identity. This is a memorial portrait — fidelity to the original person or animal is essential.`,
    `Add cinematic lighting, a soft ethereal atmosphere and emotional depth, museum-quality fine-art finish.`,
  ].join(' ');
}

/* ============================================================================
 *  Generación — Flux Kontext Pro (identity-preserving image editing)
 *
 *  Por qué este modelo:
 *   - SDXL img2img, incluso con prompt_strength bajo, deforma rasgos (rostro,
 *     raza, proporciones). No fue entrenado para preservar identidad.
 *   - Flux Kontext es un modelo de EDICIÓN: toma la foto de entrada como
 *     referencia fija y solo cambia el estilo pedido en el prompt.
 *   - Coste ~$0.04/imagen, perfectamente viable para un memorial.
 * ========================================================================== */

const FLUX_KONTEXT_MODEL = 'black-forest-labs/flux-kontext-pro';

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
      prompt_upsampling: false,
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
