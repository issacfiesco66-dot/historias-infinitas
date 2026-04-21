import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { getAllPublishedPosts } from '@/content/blog/posts';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Blog · Duelo, memoria, nichos virtuales y tecnología aplicada al recuerdo',
  description:
    'Guías y reflexiones sobre duelo, memoria, memoriales digitales, tecnología de IA aplicada al recuerdo y cómo las funerarias, veterinarias y hospicios acompañan a las familias.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog · Historias Infinitas',
    description:
      'Guías sobre duelo, memoria y nichos virtuales. Para familias y para profesionales del sector funerario, veterinario y de hospicios.',
    url: '/blog',
    type: 'website',
  },
  keywords: [
    'blog duelo',
    'blog mascotas duelo',
    'blog memoriales digitales',
    'blog nicho virtual',
    'blog funerarias México',
  ],
};

// Revalidación cada 24 h: el índice del blog casi nunca cambia en caliente
// y queremos HTML estático servido desde la CDN de Vercel.
export const revalidate = 86_400;

const bcLd = breadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Blog', path: '/blog' },
]);

export default function BlogIndexPage() {
  const posts = getAllPublishedPosts();

  // CollectionPage + ItemList JSON-LD — le dice a las IAs qué artículos
  // viven aquí y en qué orden. Cada post se declara como BlogPosting con
  // los datos mínimos que Google y los LLMs consumen.
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/blog`,
    name: 'Blog de Historias Infinitas',
    description:
      'Guías y reflexiones sobre duelo, memoria, memoriales digitales y tecnología aplicada al recuerdo.',
    url: `${SITE_URL}/blog`,
    inLanguage: 'es-MX',
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/blog/${p.slug}`,
        item: {
          '@type': 'BlogPosting',
          '@id': `${SITE_URL}/blog/${p.slug}`,
          headline: p.title,
          description: p.description,
          datePublished: p.datePublished,
          dateModified: p.dateModified,
          author: { '@type': 'Person', name: p.author.name },
          publisher: { '@id': `${SITE_URL}/#organization` },
          image: `${SITE_URL}${p.image}`,
          url: `${SITE_URL}/blog/${p.slug}`,
          keywords: p.keywords.join(', '),
          articleSection: p.category,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bcLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <SiteHeader />

      <main className="container-solemn py-16 md:py-24">
        <header className="text-center mb-14 max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
            Blog · lecturas para acompañar el proceso
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 mb-5">
            Historias, guías y reflexiones sobre la memoria
          </h1>
          <p className="text-pizarra-500 leading-relaxed">
            Textos escritos para quienes atraviesan una pérdida, para quienes
            acompañan a otros, y para los profesionales que hacen del duelo
            un espacio más digno: funerarias, veterinarias y hospicios.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
              <Card className="h-full hover:shadow-dorado transition-shadow overflow-hidden">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs uppercase tracking-widest text-dorado-600">
                      {p.category}
                    </span>
                    <span className="text-pizarra-300">·</span>
                    <span className="text-xs text-pizarra-400">
                      {p.readingMinutes} min de lectura
                    </span>
                  </div>
                  <h2 className="font-serif text-xl text-pizarra-800 mb-3 leading-snug group-hover:text-dorado-600 transition-colors">
                    {p.title}
                  </h2>
                  <p className="text-sm text-pizarra-500 leading-relaxed flex-1">
                    {p.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-pizarra-400">
                    <span>{p.author.name}</span>
                    <time dateTime={p.datePublished}>
                      {new Date(p.datePublished).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
