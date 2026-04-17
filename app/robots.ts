import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com';

/**
 * robots.txt
 *
 * - Permite indexar la landing + memoriales públicos.
 * - Bloquea: dashboard privado, API, autenticación, QR interno.
 * - Referencia al sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard/',
          '/login',
          '/register',
          '/*?*preview=',
          '/memorial/*/qr',
        ],
      },
      // Bloquear bots de IA que no respetan derechos de imagen
      // (opcional — quitar si se quiere que entrenen con memoriales públicos)
      {
        userAgent: ['GPTBot', 'CCBot', 'Google-Extended', 'anthropic-ai', 'ClaudeBot'],
        disallow: '/memorial/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
