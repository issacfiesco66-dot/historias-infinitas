import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { EmpiezaWizard } from './wizard';

export const metadata: Metadata = {
  title: 'Empieza tu tributo',
  description:
    'Empieza a crear el nicho virtual de quien amas. Sin registro para comenzar — te pedimos el correo solo cuando estés listo para guardar.',
  alternates: { canonical: '/empieza' },
  // La página funcional, no la indexamos: es un paso del funnel, no contenido SEO.
  robots: { index: false, follow: true },
};

export default function EmpiezaPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-4rem)] bg-marfil-100">
        <Suspense
          fallback={
            <div className="container-solemn py-20">
              <div className="max-w-2xl mx-auto h-96 animate-pulse rounded-2xl bg-pizarra-100" />
            </div>
          }
        >
          <EmpiezaWizard />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
