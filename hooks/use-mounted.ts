'use client';

import { useEffect, useState } from 'react';

/**
 * Devuelve `false` durante SSR y el primer render en cliente, `true` después.
 *
 * Uso típico: gatear hooks que devuelven distinto en server vs cliente (como
 * `useReducedMotion()` de framer-motion, que devuelve `null` en SSR y
 * `boolean` en cliente). Sin este gate, los estilos inline que motion aplica
 * basados en ese valor producen un HTML distinto en server y cliente, lo que
 * provoca los errores de hydration #418/#425/#423.
 *
 * Patrón de uso:
 *   const rawReduced = useReducedMotion();
 *   const mounted = useMounted();
 *   const reduced = mounted ? rawReduced : false;
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
