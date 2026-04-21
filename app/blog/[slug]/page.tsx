import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getBlogPostBySlug, getAllPublishedPosts } from '@/content/blog/posts';
import { getEnSlugForEsSlug } from '@/content/blog/posts-en';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

interface Props {
  params: { slug: string };
}

// Pre-generamos cada artículo en build time — HTML estático, TTFB < 50 ms.
export async function generateStaticParams() {
  return getAllPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return { title: 'Artículo no encontrado' };

  // Si existe una versión EN del post, emitimos hreflang alternates.
  // Google usa esto para agrupar ambas URLs como variantes del mismo contenido.
  const enSlug = getEnSlugForEsSlug(post.slug);
  const languages: Record<string, string> = {
    'es-MX': `/blog/${post.slug}`,
    'x-default': `/blog/${post.slug}`,
  };
  if (enSlug) {
    languages['en-US'] = `/en/blog/${enSlug}`;
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: 'article',
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

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  // Schema Article — es el formato que Google, ChatGPT, Perplexity y Gemini
  // esperan para citar un artículo de blog. Incluir `wordCount` y `articleBody`
  // mejora las probabilidades de que se use como fuente en respuestas.
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}`,
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
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    inLanguage: 'es-MX',
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    timeRequired: `PT${post.readingMinutes}M`,
    isAccessibleForFree: true,
  };

  const bcLd = breadcrumbJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  // Si el post declara pasos HowTo, emitimos también el schema HowTo.
  // Google lo usa para rich snippets de "cómo hacer X" y los LLMs lo citan
  // directamente en respuestas paso-a-paso.
  const howToJsonLd = post.howTo
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        '@id': `${SITE_URL}/blog/${post.slug}#howto`,
        name: post.howTo.name,
        description: post.description,
        inLanguage: 'es-MX',
        ...(post.howTo.totalMinutes
          ? { totalTime: `PT${post.howTo.totalMinutes}M` }
          : {}),
        step: post.howTo.steps.map((s, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: s.name,
          text: s.text,
          ...(s.minutes ? { timeRequired: `PT${s.minutes}M` } : {}),
        })),
      }
    : null;

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
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}
      <SiteHeader />

      <main className="container-solemn py-12 md:py-20">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-widest text-dorado-600">
              <Link href="/blog" className="hover:text-dorado-800">Blog</Link>
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
                {new Date(post.datePublished).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <span className="text-pizarra-300">·</span>
              <span>{post.readingMinutes} min de lectura</span>
            </div>
          </header>

          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <footer className="mt-16 pt-8 border-t border-pizarra-100">
            <p className="text-sm text-pizarra-500 mb-4">
              ¿Perdiste a alguien que quieres recordar para siempre?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/empieza"
                className="inline-flex items-center justify-center rounded-xl bg-dorado-500 text-pizarra-900 px-6 py-3 font-medium hover:bg-dorado-600 transition"
              >
                Crear un nicho virtual
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-xl border border-pizarra-300 text-pizarra-700 px-6 py-3 font-medium hover:bg-pizarra-50 transition"
              >
                Volver al blog
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
