import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Mail, Calendar } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Bienvenido al Programa de Socios — Historias Infinitas',
  robots: { index: false },
};

export default function PartnerSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <>
      <SiteHeader />
      <main className="container-solemn py-16 md:py-24 max-w-3xl">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-dorado-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-dorado-600" />
          </div>
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Bienvenido a la red
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 leading-tight">
            Gracias por unirte a{' '}
            <span className="text-gradient-dorado italic">Historias Infinitas</span>
          </h1>
          <p className="text-pizarra-500 mt-4 max-w-xl mx-auto">
            Acabamos de recibir tu pago. En las próximas horas te enviaremos por
            correo el kit de bienvenida con tu dashboard, subdominio y las
            primeras placas rumbo a tu domicilio.
          </p>
        </div>

        <Card className="mt-10 text-left">
          <CardContent className="p-6 md:p-8 space-y-5">
            <p className="uppercase tracking-widest text-[11px] text-dorado-600">
              Próximos pasos
            </p>

            <Row
              icon={<Mail className="h-5 w-5 text-dorado-600" />}
              title="Recibirás un correo en < 24 h hábiles"
              text="Con las credenciales de tu dashboard de socio y los accesos al subdominio personalizado."
            />
            <Row
              icon={<Calendar className="h-5 w-5 text-dorado-600" />}
              title="Onboarding de 20 minutos"
              text="Agendamos una videollamada para capacitar a tu equipo y entregarte el guión de venta."
            />
          </CardContent>
        </Card>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="dorado">
            <Link href="/">Ir al inicio</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contacto?plan=onboarding">Agendar onboarding</Link>
          </Button>
        </div>

        {searchParams.session_id && (
          <p className="mt-10 font-mono text-[10px] text-pizarra-300 text-center">
            ref: {searchParams.session_id}
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function Row({
  icon, title, text,
}: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 rounded-full bg-dorado-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-serif text-base text-pizarra-800">{title}</p>
        <p className="text-sm text-pizarra-500">{text}</p>
      </div>
    </div>
  );
}
