'use client';

import { AnimatedHeroImage, FadeH1, FadeH2, FadeP, Reveal } from '@/components/viva-images';
import { formatDate } from '@/lib/utils';
import type { MemorialMedia, MemorialType } from '@/types/database';

export interface MemorialPreviewData {
  type: MemorialType;
  name: string;
  birth_date: string | null;
  passing_date: string | null;
  epitaph: string | null;
  biography: string | null;
  cover_photo_url: string | null;
  portrait_ai_url: string | null;
  media: MemorialMedia[];
}

/**
 * Preview en vivo del memorial público, a escala.
 * Usa exactamente los mismos componentes de movimiento que /memorial/[slug]
 * para que el usuario experimente el resultado real mientras edita.
 */
export function MemorialPreview({ data }: { data: MemorialPreviewData }) {
  const heroSrc = data.portrait_ai_url ?? data.cover_photo_url;
  const photos = data.media.filter((x) => x.kind === 'foto');
  const videos = data.media.filter((x) => x.kind === 'video');

  return (
    <div className="bg-marfil rounded-2xl overflow-hidden border border-pizarra-100 shadow-solemn">
      {/* Barra simulada de navegador para dar sensación de "ventana" */}
      <div className="flex items-center gap-2 px-4 py-3 bg-pizarra-50 border-b border-pizarra-100">
        <span className="h-2.5 w-2.5 rounded-full bg-pizarra-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-pizarra-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-pizarra-200" />
        <span className="ml-3 text-[11px] text-pizarra-400 font-mono truncate">
          historias-infinitas.com/memorial/...
        </span>
      </div>

      {/* Contenido — el mismo layout que la página pública, pero más compacto */}
      <div className="max-h-[78vh] overflow-y-auto">
        {/* HERO */}
        <section className="px-6 pt-8 pb-4 text-center">
          <FadeP className="uppercase tracking-[0.3em] text-[10px] text-dorado-600 mb-4">
            {data.type === 'mascota' ? 'En memoria de un compañero fiel' : 'En memoria eterna'}
          </FadeP>

          {heroSrc ? (
            <div className="max-w-md mx-auto">
              <AnimatedHeroImage
                src={heroSrc}
                alt={`Retrato de ${data.name || 'el recuerdo'}`}
                aspect="hero"
                priority={false}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto aspect-[16/10] rounded-2xl border-2 border-dashed border-pizarra-200 flex items-center justify-center text-pizarra-400 text-sm px-6">
              Sube una foto para ver el retrato aquí
            </div>
          )}

          <FadeH1
            key={data.name /* re-trigger animación al cambiar nombre */}
            duration={1.1}
            className="font-serif text-3xl md:text-4xl text-pizarra-800 leading-tight mt-8"
          >
            {data.name || 'Sin nombre aún'}
          </FadeH1>

          <FadeP className="mt-3 text-pizarra-500 text-sm tracking-wide">
            {formatDate(data.birth_date)} &nbsp;·&nbsp; {formatDate(data.passing_date)}
          </FadeP>
        </section>

        {/* EPITAFIO */}
        {data.epitaph && (
          <section className="px-6 py-8 text-center">
            <Reveal>
              <span className="inline-block font-serif text-4xl text-dorado-400 leading-none mb-1">“</span>
              <FadeH2
                key={data.epitaph}
                duration={1.1}
                className="font-serif italic text-xl md:text-2xl text-pizarra-700 leading-snug"
              >
                {data.epitaph}
              </FadeH2>
            </Reveal>
          </section>
        )}

        {/* BIOGRAFÍA */}
        {data.biography && (
          <section className="px-6 py-8">
            <div className="max-w-xl mx-auto">
              <FadeP className="uppercase tracking-[0.3em] text-[10px] text-dorado-600 text-center mb-2">
                Su historia
              </FadeP>
              <FadeP
                key={data.biography.slice(0, 40)}
                className="font-serif text-sm md:text-base text-pizarra-700 leading-[1.8] whitespace-pre-line first-letter:font-serif first-letter:text-3xl first-letter:text-dorado-500 first-letter:float-left first-letter:mr-2 first-letter:leading-[0.9]"
              >
                {data.biography}
              </FadeP>
            </div>
          </section>
        )}

        {/* VOZ / VIDEO */}
        {videos[0] && (
          <section className="px-6 py-6">
            <div className="max-w-lg mx-auto">
              <p className="uppercase tracking-[0.3em] text-[10px] text-dorado-600 text-center mb-2">
                Su voz, su presencia
              </p>
              <div className="rounded-xl overflow-hidden bg-pizarra-900">
                <video
                  src={videos[0].url}
                  controls
                  className="w-full aspect-video object-cover"
                  preload="metadata"
                />
              </div>
            </div>
          </section>
        )}

        {/* GALERÍA masonry compacta */}
        {photos.length > 0 && (
          <section className="px-6 py-6">
            <FadeP className="uppercase tracking-[0.3em] text-[10px] text-dorado-600 text-center mb-3">
              Galería
            </FadeP>
            <div className="columns-3 gap-2 [column-fill:_balance]">
              {photos.map((mm) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={mm.id}
                  src={mm.url}
                  alt=""
                  className="mb-2 w-full h-auto rounded-md break-inside-avoid"
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        {/* Cierre */}
        <section className="px-6 pt-6 pb-10 text-center border-t border-pizarra-100 mt-6">
          <p className="font-serif italic text-sm text-pizarra-500 max-w-md mx-auto">
            Los que amamos no se van — permanecen en cada gesto nuestro, en cada silencio.
          </p>
        </section>
      </div>
    </div>
  );
}
