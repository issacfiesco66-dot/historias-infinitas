import 'server-only';
import { replicate } from './replicate';
import type { MemorialType } from '@/types/database';
import { BIOGRAPHY_TONES, type BiographyTone } from './biography-tones';

/**
 * Biografía asistida por IA — "El Hilo de la Vida".
 *
 * Toma recuerdos sueltos que la familia escribe en viñetas y los organiza
 * en un texto cálido, digno y sereno. Siempre es un ASISTENTE: el usuario
 * revisa y edita el resultado antes de guardar. Nunca auto-publica.
 *
 * El prompt tiene reglas inviolables para proteger a familias en duelo:
 *  · No inventar hechos (nombres, lugares, fechas, emociones).
 *  · No mencionar causa de muerte.
 *  · No asumir religión ni usar clichés del más allá.
 *  · No usar frases vacías ("único", "irrepetible", "dejó huella").
 *  · Español de México, 180-350 palabras, tercera persona.
 *
 * Modelo por defecto: Llama 3.1 405B via Replicate (excelente español,
 * ~$0.003 por generación). Override con REPLICATE_TEXT_MODEL.
 */

// Re-export para que quienes importen desde '@/lib/biography' no se rompan.
export { BIOGRAPHY_TONES, type BiographyTone };

export interface BiographyInput {
  type: MemorialType;
  name: string;
  birthDate?: string | null;
  passingDate?: string | null;
  epitaph?: string | null;
  /** Recuerdos en viñetas — lo que la familia escribió, sin orden. */
  notes: string;
  tone?: BiographyTone;
}

// Llama 3 70B — fiable, buen español, ~$0.001 USD por generación, schema
// estable (usa `max_new_tokens`). 3.1 405B es mejor en prosa pero cambia
// el schema (`max_tokens`) y a veces no responde vía .run() por tiempo de
// cold-start. Override con REPLICATE_TEXT_MODEL si quieres probar otro.
const DEFAULT_TEXT_MODEL = 'meta/meta-llama-3-70b-instruct';
const TEXT_MODEL = (process.env.REPLICATE_TEXT_MODEL || DEFAULT_TEXT_MODEL) as `${string}/${string}`;

const SYSTEM_PROMPT = `Eres un escritor con empatía y calma que ayuda a familias en duelo a redactar la biografía de un ser querido o una mascota que falleció. Tu trabajo es convertir los recuerdos sueltos que te comparten en un texto cálido, digno y sereno.

REGLAS INVIOLABLES:
1. Usa SOLO los hechos que te proporcionan. NUNCA inventes nombres de personas, lugares, fechas, eventos, hobbies, enfermedades, emociones ni detalles que no estén explícitamente mencionados.
2. Si los datos son escasos, escribe un texto breve y honesto — es preferible un texto corto y verdadero a uno largo e inventado.
3. NO menciones la causa de muerte ni cómo ocurrió.
4. NO asumas religión ni creencias espirituales. NO uses frases como "descansa en paz", "está en un lugar mejor", "desde el cielo", "ángel", "Dios lo/la tenga", u otras referencias al más allá.
5. NO uses clichés vacíos ("fue una persona única", "dejó huella imborrable", "se fue un ángel", "luchador incansable", "siempre con una sonrisa").
6. NO uses adjetivos hiperbólicos ("increíble", "extraordinario", "maravilloso", "inigualable"). Prefiere la especificidad concreta sobre la alabanza abstracta.
7. Tercera persona, tiempo pasado cuando corresponda.
8. Español de México, tono cálido sin empalagar. Evita diminutivos excesivos.
9. Longitud: entre 180 y 350 palabras. Nunca más.
10. Cierra con una frase breve que se derive naturalmente de los hechos, no un cliché.

FORMATO DE SALIDA:
Devuelve SOLO el texto de la biografía. Sin encabezados, sin comillas, sin comentarios previos ("Aquí tienes…"), sin disclaimers, sin despedidas. Solo el texto listo para publicar.`;

function toneGuidance(tone: BiographyTone): string {
  switch (tone) {
    case 'intimo':
      return 'Escribe con registro cercano, como una carta a la familia — sin dejar de usar tercera persona.';
    case 'formal':
      return 'Escribe con registro sobrio y cuidado, apto para una ceremonia o nota de prensa.';
    case 'calido':
    default:
      return 'Escribe con registro cálido y sereno, humano y sincero.';
  }
}

