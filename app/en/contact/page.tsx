import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Mail, MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { ContactForm } from '@/app/(legal)/contacto/contact-form';

export const metadata: Metadata = {
  title: 'Contact — Historias Infinitas',
  description:
    'Write to us. We respond to every message with the care your story deserves.',
  alternates: {
    canonical: '/en/contact',
    languages: {
      'es-MX': '/contacto',
      'en-US': '/en/contact',
      'x-default': '/contacto',
    },
  },
  openGraph: { locale: 'en_US' },
};

export default function ContactEN() {
  return (
    <>
      <SiteHeaderEN />
      <main className="container-solemn py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="prose-legal text-center max-w-2xl mx-auto">
            <p className="meta">We're here for you</p>
            <h1>Let's talk with care</h1>
            <p>
              Whether you have questions about our plans, the AI portrait,
              shipping a memorial plate, or you simply need us to walk alongside
              you — write to us. We read every message.
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr,1.3fr] gap-10 mt-12">
            <aside className="space-y-6">
              <InfoRow
                icon={<Mail className="h-5 w-5" />}
                title="General inquiries"
                lines={[
                  <a key="1" href="mailto:hola@historias-infinitas.com" className="text-dorado-600 underline">
                    hello@historias-infinitas.com
                  </a>,
                ]}
              />
              <InfoRow
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Privacy & data"
                lines={[
                  <a key="1" href="mailto:privacidad@historias-infinitas.com" className="text-dorado-600 underline">
                    privacy@historias-infinitas.com
                  </a>,
                  'Exercise your data rights (GDPR / LFPDPPP).',
                ]}
              />
              <InfoRow
                icon={<Mail className="h-5 w-5" />}
                title="Partners & sales"
                lines={[
                  <a key="1" href="mailto:socios@historias-infinitas.com" className="text-dorado-600 underline">
                    partners@historias-infinitas.com
                  </a>,
                  'For funeral homes, vet clinics and hospices.',
                ]}
              />
              <InfoRow
                icon={<Phone className="h-5 w-5" />}
                title="Phone"
                lines={['[+1 …]', 'Mon–Fri · 9:00 to 18:00 (CST / Mexico City)']}
              />
              <InfoRow
                icon={<MapPin className="h-5 w-5" />}
                title="Address"
                lines={[
                  '[STREET, NUMBER]',
                  '[NEIGHBORHOOD, CITY]',
                  '[ZIP — STATE, MEXICO]',
                ]}
              />
              <InfoRow
                icon={<Clock className="h-5 w-5" />}
                title="Response time"
                lines={['Business days: 24–48 hours.']}
              />
            </aside>

            <section>
              <div className="rounded-2xl border border-pizarra-100 bg-marfil p-6 md:p-8 shadow-solemn">
                <Suspense fallback={<div className="h-96" />}>
                  <ContactForm />
                </Suspense>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooterEN />
    </>
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
