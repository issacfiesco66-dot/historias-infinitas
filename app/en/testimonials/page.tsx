import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';
import { getTestimonialsByLang, computeAggregateRating } from '@/content/testimonials';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Testimonials · Historias Infinitas',
  description:
    'Families, funeral homes, veterinary clinics and hospices using Historias Infinitas share how digital memorials support grief and dignify memory.',
  alternates: {
    canonical: '/en/testimonials',
    languages: {
      'es-MX': '/testimonios',
      'en-US': '/en/testimonials',
      'x-default': '/testimonios',
    },
  },
  openGraph: {
    title: 'Testimonials · Historias Infinitas',
    description:
      'Real stories from families and partners using Historias Infinitas.',
    url: '/en/testimonials',
    locale: 'en_US',
    type: 'website',
  },
};

export const revalidate = 3600;

const bcLd = breadcrumbJsonLd([
  { name: 'Home', path: '/en' },
  { name: 'Testimonials', path: '/en/testimonials' },
]);

export default function TestimonialsEN() {
  const testimonials = getTestimonialsByLang('en');
  const aggregate = computeAggregateRating(testimonials);

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
              '@id': `${SITE_URL}/en/testimonials#${t.id}`,
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
              inLanguage: 'en-US',
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
      <SiteHeaderEN />

      <main className="container-solemn py-16 md:py-24">
        <header className="text-center mb-14 max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
            Testimonials
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 mb-5">
            What families and partners say
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
                · {aggregate.reviewCount} reviews
              </span>
            </div>
          )}
          <p className="text-lg text-pizarra-600 leading-relaxed">
            Every testimonial below was shared with explicit consent from its
            author. We'd rather have a few real testimonials than many invented
            ones.
          </p>
        </header>

        {testimonials.length === 0 ? (
          <section className="max-w-2xl mx-auto text-center bg-marfil rounded-2xl border border-pizarra-100 p-10 md:p-14">
            <h2 className="font-serif text-2xl text-pizarra-800 mb-4">
              We haven't published testimonials yet
            </h2>
            <p className="text-pizarra-600 leading-relaxed mb-8">
              Historias Infinitas is a young project. We only publish real
              testimonials with archived consent. Have you used our service and
              would like to share your experience?
            </p>
            <Link
              href="/en/contact?asunto=testimonial"
              className="inline-flex items-center justify-center rounded-xl bg-dorado-500 text-pizarra-900 px-6 py-3 font-medium hover:bg-dorado-600 transition"
            >
              I want to leave a testimonial
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
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-dorado-500 text-pizarra-900 px-6 py-3 font-medium hover:bg-dorado-600 transition"
          >
            Start my digital memorial
          </Link>
        </section>
      </main>

      <SiteFooterEN />
    </>
  );
}
