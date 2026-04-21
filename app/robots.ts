import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com';

/**
 * robots.txt
 *
 * Política de crawlers (GEO-first · abril 2026):
 *   - Google/Bing/Yandex/DuckDuckGo y equivalentes: sin restricciones más allá
 *     de rutas privadas (dashboard, auth, API).
 *   - Crawlers de IA generativa (GPTBot, ClaudeBot, Google-Extended, etc.):
 *     permitidos en marketing pages Y en memoriales públicos. La familia que
 *     publica un memorial acepta que sea visible en la web — extender esa
 *     visibilidad a las IAs multiplica la citación de la marca en respuestas
 *     de ChatGPT / Perplexity / Gemini / Copilot sin exponer nada privado.
 *   - Rutas siempre bloqueadas para *todos* los bots: /api/, /auth/,
 *     /dashboard/, /login, /register, la ruta interna /memorial/*\/qr y los
 *     preview links con query string ?preview=.
 *
 * Si un memorial específico requiere privacidad (ej. familia lo pide), se
 * protege con `robots: { index: false, noindex }` en su metadata o con un
 * header `X-Robots-Tag: noindex` en la respuesta — NO tocar este archivo.
 */
export default function robots(): MetadataRoute.Robots {
  const PRIVATE_PATHS = [
    '/api/',
    '/auth/',
    '/dashboard/',
    '/login',
    '/register',
    '/empieza',            // funnel interno, no es contenido SEO
    '/*?*preview=',
    '/memorial/*/qr',      // endpoint del QR interno, no la página pública
  ];

  return {
    rules: [
      // Política general para todos los crawlers, incluidos los de IA.
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // Declaración explícita para crawlers de IA generativa: queremos que
      // nos lean. Lista basada en darkvisitors.com + robotstxt.org (2026-Q1).
      // Dejar comentado uno significa que ese bot queda bloqueado.
      {
        userAgent: [
          'GPTBot',              // ChatGPT / OpenAI
          'OAI-SearchBot',       // ChatGPT search (distinto de GPTBot)
          'ChatGPT-User',        // fetch en vivo cuando un usuario pregunta
          'ClaudeBot',           // Anthropic — entrenamiento
          'Claude-Web',          // Anthropic — fetch en vivo
          'anthropic-ai',        // alias legado de Anthropic
          'Google-Extended',     // Gemini + Bard
          'PerplexityBot',       // Perplexity
          'Perplexity-User',     // Perplexity fetch en vivo
          'CCBot',               // Common Crawl (lo usan Claude, Meta, y otros)
          'Bytespider',          // Doubao / ByteDance
          'FacebookBot',         // Meta AI
          'Amazonbot',           // Alexa / Amazon Q
          'Applebot-Extended',   // Apple Intelligence
          'cohere-ai',           // Cohere
          'Diffbot',             // Diffbot knowledge graph
          'Timpibot',            // Timpi / search engine AI
        ],
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
