import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { ARPortal } from './ar-portal';
import { BannerHero } from './banner-hero';
import { MemorialOpening } from './memorial-opening';
import { Reveal, FadeH2, FadeP } from '@/components/viva-images';
import { HexGallery } from '@/components/hex-gallery';
import { PhotoWall } from '@/components/photo-wall';
import type { Memorial, MemorialMedia } from '@/types/database';

interface Props { params: { slug: string } }

// ISR — 5 s. Breve para que el asset AR aparezca rápido en el móvil después
// de generarlo desde el dashboard (complementa el revalidatePath explícito
// que lanza /api/ar/generate-frame). A 5 s el tráfico a la DB sigue siendo
// mínimo (una consulta cada 5 s por slug).
export const revalidate = 5;

/* ============================================================================
 *  OG / SEO — WhatsApp, Facebook, iMessage, Twitter.
 *  Prioriza portrait_ai_url, luego cover_photo_url.
 * ========================================================================== */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from('memorials')
    .select('name, type, epitaph, biography, portrait_ai_url, cover_photo_url')
    .eq('slug', params.slug)
    .eq('status', 'publicado')
    .single();

  if (!data) {
    return {
      title: 'Memorial no encontrado — Historias Infinitas',
      description: 'Este memorial no existe o aún no ha sido publicado.',
      robots: { index: false },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ?? process.env.NEXT_PUBLIC_APP_URL
    ?? 'https://historias-infinitas.com';
  const url = `${siteUrl}/memorial/${params.slug}`;
  const img = data.portrait_ai_url ?? data.cover_photo_url ?? `${siteUrl}/og-default.jpg`;
  const title = `En memoria de ${data.name}`;
  const description =
    data.epitaph ??
    (data.biography ? data.biography.slice(0, 140) + '…' : `Un tributo eterno a ${data.name}.`);

  return {
    title: `${title} — Historias Infinitas`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Historias Infinitas',
      locale: 'es_ES',
      type: 'profile',
      images: [{ url: img, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [img],
    },
  };
}

/* ============================================================================
 *  PAGE
 * ========================================================================== */
export default async function PublicMemorialPage({ params }: Props) {
  const supabase = createClient();

  const { data: memorial } = await supabase
    .from('memorials')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'publicado')
    .single();

  if (!memorial) notFound();

  const { data: media } = await supabase
    .from('memorial_media')
    .select('*')
    .eq('memorial_id', memorial.id)
    .order('sort_order', { ascending: true });

  // Contador de visitas (fire-and-forget)
  supabase.rpc('increment_memorial_views', { m_id: memorial.id }).then(() => {});

  // Partner que originó el memorial (para mostrar su logo como cortesía)
  let partnerInfo: { business_name: string; logo_url: string | null } | null = null;
  if (memorial.partner_id) {
    const { data: p } = await supabase
      .from('partner_accounts')
      .select('business_name, logo_url')
      .eq('id', memorial.partner_id)
      .maybeSingle();
    if (p && p.logo_url) partnerInfo = p;
  }

  const m = memorial as Memorial;
  const all = (media ?? []) as MemorialMedia[];
  const photos = all.filter((x) => x.kind === 'foto');
  const videos = all.filter((x) => x.kind === 'video');
  const heroSrc = m.portrait_ai_url ?? m.cover_photo_url;
  const firstVideo = videos[0] ?? null;
  const galleryVideos = videos.slice(1);

  const typeLabel = m.type === 'mascota'
    ? 'En memoria de un compañero fiel'
    : 'En memoria eterna';
  const birthFmt = formatDate(m.birth_date);
  const passingFmt = formatDate(m.passing_date);
  const musicUrl = process.env.NEXT_PUBLIC_DEFAULT_MUSIC_URL ?? null;

  // JSON-LD estructurado — Person (seres queridos) o usar Thing para mascotas.
  // Ayuda a Google a mostrar rich snippets con nombre, fechas e imagen.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'https://historias-infinitas.com';
  const heroImg = m.portrait_ai_url ?? m.cover_photo_url ?? undefined;

  const structuredData: Record<string, unknown> = m.type === 'mascota'
    ? {
        '@context': 'https://schema.org',
        '@type': 'Pet',
        name: m.name,
        image: heroImg,
        birthDate: m.birth_date ?? undefined,
        deathDate: m.passing_date ?? undefined,
        description: m.epitaph ?? m.biography?.slice(0, 200) ?? undefined,
        url: `${siteUrl}/memorial/${m.slug}`,
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: m.name,
        image: heroImg,
        birthDate: m.birth_date ?? undefined,
        deathDate: m.passing_date ?? undefined,
        description: m.epitaph ?? m.biography?.slice(0, 200) ?? undefined,
        url: `${siteUrl}/memorial/${m.slug}`,
      };

  // Breadcrumb — mejora navegación en SERPs
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: m.type === 'mascota' ? 'Memoriales de mascotas' : 'Memoriales',
        item: `${siteUrl}/memorial/${m.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: m.name,
        item: `${siteUrl}/memorial/${m.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-marfil">
      {/* JSON-LD: Person/Pet + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {/* ============ PANTALLA DE ENTRADA (velo + música) ============ */}
      <MemorialOpening
        name={m.name}
        phrase={m.epitaph}
        birthDate={birthFmt}
        passingDate={passingFmt}
        musicUrl={musicUrl}
      />

      {/* ============ BANNER HERO a pantalla completa ============ */}
      {heroSrc ? (
        <BannerHero
          src={heroSrc}
          alt={`Retrato de ${m.name}`}
          name={m.name}
          typeLabel={typeLabel}
          birthDate={birthFmt}
          passingDate={passingFmt}
        />
      ) : (
        <section className="bg-pizarra-900 py-32 text-center text-marfil">
          <p className="uppercase tracking-[0.4em] text-xs text-dorado-300 mb-6">{typeLabel}</p>
          <h1 className="font-serif text-6xl md:text-8xl leading-[0.95] mb-6">{m.name}</h1>
          <p className="text-marfil/75 text-base tracking-widest">
            {birthFmt} &nbsp;·&nbsp; {passingFmt}
          </p>
        </section>
      )}

      {/* Marca "Historia Infinita" en el borde del banner */}
      <div className="container-solemn -mt-6 relative z-10">
        <div className="flex items-center justify-center gap-3 text-pizarra-400">
          <span className="hairline" />
          <span className="text-xs uppercase tracking-widest">Historia Infinita</span>
          <span className="hairline" />
        </div>
      </div>

      {/* ============ EPITAFIO — destacado ============ */}
      {m.epitaph && (
        <section className="container-solemn py-20">
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="inline-block font-serif text-6xl md:text-7xl text-dorado-400 leading-none mb-2">“</span>
            <FadeH2
              duration={1.4}
              className="font-serif italic text-3xl md:text-5xl text-pizarra-700 leading-tight"
            >
              {m.epitaph}
            </FadeH2>
          </Reveal>
        </section>
      )}

      {/* ============ BIOGRAFÍA ============ */}
      {m.biography && (
        <section className="container-solemn py-16">
          <Reveal className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">Su historia</FadeP>
              <FadeH2 className="font-serif text-3xl md:text-4xl text-pizarra-800">
                Quien fue, y quien sigue siendo
              </FadeH2>
            </div>
            <FadeP
              delay={0.1}
              className="font-serif text-lg md:text-xl text-pizarra-700 leading-[1.8] whitespace-pre-line first-letter:font-serif first-letter:text-5xl first-letter:text-dorado-500 first-letter:float-left first-letter:mr-2 first-letter:leading-[0.9]"
            >
              {m.biography}
            </FadeP>
          </Reveal>
        </section>
      )}

      {/* ============ VOZ / PRESENCIA — primer video con reproductor solemne ============ */}
      {firstVideo && (
        <section className="container-solemn py-16">
          <Reveal className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
                Su voz, su presencia
              </FadeP>
              <FadeH2 className="font-serif text-3xl md:text-4xl text-pizarra-800">
                Un recuerdo que vuelve a llegar
              </FadeH2>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-pizarra-900 shadow-solemn">
              <video
                src={firstVideo.url}
                controls
                poster={m.portrait_ai_url ?? m.cover_photo_url ?? undefined}
                className="w-full aspect-video object-cover"
                preload="metadata"
              />
              <span className="absolute top-4 left-4 bg-pizarra-900/80 text-marfil text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                Recuerdo
              </span>
            </div>
            {firstVideo.caption && (
              <p className="mt-4 text-center text-sm italic text-pizarra-500">
                — {firstVideo.caption}
              </p>
            )}
          </Reveal>
        </section>
      )}

      {/* ============ GALERÍA — PANAL HEXAGONAL (con rotación) ============ */}
      {photos.length > 0 && (
        <section className="container-solemn py-16">
          <Reveal className="text-center mb-12">
            <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">Galería</FadeP>
            <FadeH2 className="font-serif text-3xl md:text-4xl text-pizarra-800">
              Un panal de momentos
            </FadeH2>
            {photos.length > 7 && (
              <FadeP delay={0.1} className="text-sm text-pizarra-500 mt-3">
                Las fotografías se turnan — cada recuerdo tiene su momento.
              </FadeP>
            )}
          </Reveal>

          <Reveal delay={0.15}>
            <HexGallery
              photos={photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption }))}
            />
          </Reveal>
        </section>
      )}

      {/* ============ PARED DE RECUERDOS — collage scrapbook con todas las fotos ============ */}
      {photos.length >= 3 && (
        <section className="container-solemn py-16">
          <Reveal className="text-center mb-12">
            <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
              Pared de recuerdos
            </FadeP>
            <FadeH2 className="font-serif text-3xl md:text-4xl text-pizarra-800">
              Cada fotografía, un instante eterno
            </FadeH2>
          </Reveal>

          <Reveal delay={0.1}>
            <PhotoWall
              photos={photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption }))}
            />
          </Reveal>
        </section>
      )}

      {/* ============ VIDEOS de galería (si hay más de uno) ============ */}
      {galleryVideos.length > 0 && (
        <section className="container-solemn py-8">
          <Reveal delay={0.1}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryVideos.map((mm) => (
                <figure
                  key={mm.id}
                  className="rounded-xl overflow-hidden bg-pizarra-100 shadow-solemn"
                >
                  <video
                    src={mm.url}
                    controls
                    preload="metadata"
                    className="w-full h-auto block"
                  />
                  {mm.caption && (
                    <figcaption className="px-3 py-2 text-xs italic text-pizarra-500 bg-marfil-100">
                      {mm.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ============ CIERRE ============ */}
      <section className="container-solemn py-20 text-center">
        <Reveal>
          <span className="hairline inline-block mb-6" />
          <FadeP className="font-serif italic text-2xl text-pizarra-600 max-w-xl mx-auto">
            Los que amamos no se van — permanecen en cada gesto nuestro, en cada silencio.
          </FadeP>
        </Reveal>
      </section>

      <footer className="py-10 text-center text-sm text-pizarra-400 border-t border-pizarra-100">
        {partnerInfo && (
          <div className="max-w-xl mx-auto mb-6 px-6 py-4 bg-marfil-100 rounded-xl border border-pizarra-100 flex items-center justify-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={partnerInfo.logo_url ?? undefined}
              alt={partnerInfo.business_name}
              className="h-10 w-auto max-w-[120px] object-contain"
            />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-dorado-600">
                Cortesía de
              </p>
              <p className="font-serif text-pizarra-700">{partnerInfo.business_name}</p>
            </div>
          </div>
        )}
        <p>
          Creado con amor en{' '}
          <Link href="/" className="text-dorado-600 hover:underline">
            Historias Infinitas
          </Link>
        </p>
      </footer>

      {/* ============ BOTÓN FLOTANTE "VER EN TU HOGAR" ============ */}
      <ARPortal
        personName={m.name}
        videoUrl={m.ar_video_url ?? firstVideo?.url ?? null}
        modelUrl={m.ar_model_url ?? null}
        posterUrl={m.portrait_ai_url ?? m.cover_photo_url ?? null}
      />
    </div>
  );
}
