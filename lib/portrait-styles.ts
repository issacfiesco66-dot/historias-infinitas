/**
 * Catálogo canónico de estilos del retrato IA.
 *
 * Este archivo es SAFE PARA CLIENTE — no importa el SDK de Replicate ni
 * módulos de Node. Es seguro referenciarlo desde Server Components y desde
 * Client Components (p. ej. el editor del dashboard).
 *
 * El prompt real se compone en el servidor (lib/replicate.ts) y el usuario
 * nunca puede inyectar texto arbitrario — solo envía un `id` validado.
 */

export type PortraitStyleId = 'oleo' | 'celestial' | 'acuarela';

export interface PortraitStyle {
  id: PortraitStyleId;
  label: string;
  hint: string;
  /** Fragmento descriptivo que se inyecta en la plantilla maestra. */
  stylePrompt: string;
  /** Mini-gradiente para visualizar el estilo en la UI. */
  gradient: string;
}

export const PORTRAIT_STYLES: readonly PortraitStyle[] = [
  {
    id: 'oleo',
    label: 'Óleo Clásico',
    hint: 'Pinceladas densas, luz de Rembrandt',
    stylePrompt:
      'masterpiece oil painting on canvas, thick brushstrokes, rich textures, Rembrandtesque lighting, classic museum quality',
    gradient: 'from-[#6B4F2A] via-[#B7945A] to-[#E2CC99]',
  },
  {
    id: 'celestial',
    label: 'Celestial',
    hint: 'Nebulosa dorada, aura angelical',
    stylePrompt:
      'ethereal dream-like digital painting, floating in a soft golden nebula, divine light rays, peaceful transition, soft focus, angelic aura',
    gradient: 'from-[#1F242E] via-[#B7945A] to-[#FBF9F4]',
  },
  {
    id: 'acuarela',
    label: 'Acuarela',
    hint: 'Lavados suaves, papel texturado',
    stylePrompt:
      'professional watercolor illustration, soft pigment bleeds on textured paper, minimalist background, elegant and clean, emotional and fluid',
    gradient: 'from-[#D8DEE9] via-[#F1E6CC] to-[#F4EFE4]',
  },
] as const;

export function getStyle(id: PortraitStyleId): PortraitStyle {
  const s = PORTRAIT_STYLES.find((x) => x.id === id);
  if (!s) throw new Error(`Estilo desconocido: ${id}`);
  return s;
}

export const NEGATIVE_PROMPT = [
  // Deformaciones anatómicas
  'distorted features, extra limbs, extra eyes, extra tails, extra paws, fused limbs, missing limbs',
  'malformed face, asymmetrical eyes, crossed eyes, deformed mouth, broken teeth, mutated hands',
  'bad anatomy, wrong proportions, disfigured, gross proportions, long neck, elongated body',
  // Cambios de especie o raza (crítico para mascotas)
  'different breed, different species, hybrid animal, chimera, mixed animals, wrong animal',
  // Calidad
  'blurry, out of focus, low resolution, pixelated, jpeg artifacts, noise, grainy',
  // Marcas/artefactos
  'text, watermark, signature, logo, caption, frame, border',
  // Estéticas indeseadas
  'cartoonish, anime, chibi, neon colors, oversaturated, aggressive lighting, harsh shadows',
  'scary, creepy, horror, zombie, demonic, glowing red eyes',
  'cheap filter, plastic skin, uncanny valley',
].join(', ');
