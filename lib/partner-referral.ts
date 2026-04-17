/**
 * Referidos de partner — helpers para leer/escribir la cookie `hi_ref`.
 * La cookie guarda el id del partner y expira en 30 días. Cuando un usuario
 * crea un memorial, comprobamos esta cookie y, si está, vinculamos el
 * memorial al partner y consumimos un crédito.
 */

export const PARTNER_REF_COOKIE = 'hi_ref';
export const PARTNER_REF_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export function isLikelyPartnerId(s: string): boolean {
  // UUID v4 básico
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
