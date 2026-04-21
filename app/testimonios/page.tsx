import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';
import { getTestimonialsByLang, computeAggregateRating } from '@/content/testimonials';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Testimonios · Historias Infinitas',
  description:
    'Familias, funerarias, clínicas veterinarias y hospicios que usan Historias Infinitas comparten cómo los memoriales digitales acompañan el duelo y dignifican la memoria.',
  alternates: {
    canonical: '/testimonios',
    languages: {
      'es-MX': '/testimonios',
      'en-US': '/en/testimonials',
      'x-default': '/testimonios',
    },
  },
  openGraph: {
    title: 'Testimonios · Historias Infinitas',
    description:
      'Historias reales de familias y socios que usan Historias Infinitas para honrar a quienes aman.',
    url: '/testimonios',
    type: 'website',
  },
};

export const revalidate = 3600; // 1 h — por si se añaden testimonios sin redeploy

const bcLd = breadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Testimonios', path: '/testimonios' },
]);

export default function TestimoniosPage() {
  const testimonials = getTestimonialsByLang('es');
  const aggregate = computeAggregateRating(testimonials);

  // Schema Review por cada testimonio + AggregateRating a nivel Organization
  // cuando hay al menos 5 reviews (mínimo Google para mostrar estrellas).
  const reviewJsonLd =
    testimonials.length > 0
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            ...(aggregate
              ? [
                  {
                    '@type': 'Organization',
                    '@id': `${SITE_URL}/#organization`,
                    aggregateRating: {
                      '@type': 'AggregateRating',
                      ...aggregate,
                    },
                  },
                ]
              : []),
            ...testimonials.map((t) => ({
              '@type': 'Review',
              '@id': `${SITE_URL}/testimonios#${t.id}`,
              author: { '@type': 'Person', name: t.author },
              datePublished: t.date,
              reviewBody: t.body,
              reviewRating: {
                '@type': 'Rating',
                ratingValue: t.rating,
                bestRating: 5,
                worstRating: 1,
              },
              itemReviewed: { '@id': `${SITE_URL}/#organization` },
              inLanguage: 'es-MX',
            })),
          ],
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bcLd) }}
      />
      {reviewJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
        />
      )}
      <SiteHeader />

      <main className="container-solemn py-16 md:py-24">
        <header className="text-center mb-14 max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
            Testimonios
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 mb-5">
            Lo que dicen las familias y los socios
          </h1>
          {aggregate && (
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(aggregate.ratingValue)
                        ? 'fill-dorado-400 text-dorado-400'
                        : 'text-pizarra-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-pizarra-700 font-medium">
                {aggregate.ratingValue} / 5
              </span>
              <span className="text-pizarra-400 text-sm">
                · {aggregate.reviewCount} reseñas
              </span>
            </div>
          )}
          <p className="text-lg text-pizarra-600 leading-relaxed">
            Cada testimonio abajo fue compartido con consentimiento explícito
            del autor. Preferimos tener pocos testimonios reales que muchos
            inventados.
          </p>
        </header>

        {testimonials.length === 0 ? (
          <section className="max-w-2xl mx-auto text-center bg-marfil rounded-2xl border border-pizarra-100 p-10 md:p-14">
            <h2 className="font-serif text-2xl text-pizarra-800 mb-4">
              Aún no publicamos testimonios
            </h2>
            <p className="text-pizarra-600 leading-relaxed mb-8">
              Historias Infinitas es un proyecto joven. Recopilamos testimonios
              reales de familias y socios con consentimiento archivado antes de
              publicarlos aquí. ¿Ya usaste nuestro servicio y te gustaría
              compartir tu experiencia?
            </p>
            <Link
              href="/contacto?asunto=testimonio"
              className="inline-flex items-center justify-center rounded-xl bg-dorado-500 text-pizarra-900 px-6 py-3 font-medium hover:bg-dorado-600 transition"
            >
              Quiero dejar mi testimonio
            </Link>
          </section>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <blockquote
                key={t.id}
                className="bg-marfil rounded-2xl border border-pizarra-100 p-8 shadow-solemn"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < t.rating
                          ? 'fill-dorado-400 text-dorado-400'
                          : 'text-pizarra-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="font-serif text-lg text-pizarra-700 leading-relaxed mb-5 italic">
                  &ldquo;{t.body}&rdquo;
                </p>
                <footer className="text-sm">
                  <cite className="not-italic font-medium text-pizarra-800">
                    {t.author}
                  </cite>
                  {(t.location || t.role === 'socio') && (
                    <span className="text-pizarra-400 ml-2">
                      · {t.role === 'socio' && t.company ? t.company : t.location}
                    </span>
                  )}
                  {t.plan && (
                    <span className="block text-pizarra-400 text-xs uppercase tracking-widest mt-1">
                      Plan {t.plan}
                    </span>
                  )}
                </footer>
              </blockquote>
            ))}
          </div>
        )}

        <section className="mt-20 text-center">
          <Link
            href="/empieza"
            className="inline-flex items-center justify-center rounded-xl bg-dorado-500 text-pizarra-900 px-6 py-3 font-medium hover:bg-dorado-600 transition"
          >
            Empezar mi nicho virtual
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
