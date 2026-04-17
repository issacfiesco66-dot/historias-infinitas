/**
 * Planes del programa de socios (B2B): funerarias, clínicas veterinarias,
 * geriátricos, hospicios, etc.
 *
 * Dos modalidades:
 *   · pack   — pago único por un paquete de memoriales con vigencia 12 meses
 *   · annual — suscripción anual con memoriales incluidos y beneficios extra
 *   · custom — institucional, negociado con el equipo comercial
 *
 * Precios en MXN (pesos mexicanos). Incluyen IVA.
 */

export type PartnerPlanType = 'pack' | 'annual' | 'custom';

export type PartnerPlanId =
  | 'partner_trial'
  | 'partner_pack_30'
  | 'partner_annual_pro'
  | 'partner_institucional';

export interface PartnerPlan {
  id: PartnerPlanId;
  type: PartnerPlanType;
  name: string;
  tagline: string;
  /** Null = personalizado / contacto comercial */
  priceMXN: number | null;
  /** Cuántos memoriales incluye. Null = ilimitado o personalizado. */
  memorialsIncluded: number | null;
  /** Vigencia en meses (pack). 12 por default. */
  validityMonths?: number;
  popular?: boolean;
  features: string[];
  /** Texto del CTA principal. */
  ctaLabel: string;
}

export const PARTNER_PLANS: readonly PartnerPlan[] = [
  {
    id: 'partner_trial',
    type: 'pack',
    name: 'Prueba',
    tagline: 'Antes de comprometerte, pruébalo con tus familias.',
    priceMXN: 999,
    memorialsIncluded: 5,
    validityMonths: 6,
    ctaLabel: 'Comprar prueba',
    features: [
      '5 memoriales digitales',
      'Vigencia de 6 meses',
      'Logo de tu empresa en cada memorial',
      'Sin compromiso de renovación',
    ],
  },
  {
    id: 'partner_pack_30',
    type: 'pack',
    name: 'Pack 30',
    tagline: 'Para arrancar con buen pie.',
    priceMXN: 4999,
    memorialsIncluded: 30,
    validityMonths: 12,
    popular: true,
    ctaLabel: 'Comprar pack',
    features: [
      '30 memoriales digitales (ahorro 40 %)',
      'Vigencia de 12 meses',
      'Logo de tu empresa en cada memorial',
      'Dashboard de gestión de socios',
      '5 placas físicas con tu logo sin costo',
      'Material de venta para tu equipo',
    ],
  },
  {
    id: 'partner_annual_pro',
    type: 'annual',
    name: 'Profesional',
    tagline: 'Para funerarias y clínicas en movimiento.',
    priceMXN: 14999,
    memorialsIncluded: 200,
    ctaLabel: 'Reservar plan anual',
    features: [
      '200 memoriales al año (ahorro 60 %)',
      '40 placas físicas con tu logo',
      'Capacitación al equipo (vía Zoom)',
      '15 % de comisión sobre upgrades a plan Eterno',
      'Subdominio personalizado (próximamente)',
      'Soporte prioritario en <4 h hábiles',
    ],
  },
  {
    id: 'partner_institucional',
    type: 'custom',
    name: 'Institucional',
    tagline: 'Para cadenas, grupos y hospicios.',
    priceMXN: null,
    memorialsIncluded: null,
    ctaLabel: 'Hablar con ventas',
    features: [
      'Memoriales ilimitados',
      '15 % de comisión sobre upgrades',
      'Cuenta manager dedicada',
      'DPA bajo LFPDPPP firmado',
      'White-label completo (próximamente)',
      'API de integración con tu CRM (próximamente)',
    ],
  },
] as const;

export function getPartnerPlan(id: PartnerPlanId): PartnerPlan {
  const p = PARTNER_PLANS.find((x) => x.id === id);
  if (!p) throw new Error(`Plan de socio desconocido: ${id}`);
  return p;
}

export function formatPartnerPrice(plan: PartnerPlan): string {
  if (plan.priceMXN === null) return 'A medida';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(plan.priceMXN);
}

/** ¿El plan tiene checkout automático (packs) o cierre manual (annual/custom)? */
export function partnerPlanHasDirectCheckout(plan: PartnerPlan): boolean {
  return plan.type === 'pack';
}
