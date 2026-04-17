import Link from 'next/link';
import {
  Sparkles, Star, type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal, FadeH1, FadeH2, FadeP, DustParticles } from '@/components/viva-images';

export interface VerticalCopyEN {
  vertical: string;
  keywordH1: string;
  eyebrow: string;
  h1: React.ReactNode;
  intro: string;
  pitch: string;
  benefits: { icon: LucideIcon; title: string; text: string }[];
  testimonial: { quote: string; author: string };
  faqs: { q: string; a: string }[];
  canonical: string;
}

export function VerticalLandingEN({ copy }: { copy: VerticalCopyEN }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Historias Infinitas for ${copy.vertical}`,
    description: copy.intro,
    inLanguage: 'en-US',
    about: {
      '@type': 'Service',
      name: `Digital memorials for ${copy.vertical.toLowerCase()}`,
      provider: { '@type': 'Organization', name: 'Historias Infinitas' },
      areaServed: [
        { '@type': 'Country', name: 'United States' },
        { '@type': 'Country', name: 'Canada' },
        { '@type': 'Country', name: 'Mexico' },
      ],
      offers: [
        { '@type': 'Offer', name: 'Pack 30',   price: 299,  priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Annual Pro', price: 899,  priceCurrency: 'USD' },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
                <Link href="/en/partners#plans">View plans & pricing</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="!bg-transparent !text-marfil border-marfil/40 hover:!bg-marfil/10">
                <Link href={`/en/contact?plan=institutional&vertical=${encodeURIComponent(copy.vertical)}`}>
                  Talk to sales
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-wide py-24">
        <Reveal className="text-center mb-12">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Why it works in {copy.keywordH1}
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

      <section className="container-wide py-24 max-w-3xl">
        <Reveal className="text-center mb-10">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Frequently asked questions
          </FadeP>
          <FadeH2 className="font-serif text-3xl md:text-4xl text-pizarra-800">
            What our partners ask us
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

      <section className="container-wide pb-24">
        <Reveal>
          <Card className="bg-dorado-500 border-dorado-400 text-pizarra-900 shadow-dorado">
            <CardContent className="p-10 md:p-14 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-pizarra-800" />
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
                Make every family remember you.
              </h2>
              <p className="max-w-2xl mx-auto text-pizarra-800/85 mb-8">
                Join the Partner Program today — no monthly fees, 30-day guarantee.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-pizarra-900 hover:bg-pizarra-800 text-marfil">
                  <Link href="/en/partners#plans">Start with Pack 30</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-pizarra-900 text-pizarra-900 hover:bg-pizarra-900/10">
                  <Link href="/en/contact">Talk to an advisor</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </>
  );
}
