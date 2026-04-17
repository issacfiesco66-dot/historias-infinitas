'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, X, ScanLine, Play, Sparkles } from 'lucide-react';

interface ARPortalProps {
  personName: string;
  videoUrl: string | null;
  modelUrl: string | null;
  posterUrl: string | null;
}

/**
 * Portal de Recuerdos (WebAR).
 *
 * UX:
 *  - Un botón FLOTANTE dorado "Ver en tu hogar" aparece en la esquina inferior.
 *  - Al pulsarlo, abre un overlay con <model-viewer> y dispara activateAR().
 *  - Android  → Scene Viewer (ARCore).
 *  - iOS      → Quick Look (ARKit) con USDZ si existe ios-src.
 *  - Desktop  → Se muestra el 3D interactivo + video incrustado como fallback.
 *
 * Asset AR:
 *  - modelUrl (.glb): si la mascota/persona ya tiene un plano con video como textura
 *    con transparencia (.webm VP9 alpha o chroma key aplicado en la textura del glb).
 *  - iOS requiere .usdz — se deriva de modelUrl si termina en .glb.
 *  - Fallback: modelo genérico de modelviewer.dev para mostrar flujo AR.
 */
export function ARPortal({ personName, videoUrl, modelUrl, posterUrl }: ARPortalProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);      // botón flotante
  const [isMobile, setIsMobile] = useState(false);
  const viewerRef = useRef<any>(null);

  // Aparece el botón tras un pequeño delay (no saturar el hero)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 900);
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobile);
    return () => clearTimeout(t);
  }, []);

  // Cuando se abre el overlay, intentar activar AR automáticamente en móvil
  useEffect(() => {
    if (!open) return;
    const el = viewerRef.current;
    if (!el) return;
    if (isMobile && typeof el.activateAR === 'function') {
      // Pequeño timeout para permitir la carga del modelo
      const t = setTimeout(() => {
        try { el.activateAR(); } catch { /* noop */ }
      }, 800);
      return () => clearTimeout(t);
    }
  }, [open, isMobile]);

  // Assets
  const hasCustomModel = Boolean(modelUrl);
  const src = modelUrl ?? '';
  const iosSrc =
    modelUrl && modelUrl.endsWith('.glb')
      ? modelUrl.replace('.glb', '.usdz')
      : undefined;

  // El Portal AR solo aparece cuando hay un modelo 3D real.
  // (El AR es add-on del plan Eterno; sin asset no mostramos nada
  // para evitar el placeholder de astronauta de model-viewer.)
  if (!hasCustomModel) return null;

  return (
    <>
      {/* ============ BOTÓN FLOTANTE "Ver en tu hogar" ============ */}
      <AnimatePresence>
        {visible && !open && (
          <motion.button
            key="ar-fab"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            aria-label={`Ver a ${personName} en tu hogar con Realidad Aumentada`}
            className="group fixed z-40 bottom-6 right-6 md:bottom-8 md:right-8 inline-flex items-center gap-3 rounded-full bg-dorado-500 text-pizarra-900 pl-5 pr-6 py-3.5 text-sm font-medium shadow-dorado backdrop-blur hover:bg-dorado-400 transition-colors"
          >
            {/* Halo animado */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-dorado-400/60 blur-lg opacity-70 animate-glow -z-10"
            />
            <Home className="h-4 w-4" />
            <span className="whitespace-nowrap">Ver en tu hogar</span>
            <Sparkles className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ============ OVERLAY MODAL ============ */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="ar-overlay"
            className="fixed inset-0 z-50 bg-pizarra-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="relative w-full max-w-4xl bg-pizarra-800 rounded-2xl overflow-hidden shadow-solemn"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0,  opacity: 1, scale: 1 }}
              exit={{    y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Cerrar */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-marfil/10 hover:bg-marfil/20 text-marfil flex items-center justify-center transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Encabezado */}
              <div className="px-6 md:px-10 pt-8 pb-4 text-center">
                <p className="uppercase tracking-[0.3em] text-[11px] text-dorado-300 mb-2">
                  Portal de Recuerdos
                </p>
                <h3 className="font-serif text-2xl md:text-3xl text-marfil">
                  {personName} en tu hogar
                </h3>
                <p className="text-sm text-marfil/60 mt-2 max-w-md mx-auto">
                  {isMobile
                    ? 'Apunta a una superficie plana y observa cómo su recuerdo aparece contigo.'
                    : 'Arrastra para girar. En móvil, toca el botón AR para colocarlo en tu entorno.'}
                </p>
              </div>

              {/* <model-viewer> */}
              <div className="relative mx-4 md:mx-8 mb-6 rounded-xl overflow-hidden bg-pizarra-900 aspect-[4/3] md:aspect-[16/9]">
                {/* @ts-ignore — Web Component cargado en layout.tsx */}
                <model-viewer
                  ref={viewerRef}
                  src={src}
                  ios-src={iosSrc}
                  alt={`Portal AR de ${personName}`}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  ar-scale="auto"
                  ar-placement="floor"
                  camera-controls
                  touch-action="pan-y"
                  auto-rotate
                  poster={posterUrl ?? undefined}
                  shadow-intensity="1"
                  exposure="0.9"
                  environment-image="neutral"
                  style={{ width: '100%', height: '100%', backgroundColor: '#1F242E' }}
                >
                  {/* Botón AR integrado (lo usa model-viewer internamente) */}
                  <button
                    slot="ar-button"
                    className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-dorado-500 text-pizarra-900 rounded-full px-5 py-3 text-sm font-medium shadow-dorado hover:bg-dorado-400 transition"
                  >
                    <ScanLine className="h-4 w-4" /> Activar AR
                  </button>

                  <div slot="progress-bar" className="hidden" />
                {/* @ts-ignore */}
                </model-viewer>

                {!hasCustomModel && (
                  <p className="absolute top-4 left-4 bg-pizarra-900/80 text-marfil text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                    Vista previa
                  </p>
                )}
              </div>

              {/* Video de respaldo / previsualización del recuerdo */}
              {videoUrl && (
                <div className="px-4 md:px-8 pb-8">
                  <div className="rounded-xl overflow-hidden bg-pizarra-900">
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      poster={posterUrl ?? undefined}
                      className="w-full aspect-video object-cover"
                      preload="metadata"
                    />
                  </div>

                  <div className="mt-4 flex items-start gap-3 text-sm text-marfil/70">
                    <Play className="h-4 w-4 text-dorado-400 mt-0.5 shrink-0" />
                    <ol className="space-y-1">
                      <li>1. Abre esta página desde un móvil con cámara.</li>
                      <li>2. Pulsa <strong className="text-marfil">Activar AR</strong>.</li>
                      <li>3. Apunta a una superficie plana.</li>
                      <li>4. Su recuerdo aparecerá flotando en tu entorno.</li>
                    </ol>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
