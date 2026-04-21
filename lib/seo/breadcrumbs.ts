/**
 * Generador de BreadcrumbList JSON-LD.
 *
 * Un breadcrumb estructurado le dice a Google, ChatGPT, Perplexity, Gemini y
 * Bing Copilot cómo encaja una página en la jerarquía del sitio, y habilita
 * el rich snippet "site hierarchy" en la SERP.
 *
 * Uso:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{
 *     __html: JSON.stringify(breadcrumbJsonLd([
 *       { name: 'Inicio', path: '/' },
 *       { name: 'Términos', path: '/terminos' },
 *     ])),
 *   }} />
 */

export interface BreadcrumbNode {
  name: string;
  /** Ruta relativa, empezando con '/'. Ejemplo: '/terminos' */
  path: string;
}

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

export function breadcrumbJsonLd(nodes: BreadcrumbNode[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: nodes.map((n, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: n.name,
      item: n.path === '/' ? SITE_URL : `${SITE_URL}${n.path}`,
    })),
  };
}
