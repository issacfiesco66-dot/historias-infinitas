import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { Card, CardContent } from '@/components/ui/card';
import { getAllPublishedPostsEN } from '@/content/blog/posts-en';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Blog · Grief, memory, digital memorials and technology for remembrance',
  description:
    'Guides and reflections on grief, memory, digital memorials, AI applied to remembrance, and how funeral homes, vet clinics and hospices support families.',
  alternates: {
    canonical: '/en/blog',
    languages: {
      'es-MX': '/blog',
      'en-US': '/en/blog',
      'x-default': '/blog',
    },
  },
  openGraph: {
    title: 'Historias Infinitas · Blog',
    description:
      'Guides on grief, memory and digital memorials. For families and for professionals in the funeral, veterinary and hospice sectors.',
    url: '/en/blog',
    locale: 'en_US',
    type: 'website',
  },
  keywords: [
    'grief blog',
    'pet loss blog',
    'digital memorial blog',
    'memorial technology blog',
    'funeral home digitization blog',
  ],
};

export const revalidate = 86_400;

const bcLd = breadcrumbJsonLd([
  { name: 'Home', path: '/en' },
  { name: 'Blog', path: '/en/blog' },
]);

export default function BlogIndexEN() {
  const posts = getAllPublishedPostsEN();

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/en/blog`,
    name: 'Historias Infinitas Blog (English)',
    description:
      'Guides and reflections on grief, memory, digital memorials and technology applied to remembrance.',
    url: `${SITE_URL}/en/blog`,
    inLanguage: 'en-US',
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/en/blog/${p.slug}`,
        item: {
          '@type': 'BlogPosting',
          '@id': `${SITE_URL}/en/blog/${p.slug}`,
          headline: p.title,
          description: p.description,
          datePublished: p.datePublished,
          dateModified: p.dateModified,
          author: { '@type': 'Person', name: p.author.name },
          publisher: { '@id': `${SITE_URL}/#organization` },
          image: `${SITE_URL}${p.image}`,
          url: `${SITE_URL}/en/blog/${p.slug}`,
          keywords: p.keywords.join(', '),
          articleSection: p.category,
          inLanguage: 'en-US',
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
      <SiteHeaderEN />

      <main className="container-solemn py-16 md:py-24">
        <header className="text-center mb-14 max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
            Blog · readings to walk with you
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 mb-5">
            Stories, guides and reflections on memory
          </h1>
          <p className="text-pizarra-500 leading-relaxed">
            Writing for those going through a loss, for those supporting others,
            and for the professionals who make grief a more dignified space:
            funeral homes, veterinary clinics and hospices.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link key={p.slug} href={`/en/blog/${p.slug}`} className="group">
              <Card className="h-full hover:shadow-dorado transition-shadow overflow-hidden">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs uppercase tracking-widest text-dorado-600">
                      {p.category}
                    </span>
                    <span className="text-pizarra-300">·</span>
                    <span className="text-xs text-pizarra-400">
                      {p.readingMinutes} min read
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
                      {new Date(p.datePublished).toLocaleDateString('en-US', {
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

      <SiteFooterEN />
    </>
  );
}
