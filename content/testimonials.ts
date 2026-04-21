/**
 * Testimonios reales de clientes y socios de Historias Infinitas.
 *
 * IMPORTANTE
 *   · Este archivo SOLO debe contener testimonios reales con consentimiento
 *     explícito del autor. Nunca placeholders ni inventados — Google y los
 *     LLMs penalizan reviews ficticios y la confianza se destruye rápido.
 *   · Cuando un testimonio tiene ≥ 4 estrellas y el autor autoriza usar su
 *     nombre, se añade aquí y automáticamente aparece en /testimonios con
 *     schema Review + AggregateRating.
 *   · Para marketplaces oficiales (Google Business, Trustpilot, Capterra),
 *     solicita además que el cliente publique la reseña en esas plataformas
 *     — allí la autoridad es mucho mayor que en el sitio propio.
 *
 * Proceso sugerido para pedir un testimonio (ver doc interno):
 *   1. Esperar 30 días después de la compra o entrega.
 *   2. Enviar un correo corto con: (a) agradecimiento, (b) invitación a
 *      contar su experiencia en 3-5 frases, (c) permiso explícito para
 *      publicar nombre y ciudad.
 *   3. Ofrecer si prefieren publicar solo la primera inicial del apellido.
 *   4. Archivar el consentimiento en /consentimientos/testimonios/ con
 *      fecha y copia del correo de respuesta.
 */

export interface Testimonial {
  /** Identificador estable — no se muestra al visitante. */
  id: string;
  /** Nombre del autor tal como autorizó mostrarlo. Ej: "María G." */
  author: string;
  /** Ciudad / estado / país. Ej: "CDMX, México" */
  location?: string;
  /** Rol del autor: 'familia' | 'socio' (funeraria/vet/hospicio) */
  role: 'familia' | 'socio';
  /** Nombre de la empresa si es socio. */
  company?: string;
  /** Rating 1-5 entero. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Texto del testimonio. Sin adjetivos inventados — tal cual el autor. */
  body: string;
  /** Fecha en ISO 8601 (YYYY-MM-DD). */
  date: string;
  /** Plan contratado — útil para segmentar testimonios. */
  plan?: string;
  /** Idioma del testimonio original. */
  lang: 'es' | 'en';
  /** URL del memorial o caso de uso público (opcional). */
  memorialUrl?: string;
  /** ¿Consentimiento por escrito archivado? (gate para mostrar). */
  consentOnFile: boolean;
}

/**
 * Lista de testimonios publicables.
 *
 * Para añadir uno nuevo: copiar uno de los ejemplos comentados abajo,
 * llenar con datos reales y verificar `consentOnFile: true`.
 */
export const TESTIMONIALS: Testimonial[] = [
  // Ejemplo (comentado) — descomentar y reemplazar con testimonio real:
  //
  // {
  //   id: 't-2026-04-ana-g-cdmx',
  //   author: 'Ana G.',
  //   location: 'Ciudad de México',
  //   role: 'familia',
  //   rating: 5,
  //   body: 'Creamos el nicho virtual de mi abuela y lo imprimimos en una placa que pusimos en el jardín donde ella tomaba el té. Las nietas que viven en Los Ángeles lo escanean cada Día de Muertos.',
  //   date: '2026-03-15',
  //   plan: 'Eterno',
  //   lang: 'es',
  //   consentOnFile: true,
  // },
];

/** Solo testimonios con consentimiento archivado. */
export function getPublishedTestimonials(): Testimonial[] {
  return TESTIMONIALS.filter((t) => t.consentOnFile);
}

export function getTestimonialsByLang(lang: 'es' | 'en'): Testimonial[] {
  return getPublishedTestimonials().filter((t) => t.lang === lang);
}

/** Cálculo del AggregateRating para schema. */
export function computeAggregateRating(testimonials: Testimonial[]) {
  if (testimonials.length < 5) return null; // Google requiere ≥ 5 para mostrar
  const total = testimonials.reduce((sum, t) => sum + t.rating, 0);
  return {
    ratingValue: Number((total / testimonials.length).toFixed(1)),
    reviewCount: testimonials.length,
    bestRating: 5,
    worstRating: 1,
  };
}
