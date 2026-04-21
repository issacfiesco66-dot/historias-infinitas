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

// sameAs para schema.org Organization. Se llena vía env vars para que
// puedas publicar perfiles a medida que los crees sin redeploy.
// Cada URL válida cuenta como señal de entidad para Google Knowledge Graph
// y para que los LLMs (ChatGPT, Perplexity, Gemini) reconozcan a la marca.
const SOCIAL_SAME_AS: string[] = [
  process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
  process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
  process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
  process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
  process.env.NEXT_PUBLIC_SOCIAL_WIKIPEDIA,
].filter((v): v is string => typeof v === 'string' && v.length > 0);

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
// en todas las páginas (mejora el Knowledge Graph de Google y el reconocimiento
// de entidad por parte de los LLMs).
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: ['HistoriasInfinitas', 'Historias Infinitas MX'],
  legalName: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/icon.svg`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/og-default.jpg`,
  description: DESCRIPTION,
  slogan: 'Preserva la memoria de quienes amas. Para siempre.',
  foundingDate: '2026',
  // Los LLMs usan areaServed para decidir qué tan relevante es la marca
  // en respuestas con intención geográfica.
  areaServed: [
    { '@type': 'Country', name: 'Mexico' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'Canada' },
  ],
  // knowsAbout alimenta el entity graph y mejora citaciones en respuestas
  // con intención temática ("memoriales digitales", "duelo mascota", etc.).
  knowsAbout: [
    'Digital memorials',
    'Virtual memorials for pets',
    'Memorial websites',
    'AI-generated portraits',
    'Augmented Reality tributes',
    'QR code memorials',
    'Grief and bereavement support',
    'Funeral home digitalization',
    'Pet loss and pet grief',
    'Hospice and palliative care support',
    'Nichos virtuales',
    'Homenajes digitales',
    'Tributos en línea',
    'Duelo por mascotas',
  ],
  priceRange: '$299 – $14,999 MXN',
  sameAs: SOCIAL_SAME_AS,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hola@historias-infinitas.com',
      availableLanguage: ['Spanish', 'English'],
      areaServed: ['MX', 'US', 'CA'],
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
      availableLanguage: ['Spanish', 'English'],
      areaServed: ['MX', 'US', 'CA'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'billing support',
      email: 'facturacion@historias-infinitas.com',
      availableLanguage: ['Spanish'],
      areaServed: ['MX'],
    },
  ],
  makesOffer: [
    { '@type': 'Offer', name: 'Nicho Virtual Digital',   price: 299,   priceCurrency: 'MXN', category: 'Consumer', url: `${SITE_URL}/empieza` },
    { '@type': 'Offer', name: 'Nicho Virtual Artístico', price: 599,   priceCurrency: 'MXN', category: 'Consumer', url: `${SITE_URL}/empieza` },
    { '@type': 'Offer', name: 'Nicho Virtual Eterno',    price: 1799,  priceCurrency: 'MXN', category: 'Consumer', url: `${SITE_URL}/empieza` },
    { '@type': 'Offer', name: 'Partner · Pack 30',       price: 4999,  priceCurrency: 'MXN', category: 'Partner',  url: `${SITE_URL}/partners` },
    { '@type': 'Offer', name: 'Partner · Anual Pro',     price: 14999, priceCurrency: 'MXN', category: 'Partner',  url: `${SITE_URL}/partners` },
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: 'HistoriasInfinitas',
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: ['es-MX', 'en-US'],
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/memorial/{search_term_string}`,
    },
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
