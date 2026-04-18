'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
}

interface Props {
  photos: Photo[];
  className?: string;
}

/**
 * Pared de recuerdos — masonry tipo scrapbook.
 *
 * Cada fotografía cae con una inclinación aleatoria pero determinista (derivada
 * del id de la foto, para que SSR y CSR coincidan y no salten en hydration).
 * Usa CSS `columns` para el masonry — cero JS de layout, cero layout shift.
 *
 * Las fotos tienen un marco marfil ligeramente destacado y sombra suave para
 * evocar polaroids pegadas sobre una pared. Al entrar en viewport, cada
 * tarjeta hace fade + ligero lift con stagger en cascada.
 */
export function PhotoWall({ photos, className }: Props) {
  // Gate con useMounted para evitar hydration mismatch (#418/#425/#423):
  // `useReducedMotion` devuelve null en SSR y boolean en cliente → los
  // atributos de motion difieren entre render inicial y hydration.
  const rawReduced = useReducedMotion();
  const mounted = useMounted();
  const reduced = mounted ? rawReduced : false;

  if (photos.length === 0) return null;

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-5xl',
        // CSS columns — masonry real, sin JS de medida
        'columns-2 md:columns-3 lg:columns-4',
        'gap-3 sm:gap-4 md:gap-5',
        className,
      )}
    >
      {photos.map((photo, i) => {
        const tilt = tiltFromId(photo.id);
        // Stagger suave, con tope para que no se sienta eterno si hay 40 fotos.
        const delay = Math.min(i * 0.06, 1.2);

        return (
          <motion.figure
            key={photo.id}
            className="mb-3 sm:mb-4 md:mb-5 break-inside-avoid"
            initial={reduced ? false : { opacity: 0, y: 24, rotate: 0 }}
            whileInView={
              reduced
                ? undefined
                : { opacity: 1, y: 0, rotate: tilt }
            }
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
            style={reduced ? { transform: `rotate(${tilt}deg)` } : undefined}
          >
            <div className="relative bg-marfil-50 p-2 sm:p-2.5 rounded-sm shadow-solemn hover:shadow-dorado transition-shadow duration-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? 'Recuerdo'}
                loading="lazy"
                className="block w-full h-auto rounded-[2px]"
              />
              {photo.caption && (
                <figcaption className="px-1 pt-2 pb-1 text-center font-serif italic text-sm text-pizarra-500">
                  — {photo.caption}
                </figcaption>
              )}
            </div>
          </motion.figure>
        );
      })}
    </div>
  );
}

/**
 * Hash muy simple del id → ángulo entre -4° y +4°.
 * Determinista: la misma foto cae siempre con la misma inclinación, y SSR/CSR
 * producen el mismo valor (no necesita useMemo con Math.random).
 */
function tiltFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  // Rango [-4, 4], evitamos el 0 exacto para que siempre haya carácter.
  const v = ((h % 801) / 100) - 4; // [-4.00 .. 4.00]
  return Number(v.toFixed(2));
}
