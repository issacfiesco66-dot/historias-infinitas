/** @type {import('next').NextConfig} */

// Dominio del proyecto Supabase (para restringir remotePatterns al tuyo).
// Derivado de NEXT_PUBLIC_SUPABASE_URL para que no se pueda cargar imágenes
// de OTROS tenants Supabase por mis Image Optimizer (mitigación DoS CVE).
const supabaseHost = (() => {
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!u) return null;
    return new URL(u).hostname;
  } catch {
    return null;
  }
})();

// Orígenes permitidos para Server Actions. En dev añadimos localhost.
const serverActionOrigins = [
  'historias-infinitas.com',
  'www.historias-infinitas.com',
  ...(process.env.NODE_ENV === 'development' ? ['localhost:3000', 'localhost:3002'] : []),
];

/**
 * Security headers globales.
 *
 * CSP: estricta para la app. Permitimos:
 *  - self: nuestro propio origen.
 *  - fonts.googleapis / fonts.gstatic: las fuentes del layout.
 *  - ajax.googleapis.com: el <model-viewer> de Google (WebAR).
 *  - *.supabase.co (solo el nuestro si lo detectamos) para imágenes/media.
 *  - replicate.delivery: retratos AI.
 *  - blob: / data: para previews de upload.
 *  - 'unsafe-inline' en style-src (Tailwind genera inline styles) — aceptado.
 *  - 'unsafe-inline' en script-src para compatibilidad con Next.js 14 inline
 *    runtime chunks. Next 14 no soporta CSP con nonces sin custom work.
 */
const supabaseCsp = supabaseHost ? `https://${supabaseHost}` : 'https://*.supabase.co';
// vercel.live/.pusher — Vercel inyecta un widget de feedback/toolbar en
// Preview y Production; sin permitirlo en CSP, la consola se llena de
// errores aunque la app funcione. Es de Vercel, seguro permitirlo.
const vercelLive = 'https://vercel.live https://*.pusher.com wss://*.pusher.com';
// Google Tag Manager + Google Ads (gtag.js) para tracking de conversiones.
// Dominios documentados por Google para CSP en
// https://developers.google.com/tag-platform/security/guides/csp
const googleTagScripts = 'https://www.googletagmanager.com';
const googleTagConnect = 'https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net';
const googleTagImages  = 'https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://*.g.doubleclick.net https://www.google.com https://www.google.com.mx';
const googleTagFrames  = 'https://td.doubleclick.net https://bid.g.doubleclick.net';
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ajax.googleapis.com https://js.stripe.com ${googleTagScripts} ${vercelLive}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${vercelLive}`,
  `img-src 'self' data: blob: ${supabaseCsp} https://replicate.delivery https://pbxt.replicate.delivery ${googleTagImages} ${vercelLive}`,
  `font-src 'self' https://fonts.gstatic.com data: ${vercelLive}`,
  // connect-src: agrega ajax.googleapis.com para que model-viewer pueda
  // cargar su sourcemap (solo DevTools lo pide; no rompe nada si falla,
  // pero ensucia la consola).
  `connect-src 'self' ${supabaseCsp} wss://${supabaseHost || '*.supabase.co'} https://api.stripe.com https://api.replicate.com https://ajax.googleapis.com ${googleTagConnect} ${vercelLive}`,
  `frame-src 'self' https://js.stripe.com https://hooks.stripe.com ${googleTagFrames} ${vercelLive}`,
  `media-src 'self' blob: data: ${supabaseCsp}`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self' https://checkout.stripe.com`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',            value: 'DENY' },
  { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',         value: 'camera=(self), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'X-DNS-Prefetch-Control',     value: 'on' },
  { key: 'Content-Security-Policy',    value: csp },
];

const nextConfig = {
  // No revelar el stack en el header de respuesta.
  poweredByHeader: false,

  // Compresión a cargo del runtime (ya activa por defecto, explícito por claridad).
  compress: true,

  // React strict mode activo (detecta efectos no idempotentes).
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Solo el bucket/hostname de NUESTRO Supabase (si está disponible).
      ...(supabaseHost
        ? [{ protocol: 'https', hostname: supabaseHost }]
        : [{ protocol: 'https', hostname: '*.supabase.co' }]),
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'pbxt.replicate.delivery' },
      // Placeholders SOLO en dev — evita DoS del Image Optimizer en prod.
      ...(process.env.NODE_ENV === 'development'
        ? [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'picsum.photos' },
            { protocol: 'https', hostname: 'fastly.picsum.photos' },
          ]
        : []),
    ],
    // Limita formatos que el Image Optimizer puede procesar (mitiga DoS).
    formats: ['image/avif', 'image/webp'],
    // Rangos acotados — el Optimizer solo atiende estos tamaños, no arbitrarios.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // TTL mínimo en caché para no acumular disco infinito (CVE-2025-cache-growth).
    minimumCacheTTL: 60,
    // Bloquea SVG remoto (XSS vector en SVG).
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    serverActions: { allowedOrigins: serverActionOrigins },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Cache inmutable para assets estáticos que ya llevan hash en el nombre.
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
