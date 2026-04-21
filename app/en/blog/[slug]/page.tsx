import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { getBlogPostEnBySlug, getAllPublishedPostsEN } from '@/content/blog/posts-en';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPublishedPostsEN().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostEnBySlug(params.slug);
  if (!post) return { title: 'Article not found' };

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/en/blog/${post.slug}`,
      languages: {
        'es-MX': `/blog/${post.esSlug}`,
        'en-US': `/en/blog/${post.slug}`,
        'x-default': `/blog/${post.esSlug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/en/blog/${post.slug}`,
      type: 'article',
      locale: 'en_US',
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [post.author.name],
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

export default function BlogPostEN({ params }: Props) {
  const post = getBlogPostEnBySlug(params.slug);
  if (!post) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/en/blog/${post.slug}`,
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: {
      '@type': 'Person',
      name: post.author.name,
      ...(post.author.url ? { url: post.author.url } : {}),
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}${post.image}`,
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/en/blog/${post.slug}`,
    },
    inLanguage: 'en-US',
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    timeRequired: `PT${post.readingMinutes}M`,
    isAccessibleForFree: true,
    translationOfWork: {
      '@type': 'CreativeWork',
      '@id': `${SITE_URL}/blog/${post.esSlug}`,
      inLanguage: 'es-MX',
    },
  };

  const bcLd = breadcrumbJsonLd([
    { name: 'Home', path: '/en' },
    { name: 'Blog', path: '/en/blog' },
    { name: post.title, path: `/en/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bcLd) }}
      />
      <SiteHeaderEN />

      <main className="container-solemn py-12 md:py-20">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-widest text-dorado-600">
              <Link href="/en/blog" className="hover:text-dorado-800">Blog</Link>
              <span className="text-pizarra-300">/</span>
              <span className="text-pizarra-500">{post.category}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl leading-[1.15] text-pizarra-800 mb-6">
              {post.title}
            </h1>
            <p className="text-lg text-pizarra-600 leading-relaxed mb-6">
              {post.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-pizarra-400">
              <span>{post.author.name}</span>
              <span className="text-pizarra-300">·</span>
              <time dateTime={post.datePublished}>
                {new Date(post.datePublished).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <span className="text-pizarra-300">·</span>
              <span>{post.readingMinutes} min read</span>
              <span className="text-pizarra-300">·</span>
              <Link
                href={`/blog/${post.esSlug}`}
                className="text-dorado-600 hover:text-dorado-700 underline"
                hrefLang="es-MX"
              >
                Leer en español
              </Link>
            </div>
          </header>

          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <footer className="mt-16 pt-8 border-t border-pizarra-100">
            <p className="text-sm text-pizarra-500 mb-4">
              Lost someone you want to remember forever?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-dorado-500 text-pizarra-900 px-6 py-3 font-medium hover:bg-dorado-600 transition"
              >
                Create a digital memorial
              </Link>
              <Link
                href="/en/blog"
                className="inline-flex items-center justify-center rounded-xl border border-pizarra-300 text-pizarra-700 px-6 py-3 font-medium hover:bg-pizarra-50 transition"
              >
                Back to blog
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <SiteFooterEN />
    </>
  );
}
