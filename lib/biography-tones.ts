/**
 * Constantes y tipos de "El Hilo de la Vida" compartidos entre cliente y
 * servidor. Todo lo que requiere Replicate (server-only) vive en
 * `lib/biography.ts`.
 */

export type BiographyTone = 'calido' | 'intimo' | 'formal';

export const BIOGRAPHY_TONES: { id: BiographyTone; label: string; hint: string }[] = [
  { id: 'calido', label: 'Cálido', hint: 'Sereno y humano (por defecto)' },
  { id: 'intimo', label: 'Íntimo', hint: 'Más cercano, como una carta a la familia' },
  { id: 'formal', label: 'Formal', hint: 'Registro sobrio, para ceremonia o prensa' },
];
