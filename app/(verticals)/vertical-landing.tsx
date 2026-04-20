import Link from 'next/link';
import {
  Heart, Sparkles, ShieldCheck, TrendingUp, HeartHandshake, Award, Star,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal, FadeH1, FadeH2, FadeP, DustParticles } from '@/components/viva-images';
import { CalBookingButton } from '@/components/cal-booking';

export interface VerticalCopy {
  /** Para el schema.org WebPage + título */
  vertical: string;                  // "Funerarias", "Clínicas Veterinarias", "Hospicios"
  /** Palabra clave principal para el H1 */
  keywordH1: string;                 // "funerarias", "clínicas veterinarias", "hospicios"
  /** Eyebrow arriba del H1 */
  eyebrow: string;
  /** H1 cinematográfico (puede usar <span class="text-gradient-dorado italic"> */
  h1: React.ReactNode;
  /** Intro bajo el H1 */
  intro: string;
  /** Texto del sub-bullet del pitch principal */
  pitch: string;
  /** 4 beneficios específicos del vertical */
  benefits: { icon: LucideIcon; title: string; text: string }[];
  /** Testimonial simulado (placeholder editable) */
  testimonial: { quote: string; author: string };
  /** 3 preguntas frecuentes específicas */
  faqs: { q: string; a: string }[];
  /** Canonical path: '/para-funerarias' | '/para-clinicas-veterinarias' | '/para-hospicios' */
  canonical: string;
  /** Keywords extra para meta tag */
  keywords: string[];
  /** Contenido largo para SEO (opcional). Se renderiza antes del testimonial. */
  deepContent?: { heading: string; paragraphs: string[] };
}

export function VerticalLanding({ copy }: { copy: VerticalCopy }) {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'https://historias-infinitas.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Historias Infinitas para ${copy.vertical}`,
    description: copy.intro,
    inLanguage: 'es-MX',
    about: {
      '@type': 'Service',
      name: `Nichos Virtuales para ${copy.vertical.toLowerCase()}`,
      provider: { '@type': 'Organization', name: 'Historias Infinitas' },
      areaServed: { '@type': 'Country', name: 'México' },
      offers: [
        { '@type': 'Offer', name: 'Pack 30',  price: 4999,  priceCurrency: 'MXN' },
        { '@type': 'Offer', name: 'Anual Pro', price: 14999, priceCurrency: 'MXN' },
      ],
    },
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: copy.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Para socios', item: `${SITE_URL}/partners` },
      { '@type': 'ListItem', position: 3, name: copy.vertical, item: `${SITE_URL}${copy.canonical}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-pizarra-800 text-marfil">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 20% 30%, rgba(183,148,90,0.35), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(183,148,90,0.15), transparent 50%)',
          }}
        />
        <DustParticles count={24} />

        <div className="container-wide relative py-20 md:py-28">
          <Reveal>
            <FadeP className="uppercase tracking-[0.3em] text-[11px] md:text-sm text-dorado-300 mb-5">
              {copy.eyebrow}
            </FadeP>
            <FadeH1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-marfil max-w-4xl">
              {copy.h1}
            </FadeH1>
            <FadeP delay={0.1} className="text-marfil/80 mt-6 max-w-2xl text-lg md:text-xl leading-relaxed">
              {copy.intro}
            </FadeP>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="dorado" size="lg">
                <Link href="/partners#planes">Ver planes y contratar</Link>
              </Button>
              <CalBookingButton
                variant="outline"
                size="lg"
                className="!bg-transparent !text-marfil border-marfil/40 hover:!bg-marfil/10"
              >
                Agendar demo · 15 min
              </CalBookingButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ BENEFICIOS específicos del vertical ============ */}
      <section className="container-wide py-24">
        <Reveal className="text-center mb-12">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Por qué funciona en {copy.keywordH1}
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            {copy.pitch}
          </FadeH2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {copy.benefits.map((b) => (
            <Reveal key={b.title}>
              <Card className="h-full p-6 hover:shadow-dorado transition-shadow">
                <div className="h-12 w-12 rounded-full bg-dorado-100 text-dorado-700 flex items-center justify-center mb-4">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl text-pizarra-800 mb-2">{b.title}</h3>
                <p className="text-pizarra-500 text-sm leading-relaxed">{b.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CONTENIDO PROFUNDO (SEO) ============ */}
      {copy.deepContent && (
        <section className="bg-marfil py-20">
          <div className="container-wide max-w-3xl">
            <Reveal>
              <FadeH2 className="font-serif text-3xl md:text-4xl text-pizarra-800 mb-8">
                {copy.deepContent.heading}
              </FadeH2>
              <div className="space-y-5 text-pizarra-600 leading-relaxed text-[15px] md:text-base">
                {copy.deepContent.paragraphs.map((p, i) => (
                  <FadeP key={i}>{p}</FadeP>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ TESTIMONIO ============ */}
      <section className="bg-pizarra-800 text-marfil py-20">
        <div className="container-wide max-w-3xl text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-dorado-400 fill-dorado-400" />
              ))}
            </div>
            <FadeH2 className="font-serif italic text-2xl md:text-4xl text-marfil leading-snug">
              &ldquo;{copy.testimonial.quote}&rdquo;
            </FadeH2>
            <FadeP className="mt-6 text-dorado-300 uppercase tracking-widest text-xs">
              — {copy.testimonial.author}
            </FadeP>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="container-wide py-24 max-w-3xl">
        <Reveal className="text-center mb-10">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Preguntas frecuentes
          </FadeP>
          <FadeH2 className="font-serif text-3xl md:text-4xl text-pizarra-800">
            Lo que nos preguntan
          </FadeH2>
        </Reveal>

        <div className="space-y-3">
          {copy.faqs.map((f) => (
            <details key={f.q} className="group bg-marfil rounded-xl border border-pizarra-100 p-5 open:shadow-solemn transition-shadow">
              <summary className="font-serif text-lg text-pizarra-800 cursor-pointer list-none flex items-center justify-between">
                {f.q}
                <span className="text-dorado-500 text-2xl transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-pizarra-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="container-wide pb-24">
        <Reveal>
          <Card className="bg-dorado-500 border-dorado-400 text-pizarra-900 shadow-dorado">
            <CardContent className="p-10 md:p-14 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-pizarra-800" />
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
                Haz que tu {copy.keywordH1.slice(0, -1)} sea inolvidable para cada familia.
              </h2>
              <p className="max-w-2xl mx-auto text-pizarra-800/85 mb-8">
                Únete al Programa de Socios hoy — sin cuotas mensuales, con
                garantía de 30 días.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-pizarra-900 hover:bg-pizarra-800 text-marfil">
                  <Link href="/partners#planes">Contratar Pack 30</Link>
                </Button>
                <CalBookingButton
                  size="lg"
                  variant="outline"
                  className="border-pizarra-900 text-pizarra-900 hover:bg-pizarra-900/10"
                >
                  Agendar demo · 15 min
                </CalBookingButton>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </>
  );
}

export { Heart, Sparkles, ShieldCheck, TrendingUp, HeartHandshake, Award };
