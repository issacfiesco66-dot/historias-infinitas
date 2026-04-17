import type { Metadata } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/en',
    languages: {
      'es-MX': '/',
      'en-US': '/en',
      'x-default': '/',
    },
  },
  openGraph: {
    locale: 'en_US',
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
