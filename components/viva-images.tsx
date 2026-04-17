'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionProps,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  SCROLL REVEAL
 *  Fade + slide-up con viewport, ease-out 1.2s. Solemne, nunca brusco.
 * ========================================================================== */

export const solemnVariants: Variants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

interface RevealProps extends Omit<MotionProps, 'variants' | 'initial' | 'whileInView'> {
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Wrapper declarativo para aplicar el reveal a cualquier sección. */
export function Reveal({
  as = 'div',
  delay = 0,
  once = true,
  className,
  children,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as 'div'] as typeof motion.div;

  if (reduced) {
    // Respeta preferencia del sistema
    const Tag = as as any;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-80px' }}
      variants={solemnVariants}
      transition={{ delay, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/* ============================================================================
 *  MOTION TEXT PRIMITIVES
 *  motion.h1 / motion.p con fade + slide suave al entrar al viewport.
 *  Útiles cuando queremos animar el texto sin envolver un bloque entero.
 * ========================================================================== */

type FadeTextProps<T extends HTMLElement = HTMLElement> = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
};

function FadeText({
  children, className, delay = 0, duration = 1.2, as = 'p',
}: FadeTextProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.p;

  return (
    <MotionTag
      className={className}
      initial={reduced ? false : { opacity: 0, y: 18, filter: 'blur(4px)' }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

export const FadeH1 = (p: Omit<FadeTextProps, 'as'>) => <FadeText {...p} as="h1" />;
export const FadeH2 = (p: Omit<FadeTextProps, 'as'>) => <FadeText {...p} as="h2" />;
export const FadeP  = (p: Omit<FadeTextProps, 'as'>) => <FadeText {...p} as="p" />;

/* ============================================================================
 *  LIGHT DUST PARTICLES
 *  Polvo estelar flotante en CSS puro (transform + opacity, animables a 60fps).
 * ========================================================================== */

interface DustParticlesProps {
  count?: number;
  className?: string;
}

export function DustParticles({ count = 22, className }: DustParticlesProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Renderizamos SOLO en cliente para evitar mismatch de hydration.
  useEffect(() => { setMounted(true); }, []);

  const particles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: count }).map((_, i) => {
      const size = 1 + Math.random() * 2.5;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = 10 + Math.random() * 14;
      const opacity = 0.35 + Math.random() * 0.45;
      const drift = (Math.random() - 0.5) * 40;
      return { id: i, size, left, top, delay, duration, opacity, drift };
    });
  }, [count, mounted]);

  if (reduced || !mounted) return null;

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-dorado-200"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px rgba(226, 204, 153, ${p.opacity})`,
            animation: `dust-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            // CSS vars para la keyframe
            // @ts-expect-error css custom prop
            '--dust-drift': `${p.drift}px`,
          }}
        />
      ))}

      {/* keyframes inline para no tocar globals.css */}
      <style jsx>{`
        @keyframes dust-float {
          0%   { transform: translate(0, 0) scale(1);    opacity: 0; }
          15%  { opacity: 1; }
          50%  { transform: translate(var(--dust-drift), -40px) scale(1.2); }
          85%  { opacity: 1; }
          100% { transform: translate(0, -80px) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================================
 *  ANIMATED HERO IMAGE
 *  Ken Burns infinito + vignette dinámico + blur suave en bordes + polvo.
 * ========================================================================== */

interface AnimatedHeroImageProps {
  src: string | StaticImageData;
  alt: string;
  priority?: boolean;
  className?: string;
  /** Relación de aspecto del contenedor: "video" | "hero" | "square" */
  aspect?: 'video' | 'hero' | 'square';
}

export function AnimatedHeroImage({
  src,
  alt,
  priority = true,
  className,
  aspect = 'hero',
}: AnimatedHeroImageProps) {
  const reduced = useReducedMotion();

  const aspectClass =
    aspect === 'video' ? 'aspect-video' :
    aspect === 'square' ? 'aspect-square' :
    'aspect-[4/5] sm:aspect-[3/4] md:aspect-[16/10] min-h-[480px] sm:min-h-[560px] md:min-h-0';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl shadow-solemn',
        aspectClass,
        className,
      )}
    >
      {/* Imagen con Ken Burns — optimizada por next/image para LCP */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, x: 0, y: 0 }}
        animate={
          reduced
            ? { scale: 1 }
            : {
                scale: [1.08, 1.18, 1.1, 1.15, 1.08],
                x: ['0%', '-2%', '1%', '-1%', '0%'],
                y: ['0%', '1.5%', '-1%', '2%', '0%'],
              }
        }
        transition={{
          duration: 28,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
          quality={85}
        />
      </motion.div>

      {/* Vignette dinámico — oscurece bordes, centra la atención */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(30,41,59,0.55) 100%)',
        }}
        animate={
          reduced
            ? {}
            : { opacity: [0.8, 1, 0.85, 1, 0.8] }
        }
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* Desenfoque sutil en bordes (inner blur via mask) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 backdrop-blur-[2px]"
        style={{
          WebkitMaskImage:
            'radial-gradient(ellipse at center, transparent 55%, black 100%)',
          maskImage:
            'radial-gradient(ellipse at center, transparent 55%, black 100%)',
        }}
      />

      {/* Capa de color pizarra al 40% para lectura segura del texto */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(30, 41, 59, 0.40)' }}
      />

      {/* Partículas de luz */}
      <DustParticles count={28} />
    </div>
  );
}

/* ============================================================================
 *  PARALLAX NICHO CARD
 *  Hover 2D: la imagen sigue al cursor, el texto emerge con escalado suave.
 * ========================================================================== */

interface ParallaxNichoCardProps {
  src: string | StaticImageData;
  alt: string;
  eyebrow: string;           // Ej. "Para tu compañero fiel"
  icon?: React.ReactNode;
  title: string;             // "Memoriales de Mascotas"
  description: string;
  cta: React.ReactNode;      // Botón / link
  id?: string;
  className?: string;
}

export function ParallaxNichoCard({
  src, alt, eyebrow, icon, title, description, cta, id, className,
}: ParallaxNichoCardProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Motion values normalizadas (-0.5 .. 0.5)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Spring para suavidad
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.6 });

  // Desplazamiento de la imagen (parallax fuerte)
  const imgX = useTransform(sx, (v) => v * -24); // px
  const imgY = useTransform(sy, (v) => v * -24);

  // Escala sutil (profundidad)
  const imgScale = useTransform(sx, () => 1.12);

  // Desplazamiento del texto (parallax suave, sentido opuesto)
  const textX = useTransform(sx, (v) => v * 10);
  const textY = useTransform(sy, (v) => v * 10);

  const [hover, setHover] = useState(false);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(nx);
    my.set(ny);
  }

