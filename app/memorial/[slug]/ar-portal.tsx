'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, X, ScanLine, Play, Sparkles, RotateCcw } from 'lucide-react';
import { FarewellScene } from './farewell-scene';

interface ARPortalProps {
  personName: string;
  videoUrl: string | null;
  modelUrl: string | null;
  posterUrl: string | null;
}

/**
 * Portal de Recuerdos.
 *
 * Flujo:
 *  - Botón flotante dorado "Ver en tu hogar" aparece siempre (aunque aún no
 *    tengamos asset .glb) — porque la experiencia de despedida 2D puede
 *    reproducirse en cualquier dispositivo.
 *  - Al abrir, se reproduce SIEMPRE la Escena de Despedida: el retrato se
 *    gira, se aleja, se desvanece, y aparece "No me olvides".
 *  - Después de la despedida, si existe modelUrl, se puede activar AR real
 *    con <model-viewer> (Scene Viewer / Quick Look). Si solo hay video, se
 *    reproduce como recuerdo.
 *
 * Requisitos para AR 3D "real" (lo que aún falta para que la mascota/ser
 * querido aparezca en tu habitación):
 *   1. Un archivo .glb con textura del sujeto (aplanado con chroma key o
 *      un video VP9 alpha aplicado como textura del plano 3D).
 *   2. Su equivalente .usdz para iOS Quick Look (mismo nombre, distinta
 *      extensión — la convertimos con Reality Converter de Apple).
 *   3. Opcionalmente, una clip de animación baked al GLB con el ciclo de
 *      "voltearse y alejarse" para que en AR también haga la despedida.
 *   4. HTTPS en producción (requerido por WebXR y Quick Look).
 *
 * Sin los assets anteriores, el botón sigue mostrando la escena 2D — que
 * ya transmite el mensaje emocional completo: volteo, alejarse, "No me
 * olvides".
 */
export function ARPortal({ personName, videoUrl, modelUrl, posterUrl }: ARPortalProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<'farewell' | 'ar' | 'video'>('farewell');
  const [isMobile, setIsMobile] = useState(false);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 900);
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobile);
    return () => clearTimeout(t);
  }, []);

  // Activar AR automáticamente cuando pasamos a la fase 'ar'
  useEffect(() => {
    if (stage !== 'ar') return;
    const el = viewerRef.current;
    if (!el) return;
    if (isMobile && typeof el.activateAR === 'function') {
      const t = setTimeout(() => {
        try { el.activateAR(); } catch { /* noop */ }
      }, 800);
      return () => clearTimeout(t);
    }
  }, [stage, isMobile]);

  const hasCustomModel = Boolean(modelUrl);
  const hasVideo = Boolean(videoUrl);
  const src = modelUrl ?? '';
  // iOS Quick Look requiere USDZ — aún no generamos ese formato, así que
  // dejamos ios-src vacío. En iOS, model-viewer muestra el 3D en WebGL pero
  // no abre Quick Look (esto es mejor que apuntar a un USDZ 404).
  const iosSrc: string | undefined = undefined;

  // El botón flotante aparece si hay retrato para la despedida 2D, o asset AR, o video.
  if (!posterUrl && !hasCustomModel && !hasVideo) return null;

  function handleClose() {
    setOpen(false);
    // reset tras salir para que la próxima apertura vuelva a reproducir la despedida
    setTimeout(() => setStage('farewell'), 400);
  }

  return (
    <>
      {/* ============ BOTÓN FLOTANTE ============ */}
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
            aria-label={`Ver a ${personName} en tu hogar`}
            className="group fixed z-40 bottom-6 right-6 md:bottom-8 md:right-8 inline-flex items-center gap-3 rounded-full bg-dorado-500 text-pizarra-900 pl-5 pr-6 py-3.5 text-sm font-medium shadow-dorado backdrop-blur hover:bg-dorado-400 transition-colors"
          >
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
            className="fixed inset-0 z-50 bg-pizarra-900/95 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <motion.div
              className="relative w-full h-full md:h-auto md:max-w-4xl bg-pizarra-900 md:rounded-2xl overflow-hidden md:shadow-solemn"
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0,  opacity: 1, scale: 1 }}
              exit={{    y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Cerrar */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-marfil/10 hover:bg-marfil/20 text-marfil flex items-center justify-center transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* FASE 1: ESCENA DE DESPEDIDA (siempre se muestra primero) */}
              {stage === 'farewell' && (
                <div className="relative w-full h-[100dvh] md:h-[80vh]">
                  <FarewellScene
                    portraitUrl={posterUrl}
                    name={personName}
                    onFinish={() => {
                      // Priorizamos video (retrato animado) sobre AR:
                      // el video se reproduce en el 100 % de los móviles
                      // y transmite más emoción que un plano estático
                      // flotando. AR queda como fallback legacy.
                      if (hasVideo) setStage('video');
                      else if (hasCustomModel) setStage('ar');
                    }}
                  />

                  {/* CTA para re-ver la despedida o continuar */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // truco para reiniciar: unmount + remount
                        setStage('ar');
                        setTimeout(() => setStage('farewell'), 20);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-marfil/10 hover:bg-marfil/20 text-marfil text-xs px-4 py-2 backdrop-blur"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Ver de nuevo
                    </button>
                    {(hasCustomModel || hasVideo) && (
                      <button
                        type="button"
                        onClick={() => setStage(hasVideo ? 'video' : 'ar')}
                        className="inline-flex items-center gap-2 rounded-full bg-dorado-500 hover:bg-dorado-400 text-pizarra-900 text-xs px-4 py-2"
                      >
                        {hasVideo ? <><Play className="h-3.5 w-3.5" /> Ver recuerdo</> : <><ScanLine className="h-3.5 w-3.5" /> Abrir en tu hogar</>}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FASE 2a: AR REAL (si hay .glb) */}
              {stage === 'ar' && hasCustomModel && (
                <div className="relative">
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
                      <button
                        slot="ar-button"
                        className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-dorado-500 text-pizarra-900 rounded-full px-5 py-3 text-sm font-medium shadow-dorado hover:bg-dorado-400 transition"
                      >
                        <ScanLine className="h-4 w-4" /> Activar AR
                      </button>
                      <div slot="progress-bar" className="hidden" />
                    {/* @ts-ignore */}
                    </model-viewer>
                  </div>

                  {hasVideo && (
                    <div className="px-4 md:px-8 pb-8">
                      <div className="rounded-xl overflow-hidden bg-pizarra-900">
                        <video
                          src={videoUrl ?? undefined}
                          controls
                          playsInline
                          poster={posterUrl ?? undefined}
                          className="w-full aspect-video object-cover"
                          preload="metadata"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FASE 2b: VIDEO RECUERDO (si solo hay video y no modelo) */}
              {stage === 'video' && hasVideo && (
                <div className="relative">
                  <div className="px-6 md:px-10 pt-8 pb-4 text-center">
                    <p className="uppercase tracking-[0.3em] text-[11px] text-dorado-300 mb-2">
                      Su voz, su presencia
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl text-marfil">
                      Un recuerdo de {personName}
                    </h3>
                  </div>

                  <div className="px-4 md:px-8 pb-8">
                    <div className="rounded-xl overflow-hidden bg-pizarra-950">
                      <video
                        src={videoUrl ?? undefined}
                        controls
                        autoPlay
                        playsInline
                        poster={posterUrl ?? undefined}
                        className="w-full aspect-video object-cover"
                        preload="metadata"
                      />
                    </div>
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