function buildUserPrompt(input: BiographyInput): string {
  const isPet = input.type === 'mascota';
  const kindLabel = isPet ? 'mascota' : 'ser querido';
  const pronounGuidance = isPet
    ? 'Refiérete a la mascota por su nombre o como "el/la compañero/a" según corresponda al contexto. Puedes mencionar a "quienes lo/la cuidaron" en lugar de "familia" si queda mejor.'
    : 'Refiérete a la persona por su nombre o pronombre adecuado según el nombre. Puedes mencionar a "quienes lo/la acompañaron" o "su familia" cuando sea natural.';

  const lines: string[] = [];
  lines.push(`Tipo: ${kindLabel}`);
  lines.push(`Nombre: ${input.name.trim()}`);
  if (input.birthDate) lines.push(`Fecha de nacimiento: ${input.birthDate}`);
  if (input.passingDate) lines.push(`Fecha de fallecimiento: ${input.passingDate}`);
  if (input.epitaph && input.epitaph.trim()) {
    lines.push(`Epitafio elegido por la familia: "${input.epitaph.trim()}"`);
  }

  lines.push('');
  lines.push('Recuerdos compartidos por la familia (sin orden particular):');
  lines.push(input.notes.trim());

  lines.push('');
  lines.push(toneGuidance(input.tone ?? 'calido'));
  lines.push(pronounGuidance);
  lines.push('');
  lines.push('Escribe ahora la biografía. Recuerda: usa solo los hechos de arriba, no inventes nada, no uses clichés del más allá, no menciones causa de muerte, 180-350 palabras.');

  return lines.join('\n');
}

/**
 * Normaliza la salida de Replicate a string. Los modelos Llama devuelven
 * uno de tres formatos según la versión del SDK / tamaño del modelo:
 *   1. AsyncIterable de tokens (streaming)
 *   2. Array de strings (tokens ya juntados)
 *   3. String directo
 */
async function normalizeToText(raw: unknown): Promise<string> {
  if (raw == null) return '';

  // 1. AsyncIterable (streaming)
  if (typeof raw === 'object' && Symbol.asyncIterator in (raw as object)) {
    let acc = '';
    for await (const chunk of raw as AsyncIterable<unknown>) {
      acc += typeof chunk === 'string' ? chunk : String(chunk ?? '');
    }
    return acc;
  }

  // 2. Array de tokens
  if (Array.isArray(raw)) return raw.map((x) => String(x ?? '')).join('');

  // 3. String
  if (typeof raw === 'string') return raw;

  return String(raw);
}

/**
 * Construye los parámetros para Replicate según el modelo detectado.
 * Llama 3 usa max_new_tokens; 3.1 usa max_tokens.
 */
function buildModelInput(userPrompt: string) {
  const modelLower = TEXT_MODEL.toLowerCase();
  const is31 = modelLower.includes('llama-3.1') || modelLower.includes('llama-3-1');
  const tokenLimitKey = is31 ? 'max_tokens' : 'max_new_tokens';

  return {
    prompt: userPrompt,
    system_prompt: SYSTEM_PROMPT,
    [tokenLimitKey]: 700,
    temperature: 0.65,
    top_p: 0.9,
    presence_penalty: 0.3,
    frequency_penalty: 0.2,
  };
}

export interface GenerateBiographyResult {
  text: string;
  model: string;
  prompt: string;
}

export async function generateBiography(input: BiographyInput): Promise<GenerateBiographyResult> {
  if (!input.notes || input.notes.trim().length < 20) {
    throw new Error('notes_too_short');
  }
  if (input.notes.length > 4000) {
    throw new Error('notes_too_long');
  }

  const userPrompt = buildUserPrompt(input);
  const modelInput = buildModelInput(userPrompt);

  let output: unknown;
  try {
    output = await replicate.run(TEXT_MODEL, { input: modelInput });
  } catch (err: any) {
    const detail = err?.response?.data ?? err?.detail ?? err?.message ?? String(err);
    const enriched = new Error(
      `replicate_run_failed (model=${TEXT_MODEL}): ${
        typeof detail === 'string' ? detail : JSON.stringify(detail).slice(0, 500)
      }`,
    );
    (enriched as any).cause = err;
    throw enriched;
  }

  const text = (await normalizeToText(output)).trim();

  if (!text || text.length < 40) {
    throw new Error(
      `biography_empty_output (model=${TEXT_MODEL}): ${JSON.stringify(output).slice(0, 300)}`,
    );
  }

  return { text, model: TEXT_MODEL, prompt: userPrompt };
}
