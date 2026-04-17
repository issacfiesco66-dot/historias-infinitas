'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { DustParticles } from '@/components/viva-images';

interface Props {
  src: string;
  alt: string;
  name: string;
  typeLabel: string;
  birthDate: string;
  passingDate: string;
}

/**
 * Banner hero a pantalla completa (h-90vh) con Ken Burns + gradiente
 * + polvo estelar. El nombre del memorial aparece sobreimpuesto abajo.
 */
export function BannerHero({
  src, alt, name, typeLabel, birthDate, passingDate,
}: Props) {
  const reduced = useReducedMotion();

  return (
    <section className="relative w-full h-[90vh] min-h-[560px] overflow-hidden bg-pizarra-900">
      {/* FONDO: misma foto borrosa para rellenar laterales sin barras negras */}
      <div className="absolute inset-0 scale-110">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover blur-3xl opacity-30"
          quality={40}
        />
      </div>

      {/* IMAGEN PRINCIPAL: object-contain para mostrar los rostros completos,
          con zoom-out suave de 1.25 → 1.0 que revela la escena. */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.25 }}
        animate={
          reduced
            ? { scale: 1 }
            : { scale: [1.25, 1.0, 1.02, 1.0] }
        }
        transition={{
          duration: 18,
          times: [0, 0.6, 0.85, 1],
          ease: [0.22, 1, 0.36, 1],
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-contain"
          quality={92}
        />
      </motion.div>

      {/* Gradiente vignette — lectura limpia */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(20,28,40,0.94) 0%, rgba(20,28,40,0.45) 30%, rgba(20,28,40,0.18) 55%, rgba(20,28,40,0.55) 100%)',
        }}
      />

      {/* Polvo estelar */}
      <DustParticles count={40} />

      {/* NOMBRE + FECHAS — parte inferior */}
      <div className="absolute inset-x-0 bottom-0 text-center text-marfil px-6 pb-16 md:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.3 }}
          className="uppercase tracking-[0.4em] text-xs text-dorado-300 mb-6"
        >
          {typeLabel}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
          transition={{ duration: 1.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-6xl md:text-[6.5rem] leading-[0.95] mb-6 drop-shadow-2xl"
        >
          {name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="flex items-center justify-center gap-4 text-marfil/85 text-base tracking-widest"
        >
          <span>{birthDate}</span>
          <span className="w-10 h-px bg-dorado-300/60" />
          <span>{passingDate}</span>
        </motion.div>
      </div>

      {/* Pista de scroll */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 1.2, delay: 2.2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-marfil/50 text-[10px] uppercase tracking-[0.3em]"
      >
        ↓&nbsp;&nbsp;Desliza
      </motion.div>
    </section>
  );
}
