import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

const FOUNDER_NAME = process.env.NEXT_PUBLIC_FOUNDER_NAME ?? '';
const FOUNDER_ROLE_EN = process.env.NEXT_PUBLIC_FOUNDER_ROLE_EN ?? 'Founder';
const FOUNDER_BIO_EN = process.env.NEXT_PUBLIC_FOUNDER_BIO_EN ?? '';
const FOUNDER_LINKEDIN = process.env.NEXT_PUBLIC_FOUNDER_LINKEDIN ?? '';
const FOUNDER_IMAGE = process.env.NEXT_PUBLIC_FOUNDER_IMAGE ?? '/images/team/founder.jpg';
const FOUNDER_EDUCATION = process.env.NEXT_PUBLIC_FOUNDER_EDUCATION ?? '';
const FOUNDER_EXPERTISE_EN =
  process.env.NEXT_PUBLIC_FOUNDER_EXPERTISE_EN ??
  'Grief technology,Generative AI,Emotional product design';

export const metadata: Metadata = {
  title: 'About · Historias Infinitas',
  description:
    'Historias Infinitas is a Mexican-born digital memorial platform that combines Artificial Intelligence, Augmented Reality and laser-engraved steel plates to preserve the memory of those you love. Founded in 2026.',
  alternates: {
    canonical: '/en/about',
    languages: {
      'es-MX': '/acerca',
      'en-US': '/en/about',
      'x-default': '/acerca',
    },
  },
  openGraph: {
    title: 'About · Historias Infinitas',
    description:
      'Who we are, what we build and why. The story behind the Mexican-born digital memorial platform.',
    url: '/en/about',
    locale: 'en_US',
    type: 'article',
  },
};

const bcLd = breadcrumbJsonLd([
  { name: 'Home', path: '/en' },
  { name: 'About', path: '/en/about' },
]);

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/en/about`,
  name: 'About Historias Infinitas',
  url: `${SITE_URL}/en/about`,
  inLanguage: 'en-US',
  mainEntity: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/en/about` },
    ],
  },
};

const personJsonLd = FOUNDER_NAME
  ? {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${SITE_URL}/acerca#founder`,
      name: FOUNDER_NAME,
      jobTitle: FOUNDER_ROLE_EN,
      ...(FOUNDER_BIO_EN ? { description: FOUNDER_BIO_EN } : {}),
      ...(FOUNDER_IMAGE ? { image: `${SITE_URL}${FOUNDER_IMAGE}` } : {}),
      ...(FOUNDER_LINKEDIN ? { sameAs: [FOUNDER_LINKEDIN] } : {}),
      ...(FOUNDER_EDUCATION
        ? {
            alumniOf: {
              '@type': 'EducationalOrganization',
              name: FOUNDER_EDUCATION,
            },
          }
        : {}),
      knowsAbout: FOUNDER_EXPERTISE_EN.split(',').map((s) => s.trim()).filter(Boolean),
      worksFor: { '@id': `${SITE_URL}/#organization` },
    }
  : null;

