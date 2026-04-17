'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { deleteMemorial } from '@/app/dashboard/actions';

interface Props {
  memorialId: string;
  memorialName: string;
  /** 'icon' para las cards del dashboard, 'full' para el editor. */
  variant?: 'icon' | 'full';
  /** Si se pasa, navega allá tras eliminar (p. ej. a /dashboard desde el editor). */
  redirectTo?: string;
}

export function DeleteMemorialButton({
  memorialId, memorialName, variant = 'icon', redirectTo,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState('');

  const confirmPhrase = memorialName.trim();
  const canConfirm = typed.trim() === confirmPhrase;

  function onConfirm() {
    if (!canConfirm) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteMemorial(memorialId);
      if (!res.ok) {
        setError(res.error ?? 'No se pudo eliminar.');
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      {variant === 'icon' ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Eliminar memorial"
          onClick={() => setOpen(true)}
          className="text-pizarra-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="text-pizarra-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
        </Button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="delete-overlay"
            className="fixed inset-0 z-50 bg-pizarra-900/70 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !deleting) setOpen(false);
            }}
          >
            <motion.div
              className="relative w-full max-w-md bg-marfil rounded-2xl shadow-solemn p-6"
              initial={{ y: 12, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-pizarra-800">
                    Eliminar memorial
                  </h3>
                  <p className="text-sm text-pizarra-500 mt-1">
                    Esta acción es <strong>permanente</strong>. Se eliminarán el
                    memorial, todas sus fotos, videos y el retrato IA.
                    {' '}No se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-xs uppercase tracking-widest text-pizarra-500">
                  Para confirmar, escribe el nombre: <strong className="normal-case text-pizarra-700">{confirmPhrase}</strong>
                </label>
                <input
                  type="text"
                  autoFocus
                  disabled={deleting}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={confirmPhrase}
                  className="w-full rounded-md border border-pizarra-200 bg-marfil px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-60"
                />
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={onConfirm}
                  disabled={!canConfirm || deleting}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300"
                >
                  {deleting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Eliminando…</>
                    : <><Trash2 className="h-4 w-4 mr-2" /> Eliminar para siempre</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
