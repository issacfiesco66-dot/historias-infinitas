/**
 * Planes de Historias Infinitas — origen de verdad para:
 *   · La página de checkout (UI)
 *   · El API /api/checkout (Stripe Session)
 *   · El correo de confirmación de pago
 *
 * Nunca confíes en precios enviados desde el cliente: el API valida el
 * planId y añade el precio desde este archivo antes de crear la sesión.
 */

export type PlanId = 'digital' | 'artistico' | 'eterno';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceUSD: number;      // en USD enteros; Stripe recibe centavos (× 100)
  popular?: boolean;
  includes: string[];
}

export const PLANS: readonly Plan[] = [
  {
    id: 'digital',
    name: 'Digital',
    tagline: 'Un hogar sereno en internet.',
    priceUSD: 499,
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
    priceUSD: 849,
    popular: true,
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
    priceUSD: 2499,
    includes: [
      'Todo lo del plan Artístico',
      'Placa física en acero inoxidable',
      'Grabado del QR con acabado dorado',
      'Envío internacional sin costo',
    ],
  },
] as const;

export const AR_ADDON = {
  id: 'ar_portal',
  name: 'Portal de Realidad Aumentada',
  description: 'Añade un video flotante que aparece al escanear el QR.',
  priceUSD: 299,
} as const;

export function getPlan(id: PlanId): Plan {
  const p = PLANS.find((x) => x.id === id);
  if (!p) throw new Error(`Plan desconocido: ${id}`);
  return p;
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