  function handleLeave() {
    mx.set(0);
    my.set(0);
    setHover(false);
  }

  return (
    <motion.div
      id={id}
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleLeave}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-pizarra-100 bg-marfil/80 shadow-solemn',
        'transition-shadow duration-500 hover:shadow-dorado',
        className,
      )}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={solemnVariants}
    >
      {/* IMAGEN con parallax */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.div
          className="absolute -inset-6"
          style={{
            x: reduced ? 0 : imgX,
            y: reduced ? 0 : imgY,
            scale: reduced ? 1.05 : imgScale,
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            quality={85}
          />
        </motion.div>

        {/* Gradiente pizarra 40 % — lectura limpia en marfil */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(30,41,59,0.85) 0%, rgba(30,41,59,0.40) 55%, rgba(30,41,59,0.10) 100%)',
          }}
        />

        {/* Polvo de luz solo al hover */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <DustParticles count={14} />
        </motion.div>
      </div>

      {/* CONTENIDO — emerge y se desplaza suavemente */}
      <motion.div
        className="relative p-10 -mt-28"
        style={{
          x: reduced ? 0 : textX,
          y: reduced ? 0 : textY,
        }}
      >
        <motion.div
          className="flex items-center gap-2 text-dorado-400 mb-3"
          animate={{ y: hover ? -2 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {icon}
          <span className="uppercase tracking-widest text-[11px]">{eyebrow}</span>
        </motion.div>

        <motion.h2
          className="font-serif text-4xl text-marfil mb-4 origin-left"
          animate={{
            scale: hover ? 1.04 : 1,
            letterSpacing: hover ? '0.01em' : '0em',
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="text-marfil/85 leading-relaxed mb-6 max-w-md"
          animate={{ opacity: hover ? 1 : 0.85 }}
          transition={{ duration: 0.6 }}
        >
          {description}
        </motion.p>

        <motion.div
          animate={{ y: hover ? 0 : 4, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {cta}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
