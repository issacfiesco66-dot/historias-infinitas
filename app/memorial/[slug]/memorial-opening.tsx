'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Heart } from 'lucide-react';
import { DustParticles } from '@/components/viva-images';

interface Props {
  name: string;
  phrase?: string | null;
  birthDate: string;
  passingDate: string;
  musicUrl?: string | null;
}

/**
 * Pantalla de entrada al memorial.
 *
 * Muestra un velo oscuro con nombre, fechas y una frase evocadora.
 * Al pulsar "Entrar en su memoria" se desvanece y arranca la música
 * (los navegadores exigen interacción del usuario para hacer autoplay).
 *
 * Un botón flotante permite silenciar / reactivar la música después.
 */
export function MemorialOpening({
  name,
  phrase,
  birthDate,
  passingDate,
  musicUrl,
}: Props) {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Bloquea scroll del body mientras el velo esté visible.
  useEffect(() => {
    if (!entered) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [entered]);

  function handleEnter() {
    setEntered(true);
    if (audioRef.current && musicUrl) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => { /* silencio si el browser bloquea */ });
    }
  }

  function toggleMute() {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }

  const fallback = 'Los que amamos no se van — viven en cada recuerdo, en cada silencio.';
  const shownPhrase = phrase ?? fallback;

  return (
    <>
      {/* Audio persistente */}
      {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" />}

      {/* ============ VELO DE ENTRADA ============ */}
      <AnimatePresence>
        {!entered && (
          <motion.div
            key="veil"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center text-center px-6 bg-pizarra-900 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Halo dorado sutil */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(183,148,90,0.14) 0%, transparent 65%)',
              }}
            />

            {/* Polvo estelar */}
            <DustParticles count={40} />

            {/* Contenido */}
            <div className="relative z-10 max-w-2xl">
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.2 }}
                className="uppercase tracking-[0.4em] text-[11px] text-dorado-300/80 mb-10"
              >
                En memoria eterna
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
                transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-5xl md:text-7xl text-marfil mb-7 leading-[1.05]"
              >
                {name}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 1.0 }}
                className="flex items-center justify-center gap-4 text-marfil/60 text-xs tracking-widest mb-14"
              >
                <span>{birthDate}</span>
                <span className="w-8 h-px bg-dorado-300/40" />
                <span>{passingDate}</span>
              </motion.p>

              <motion.blockquote
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6, delay: 1.4 }}
                className="font-serif italic text-lg md:text-2xl text-marfil/85 leading-relaxed mb-16"
              >
                “{shownPhrase}”
              </motion.blockquote>

              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2.0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEnter}
                className="group relative inline-flex items-center gap-3 rounded-full bg-dorado-500 hover:bg-dorado-400 text-pizarra-900 px-10 py-4 text-sm font-medium tracking-widest uppercase transition-colors shadow-dorado"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-dorado-400/60 blur-xl opacity-60 animate-glow -z-10"
                />
                <Heart className="h-4 w-4" />
                Entrar en su memoria
              </motion.button>

              {musicUrl && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 2.5 }}
                  className="mt-8 text-[10px] text-marfil/40 uppercase tracking-widest"
                >
                  ♪ Con música de fondo — puedes silenciar después
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ BOTÓN FLOTANTE DE SILENCIO ============ */}
      {entered && musicUrl && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          onClick={toggleMute}
          aria-label={muted ? 'Activar música' : 'Silenciar música'}
          className="fixed z-40 bottom-6 left-6 md:bottom-8 md:left-8 h-11 w-11 rounded-full bg-pizarra-800/80 hover:bg-pizarra-800 text-marfil backdrop-blur-md border border-dorado-400/20 flex items-center justify-center transition shadow-solemn"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </motion.button>
      )}
    </>
  );
}