export default function AboutEN() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bcLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      {personJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      )}

      <SiteHeaderEN />

      <main className="container-solemn py-16 md:py-24">
        <article className="max-w-3xl mx-auto">
          <header className="text-center mb-16">
            <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
              About
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 mb-5">
              Memory deserves better tools
            </h1>
            <p className="text-lg text-pizarra-600 leading-relaxed">
              Historias Infinitas was born in Mexico with a simple idea: those
              we love should not disappear under a social media algorithm, nor
              should they depend on marble that erodes. They deserve a place of
              their own — permanent, dignified, reachable.
            </p>
          </header>

          <section className="prose-blog mb-16">
            <h2>What we build</h2>
            <p>
              Historias Infinitas is a platform for <a href="/en/blog/what-is-a-digital-memorial">digital memorials</a> — permanent web
              pages in memory of a loved one or a pet. Each memorial combines a
              biography, photo and video gallery, an <a href="/en/blog/ai-identity-preservation-portraits-flux-kontext-max">identity-preserving AI
              portrait</a>, a printable QR code and a stainless-steel plate
              engraved with laser. An optional Augmented Reality Portal lets
              anyone who scans the QR see a 2D farewell scene or a 3D model of
              the loved one appear in their living room — no app install needed.
            </p>

            <h2>Why we build it</h2>
            <p>
              Mexican and Latin families carry a deep relationship with memory
              — Day of the Dead, the novenario, the 40-day mass, the first
              anniversary. Yet the digital tools we had inherited were not
              worthy of that relationship: PDF obituaries, Facebook tributes
              the algorithm buries, memorial pages with monthly fees that
              disappear when you stop paying. In 2024, when generative AI
              models reached the fidelity needed to respect a real person's
              identity in an artistic portrait, we saw the opportunity to
              build a platform that finally matched the bar.
            </p>

            <h2>Our principles</h2>
            <ul>
              <li>
                <strong>Real permanence, not marketing</strong>: one-time
                payment, eternal hosting, and a public commitment in our <a href="/en/terms">Terms
                of Service</a> to hand the complete memorial archive to the
                owners if the company ever ceases operations.
              </li>
              <li>
                <strong>Respect for identity</strong>: the AI models we use
                (Flux Kontext Max from Black Forest Labs) preserve a person's
                real features — no deformation, no invention, no replacement.
              </li>
              <li>
                <strong>Dignity in design</strong>: no ads, no distractions,
                serious typography, careful tone. A digital memorial is not a
                social feed.
              </li>
              <li>
                <strong>Legal compliance from day one</strong>: LFPDPPP in
                Mexico, GDPR-equivalent for European visitors, CCPA/CPRA for
                the California market, PIPEDA for Canada. We sign DPAs with
                funeral homes that require them.
              </li>
              <li>
                <strong>Mexican roots, bilingual reach</strong>: we started in
                Mexico City but we serve Mexico, the United States and Canada.
                The Mexican diasporic community is a core audience.
              </li>
            </ul>

            <h2>How we operate</h2>
            <p>
              We are a small company, operated with modern tools that let us
              do a lot with a small team:
            </p>
            <ul>
              <li>Hosting and SSR on Vercel (Next.js 14 App Router).</li>
              <li>Database and storage on Supabase (Postgres + RLS).</li>
              <li>Flux Kontext Max AI model served via Replicate.</li>
              <li>Payments with Stripe (USD and MXN).</li>
              <li>Transactional email with Resend.</li>
            </ul>
            <p>
              We share these technical details publicly because we believe in
              transparency: the families who trust us with the memory of those
              they love deserve to know exactly what infrastructure that data
              lives on.
            </p>

            <h2>Geographic coverage</h2>
            <p>
              We operate in Mexico (MXN pricing, CFDI 4.0 invoicing) and in the
              United States and Canada (USD pricing, physical plate shipping to
              your address). There is a Spanish version of the site at <a href="/">historias-infinitas.com</a> for our Mexican market.
            </p>
          </section>

          {FOUNDER_NAME && (
            <section aria-labelledby="team-heading-en" className="mb-16">
              <div className="bg-marfil rounded-2xl border border-pizarra-100 p-8 md:p-12">
                <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
                  Who's behind this
                </p>
                <h2 id="team-heading-en" className="font-serif text-3xl text-pizarra-800 mb-6">
                  {FOUNDER_NAME}
                </h2>
                <p className="text-sm uppercase tracking-widest text-pizarra-400 mb-6">
                  {FOUNDER_ROLE_EN}
                </p>
                {FOUNDER_BIO_EN && (
                  <p className="text-pizarra-700 leading-relaxed mb-6">
                    {FOUNDER_BIO_EN}
                  </p>
                )}
                {FOUNDER_LINKEDIN && (
                  <Link
                    href={FOUNDER_LINKEDIN}
                    className="text-dorado-600 underline hover:text-dorado-700 text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Connect on LinkedIn →
                  </Link>
                )}
              </div>
            </section>
          )}

          <section className="mb-16">
            <h2 className="font-serif text-3xl text-pizarra-800 mb-6">
              Want to know more?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/en/blog"
                className="inline-flex items-center justify-center rounded-xl bg-dorado-500 text-pizarra-900 px-6 py-3 font-medium hover:bg-dorado-600 transition"
              >
                Read the blog
              </Link>
              <Link
                href="/en/contact"
                className="inline-flex items-center justify-center rounded-xl border border-pizarra-300 text-pizarra-700 px-6 py-3 font-medium hover:bg-pizarra-50 transition"
              >
                Contact us
              </Link>
              <Link
                href="/en/partners"
                className="inline-flex items-center justify-center rounded-xl border border-pizarra-300 text-pizarra-700 px-6 py-3 font-medium hover:bg-pizarra-50 transition"
              >
                Partner program
              </Link>
            </div>
          </section>
        </article>
      </main>

      <SiteFooterEN />
    </>
  );
}
