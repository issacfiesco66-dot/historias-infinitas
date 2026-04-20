import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

const SITE_NAME = 'Historias Infinitas';
const TITLE = 'Historias Infinitas — Nichos Virtuales con IA y Realidad Aumentada';
const DESCRIPTION =
  'Preserva la memoria de quienes amas. Creamos nichos virtuales eternos con retratos artísticos generados por IA y Portales de Recuerdos en Realidad Aumentada — para mascotas y seres queridos.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s — Historias Infinitas',
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'nicho virtual',
    'nichos virtuales para mascotas',
    'nichos virtuales para seres queridos',
    'homenaje digital',
    'tributo en línea',
    'retrato IA',
    'realidad aumentada',
    'QR nicho virtual',
    'recordar mascota',
    'duelo mascota',
    'historias infinitas',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'Nichos Virtuales',
  alternates: {
    canonical: '/',
    languages: {
      'es-MX': '/',
      'en-US': '/en',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Historias Infinitas — Nichos Virtuales con IA y Realidad Aumentada',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
    creator: '@historiasinf',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4EFE4' },
    { media: '(prefers-color-scheme: dark)', color: '#1F242E' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
};

// JSON-LD para la Organización — se inyecta a nivel raíz para que aparezca
// en todas las páginas (mejora el Knowledge Graph de Google).
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  legalName: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  image: `${SITE_URL}/og-default.jpg`,
  description: DESCRIPTION,
  areaServed: { '@type': 'Country', name: 'México' },
  priceRange: '$299 – $14,999 MXN',
  foundingDate: '2026',
  sameAs: [] as string[],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hola@historias-infinitas.com',
      availableLanguage: ['Spanish'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'privacy',
      email: 'privacidad@historias-infinitas.com',
      availableLanguage: ['Spanish'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'socios@historias-infinitas.com',
      availableLanguage: ['Spanish'],
    },
  ],
  makesOffer: [
    { '@type': 'Offer', name: 'Nicho Virtual Digital',   price: 299,   priceCurrency: 'MXN' },
    { '@type': 'Offer', name: 'Nicho Virtual Artístico', price: 599,   priceCurrency: 'MXN' },
    { '@type': 'Offer', name: 'Nicho Virtual Eterno',    price: 1799,  priceCurrency: 'MXN' },
    { '@type': 'Offer', name: 'Partner · Pack 30',  price: 4999,  priceCurrency: 'MXN' },
    { '@type': 'Offer', name: 'Partner · Anual Pro',price: 14999, priceCurrency: 'MXN' },
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'es',
  publisher: { '@type': 'Organization', name: SITE_NAME },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/memorial/{search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Google <model-viewer> para WebAR */}
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
          async
        />
        {/* JSON-LD: Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18104925251"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18104925251');
          `}
        </Script>
      </body>
    </html>
  );
}
