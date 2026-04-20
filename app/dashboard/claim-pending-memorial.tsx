'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Heart } from 'lucide-react';
import { readPendingMemorial, clearPendingMemorial } from '@/lib/pending-memorial';
import { createMemorial } from './new/actions';

/**
 * ClaimPendingMemorial — reclama automáticamente el draft que el usuario
 * creó en /empieza antes de registrarse.
 *
 * Flujo:
 *   1. Usuario termina /empieza → localStorage tiene los datos del draft
 *   2. Usuario confirma correo → /auth/callback → /dashboard
 *   3. Este componente detecta el draft y crea el memorial real
 *   4. Redirige al editor del memorial recién creado
 *
 * Si no hay draft, no renderiza nada. Si el claim falla, borra el draft y
 * muestra un toast discreto para no bloquear el resto del dashboard.
 */
export function ClaimPendingMemorial() {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // Guard: corre UNA vez por montaje, aunque StrictMode haga double-invoke.
    if (ran.current) return;
    ran.current = true;

    const pending = readPendingMemorial();
    if (!pending) return;

    setClaiming(true);
    (async () => {
      try {
        const res = await createMemorial({
          name: pending.name,
          type: pending.type,
          birth_date: pending.birth_date || null,
          passing_date: pending.passing_date || null,
          epitaph: pending.epitaph || null,
        });
        clearPendingMemorial();
        if (res.ok && res.id) {
          router.replace(`/dashboard/memorial/${res.id}`);
        } else {
          setClaiming(false);
          setFailure(res.error ?? 'No pudimos recuperar tu progreso.');
        }
      } catch (err: any) {
        clearPendingMemorial();
        setClaiming(false);
        setFailure(err?.message ?? 'No pudimos recuperar tu progreso.');
      }
    })();
  }, [router]);

  return (
    <AnimatePresence>
      {claiming && (
        <motion.div
          key="claim-overlay"
          className="fixed inset-0 z-50 bg-marfil/90 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center max-w-sm px-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-dorado-100 flex items-center justify-center mb-5">
              <Heart className="h-6 w-6 text-dorado-600 animate-pulse" />
            </div>
            <p className="uppercase tracking-[0.3em] text-[11px] text-dorado-600 mb-3">
              Preparando tu tributo
            </p>
            <h2 className="font-serif text-2xl text-pizarra-800 mb-2">
              Recuperando lo que escribiste
            </h2>
            <p className="text-sm text-pizarra-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Un momento…
            </p>
          </div>
        </motion.div>
      )}

      {failure && !claiming && (
        <motion.div
          key="claim-failure"
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-xl shadow-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <p className="font-medium text-sm mb-1">No pudimos recuperar tu progreso</p>
          <p className="text-[13px] text-amber-800 mb-3">
            Es fácil de arreglar: usa el botón <strong>Nuevo nicho virtual</strong> arriba para crear tu tributo desde aquí.
          </p>
          <button
            type="button"
            onClick={() => setFailure(null)}
            className="text-[11px] uppercase tracking-widest text-amber-700 hover:text-amber-900"
          >
            Cerrar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
