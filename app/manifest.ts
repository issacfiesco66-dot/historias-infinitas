import type { MetadataRoute } from 'next';

/**
 * Web App Manifest — para instalación PWA (iOS/Android "Añadir a pantalla de inicio")
 * y mejora los signals de SEO móvil de Google.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Historias Infinitas — Memoriales digitales',
    short_name: 'Historias Infinitas',
    description:
      'Memoriales digitales eternos con retratos IA y Realidad Aumentada, para mascotas y seres queridos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4EFE4',
    theme_color: '#1F242E',
    orientation: 'portrait-primary',
    lang: 'es',
    categories: ['lifestyle', 'memorial', 'photo'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
