/**
 * Planes de Historias Infinitas — origen de verdad para:
 *   · La página de checkout (UI)
 *   · El API /api/checkout (Stripe Session)
 *   · El correo de confirmación de pago
 *
 * Nunca confíes en precios enviados desde el cliente: el API valida el
 * planId y añade el precio desde este archivo antes de crear la sesión.
 *
 * Moneda: MXN (peso mexicano). Stripe recibe centavos (× 100).
 */

export type PlanId = 'trial_mensual' | 'digital' | 'artistico' | 'eterno';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMXN: number;      // en MXN enteros; Stripe recibe centavos (× 100)
  popular?: boolean;
  /**
   * Duración del memorial tras el pago. `null` = permanente.
   * Cuando es un número, el webhook de Stripe setea `expires_at = now() + durationDays`
   * y la página pública oculta el memorial al vencer.
   */
  durationDays: number | null;
  includes: string[];
}

export const PLANS: readonly Plan[] = [
  {
    id: 'trial_mensual',
    name: 'Mes de Prueba',
    tagline: 'Un mes para despedirse, sin compromiso.',
    priceMXN: 100,
    durationDays: 30,
    includes: [
      'QR único con URL activa 30 días',
      'Galería de fotografías',
      'Biografía y epitafio',
      'Opción de extender a plan permanente antes de vencer',
    ],
  },
  {
    id: 'digital',
    name: 'Digital',
    tagline: 'Un hogar sereno en internet.',
    priceMXN: 299,
    durationDays: null,
    includes: [
      'QR único con URL permanente',
      'Hosting eterno del memorial',
      'Galería de fotografías',
      'Biografía y epitafio',
    ],
  },
  {
    id: 'artistico',
    name: 'Artístico',
    tagline: 'Un retrato que vuelve a respirar.',
    priceMXN: 599,
    popular: true,
    durationDays: null,
    includes: [
      'Todo lo del plan Digital',
      'Retrato IA en alta resolución',
      'Tres estilos artísticos a elegir',
      'Archivo descargable para imprimir',
    ],
  },
  {
    id: 'eterno',
    name: 'Eterno',
    tagline: 'Un legado que se sostiene en tus manos.',
    priceMXN: 1799,
    durationDays: null,
    includes: [
      'Todo lo del plan Artístico',
      'Placa física en acero inoxidable',
      'Grabado del QR con acabado dorado',
      'Envío a todo México sin costo',
    ],
  },
] as const;

export const AR_ADDON = {
  id: 'ar_portal',
  name: 'Portal de Realidad Aumentada',
  description: 'Añade un recuerdo en AR que aparece al escanear el QR.',
  priceMXN: 199,
} as const;

export function getPlan(id: PlanId): Plan {
  const p = PLANS.find((x) => x.id === id);
  if (!p) throw new Error(`Plan desconocido: ${id}`);
  return p;
}

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}
