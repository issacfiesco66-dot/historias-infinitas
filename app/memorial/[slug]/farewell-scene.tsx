'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface Props {
  /** Imagen del retrato (IA o foto de portada). */
  portraitUrl: string | null;
  /** Nombre del ser querido / mascota. */
  name: string;
  /** Se llama cuando termina la animación — el padre puede cerrar el overlay. */
  onFinish?: () => void;
}

/**
 * "Escena de despedida" en 2D — se usa como fallback cuando el memorial no
 * tiene un asset .glb/USDZ de AR. Funciona en cualquier dispositivo.
 *
 * Fases:
 *   0  · aparece el retrato de frente (mira al espectador)
 *   1  · el retrato gira (flip horizontal, como si voltease)
 *   2  · se aleja hacia el horizonte (translate + scale down)
 *   3  · se desvanece
 *   4  · aparece la leyenda "No me olvides" escrita a mano
 */
export function FarewellScene({ portraitUrl, name, onFinish }: Props) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    if (reduced) {
      setPhase(4);
      return;
    }
    // Timings en ms — pueden ajustarse para mayor o menor pausa.
    const steps: [number, 0 | 1 | 2 | 3 | 4][] = [
      [1500, 1],   // empieza a voltearse
      [3000, 2],   // empieza a alejarse
      [5000, 3],   // se desvanece
      [6800, 4],   // aparece la leyenda
    ];
    const timers = steps.map(([delay, p]) => setTimeout(() => setPhase(p), delay));
    const finishTimer = setTimeout(() => onFinish?.(), 10500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
  }, [onFinish, reduced]);

  const translateY = phase >= 2 ? '-22%' : '0%';
  const scale = phase >= 2 ? 0.55 : 1;
  const opacity = phase >= 3 ? 0 : 1;
  const rotateY = phase >= 1 ? 180 : 0;
  const blur = phase >= 3 ? 12 : phase >= 2 ? 2 : 0;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Fondo atmosférico: degradado pizarra + partículas */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(183,148,90,0.18), transparent 55%), linear-gradient(to bottom, #1F242E 0%, #12151B 100%)',
        }}
      />

      {/* Halo dorado que late en el lugar donde estaba el ser querido */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 260,
          height: 260,
          background:
            'radial-gradient(circle at center, rgba(226,204,153,0.45), transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* Retrato con animación de despedida */}
      <AnimatePresence>
        {phase < 3 && portraitUrl && (
          <motion.div
            key="portrait"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ perspective: 1200 }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity,
              scale,
              y: translateY,
              filter: `blur(${blur}px)`,
            }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            exit={{ opacity: 0, filter: 'blur(24px)', scale: 0.3 }}
          >
            <motion.div
              animate={{ rotateY }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-[240px] h-[320px] rounded-2xl overflow-hidden shadow-dorado"
            >
              {/* Cara frontal */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portraitUrl}
                  alt={`Retrato de ${name}`}
                  className="w-full h-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, transparent 50%, rgba(30,41,59,0.5) 100%)',
                  }}
                />
              </div>
              {/* Cara trasera (silueta al voltearse) */}
              <div
                className="absolute inset-0 bg-pizarra-900 flex items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Silueta con backdrop para sugerir que "se va" */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portraitUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-40 scale-x-[-1]"
                  style={{ filter: 'grayscale(1) brightness(0.45) blur(1px)' }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(30,41,59,0.4), rgba(18,21,27,0.95))',
                  }}
                />
              </div>
            </motion.div>

            {/* Nombre sutil al pie del retrato durante las primeras fases */}
            {phase === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="text-center mt-4 font-serif italic text-dorado-300 text-sm tracking-widest uppercase"
              >
                {name}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partículas que "recogen" al ser querido al desvanecerse */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            key="dust"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(14)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-dorado-200"
                style={{ boxShadow: '0 0 8px rgba(226,204,153,0.9)' }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 220,
                  y: -120 - Math.random() * 180,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.4 + Math.random() * 1.2,
                  ease: 'easeOut',
                  delay: i * 0.08,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leyenda final: "No me olvides" */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            key="legend"
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-serif italic text-marfil/70 text-sm uppercase tracking-[0.5em] mb-5">
              Un último mensaje
            </span>
            <motion.h2
              className="font-serif text-5xl md:text-7xl text-dorado-300 italic leading-tight"
              initial={{ letterSpacing: '0.3em', opacity: 0 }}
              animate={{ letterSpacing: '0em', opacity: 1 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                textShadow: '0 0 40px rgba(226,204,153,0.35)',
              }}
            >
              No me olvides.
            </motion.h2>
            <motion.div
              className="hairline mt-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 1 }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.5 }}
              className="font-serif text-marfil/80 text-base md:text-lg mt-6"
            >
              — {name}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
