import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Mail, MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';
import { ContactForm } from './contact-form';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Escríbenos. Respondemos cada mensaje con el cuidado que tu historia merece.',
  alternates: { canonical: '/contacto' },
};

const bcLd = breadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Contacto', path: '/contacto' },
]);

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bcLd) }}
      />
      <div className="prose-legal text-center max-w-2xl mx-auto">
        <p className="meta">Estamos contigo</p>
        <h1>Hablemos con calma</h1>
        <p>
          Si tienes dudas sobre nuestros planes, sobre el retrato con
          Inteligencia Artificial, sobre el envío de la placa o simplemente
          necesitas que te acompañemos en el proceso, escríbenos. Leemos cada
          mensaje.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr,1.3fr] gap-10 mt-12">
        {/* Datos de contacto */}
        <aside className="space-y-6">
          <InfoRow
            icon={<Mail className="h-5 w-5" />}
            title="Correo general"
            lines={[
              <a key="1" href="mailto:hola@historias-infinitas.com" className="text-dorado-600 underline">
                hola@historias-infinitas.com
              </a>,
            ]}
          />
          <InfoRow
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Protección de datos"
            lines={[
              <a key="1" href="mailto:privacidad@historias-infinitas.com" className="text-dorado-600 underline">
                privacidad@historias-infinitas.com
              </a>,
              'Para ejercer derechos ARCO (Acceso, Rectificación, Cancelación, Oposición).',
            ]}
          />
          <InfoRow
            icon={<Mail className="h-5 w-5" />}
            title="Facturación"
            lines={[
              <a key="1" href="mailto:facturacion@historias-infinitas.com" className="text-dorado-600 underline">
                facturacion@historias-infinitas.com
              </a>,
              'Solicítala dentro del mes en que realizaste el pago.',
            ]}
          />
          <InfoRow
            icon={<Phone className="h-5 w-5" />}
            title="Teléfono"
            lines={['[+52 …]', 'Lun–Vie · 9:00 a 18:00 (hora CDMX)']}
          />
          <InfoRow
            icon={<MapPin className="h-5 w-5" />}
            title="Domicilio"
            lines={[
              '[CALLE, NÚMERO]',
              '[COLONIA, ALCALDÍA/MUNICIPIO]',
              '[C.P. — ESTADO, MÉXICO]',
            ]}
          />
          <InfoRow
            icon={<Clock className="h-5 w-5" />}
            title="Tiempos de respuesta"
            lines={['En días hábiles respondemos en 24–48 horas.']}
          />
        </aside>

        {/* Formulario */}
        <section>
          <div className="rounded-2xl border border-pizarra-100 bg-marfil p-6 md:p-8 shadow-solemn">
            <Suspense fallback={<div className="h-96" />}>
              <ContactForm />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  icon, title, lines,
}: { icon: React.ReactNode; title: string; lines: (string | React.ReactNode)[] }) {
  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 rounded-full bg-dorado-100 text-dorado-700 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="uppercase tracking-widest text-[10px] text-dorado-600 mb-1">{title}</p>
        <div className="text-sm text-pizarra-700 space-y-0.5">
          {lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
