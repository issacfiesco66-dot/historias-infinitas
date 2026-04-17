'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
}

interface Props {
  photos: Photo[];
  /** Cuántas celdas visibles al mismo tiempo (ideal: 7 para panal central). */
  visible?: number;
  /** Milisegundos entre rotaciones. */
  interval?: number;
}

/**
 * Galería en forma de panal de abejas. Si hay más fotos que celdas visibles,
 * se rotan automáticamente: una celda se desvanece hacia fuera y otra aparece
 * con la siguiente fotografía.
 *
 * La geometría usa `clip-path: polygon(...)` para el hexágono y un grid
 * CSS con columnas impares desplazadas para formar el panal.
 */
export function HexGallery({ photos, visible = 7, interval = 3500 }: Props) {
  const reduced = useReducedMotion();
  // Patrón de panal — 7 celdas: 2 arriba, 3 en medio, 2 abajo.
  // Cada celda es (col, row, offsetRowHalf). El offset desplaza media fila
  // para crear el encaje hexagonal.
  const pattern = useMemo(() => HONEYCOMB_7, []);

  const total = photos.length;
  const slotCount = Math.min(visible, pattern.length, total || 1);

  // Estado: para cada slot, cuál índice de `photos` se está mostrando.
  const [slots, setSlots] = useState<number[]>(() =>
    Array.from({ length: slotCount }, (_, i) => i % Math.max(total, 1)),
  );

  // Cursor para elegir la siguiente foto a insertar (evita repetidos consecutivos).
  const [nextIdx, setNextIdx] = useState(slotCount);

  useEffect(() => {
    // Re-sincronizar si cambian las fotos
    setSlots(Array.from({ length: slotCount }, (_, i) => i % Math.max(total, 1)));
    setNextIdx(slotCount);
  }, [total, slotCount]);

  useEffect(() => {
    if (reduced) return;
    if (total <= slotCount) return;   // no hay más fotos para rotar
    const id = setInterval(() => {
      setSlots((prev) => {
        const slotToReplace = Math.floor(Math.random() * prev.length);
        const copy = [...prev];
        copy[slotToReplace] = nextIdx % total;
        return copy;
      });
      setNextIdx((v) => (v + 1) % total);
    }, interval);
    return () => clearInterval(id);
  }, [interval, nextIdx, reduced, slotCount, total]);

  if (photos.length === 0) return null;

  return (
    <div className="relative mx-auto" style={{ width: 'min(720px, 100%)' }}>
      <div className="grid grid-cols-5 gap-x-1 gap-y-1 sm:gap-x-2 sm:gap-y-2">
        {pattern.slice(0, slotCount).map((cell, slotIdx) => {
          const photo = photos[slots[slotIdx] ?? slotIdx] ?? photos[0];
          return (
            <div
              key={slotIdx}
              className="relative"
              style={{
                gridColumn: `${cell.col} / span 1`,
                gridRow: cell.row,
                // Desplazamiento vertical para formar el panal
                transform: `translateY(${cell.offsetY}%)`,
              }}
            >
              <div className="relative aspect-square">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={photo.id}
                    className="absolute inset-0 overflow-hidden shadow-solemn"
                    style={{ clipPath: HEX_CLIP }}
                    initial={{ opacity: 0, scale: 0.85, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption ?? ''}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    {/* Borde dorado sutil dentro del hex */}
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        clipPath: HEX_CLIP,
                        boxShadow: 'inset 0 0 0 2px rgba(183,148,90,0.35)',
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HEX_CLIP = 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)';

/**
 * Patrón de 7 celdas con forma de panal. Las filas impares se desplazan
 * verticalmente para crear el encaje característico del hexágono.
 *
 *   [1]   [2]
 *  [3] [4] [5]
 *   [6]   [7]
 */
const HONEYCOMB_7: Array<{ col: number; row: number; offsetY: number }> = [
  { col: 2, row: 1, offsetY: 0 },     // arriba-izq
  { col: 4, row: 1, offsetY: 0 },     // arriba-der
  { col: 1, row: 2, offsetY: -50 },   // medio izq
  { col: 3, row: 2, offsetY: -50 },   // centro
  { col: 5, row: 2, offsetY: -50 },   // medio der
  { col: 2, row: 3, offsetY: -100 },  // abajo izq
  { col: 4, row: 3, offsetY: -100 },  // abajo der
];
