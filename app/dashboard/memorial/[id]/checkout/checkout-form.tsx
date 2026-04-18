'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ShieldCheck, Sparkles, Lock, Loader2, ArrowRight, Star,
  ScanLine, Infinity as InfinityIcon, Award, Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { PLANS, AR_ADDON, formatMXN, type PlanId } from '@/lib/plans';
import type { Memorial } from '@/types/database';

/* ============================================================================
 *  Componente principal
 * ========================================================================== */

const PLAN_ICONS: Record<PlanId, React.ReactNode> = {
  trial_mensual: <Clock className="h-5 w-5" />,
  digital:       <InfinityIcon className="h-5 w-5" />,
  artistico:     <Sparkles className="h-5 w-5" />,
  eterno:        <Award className="h-5 w-5" />,
};

export function CheckoutForm({ memorial }: { memorial: Memorial }) {
  const [selected, setSelected] = useState<PlanId>('artistico');
  const [addAr, setAddAr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(() => PLANS.find((p) => p.id === selected)!, [selected]);
  const total = plan.priceMXN + (addAr ? AR_ADDON.priceMXN : 0);

  async function onCheckout() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialId: memorial.id,
          planId: selected,
          addArPortal: addAr,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'No se pudo iniciar el pago');
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const heroSrc = memorial.portrait_ai_url ?? memorial.cover_photo_url;

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr),400px] gap-8 items-start">
      {/* ======================================== */}
      {/* IZQUIERDA — Planes + bump + garantía      */}
      {/* ======================================== */}
      <div className="space-y-8">
        {/* ---------------- PLANES ---------------- */}
        <section>
          <h2 className="font-serif text-2xl text-pizarra-800 mb-4">Planes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((p) => {
              const active = selected === p.id;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'relative text-left rounded-2xl p-6 transition-all border',
                    'bg-marfil focus:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400',
                    active
                      ? 'border-dorado-500 shadow-dorado bg-dorado-50/60'
                      : 'border-pizarra-100 hover:border-dorado-300 shadow-solemn',
                  )}
                  aria-pressed={active}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-pizarra-800 text-marfil text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                      <Star className="h-3 w-3 text-dorado-400" /> Más elegido
                    </span>
                  )}

                  <div className="flex items-center gap-2 text-dorado-600 mb-3">
                    {PLAN_ICONS[p.id]}
                    <span className="uppercase tracking-widest text-[10px]">Plan {p.id}</span>
                  </div>

                  <h3 className="font-serif text-2xl text-pizarra-800 mb-1">{p.name}</h3>
                  <p className="text-xs text-pizarra-500 italic mb-5">{p.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-serif text-4xl text-pizarra-800">{formatMXN(p.priceMXN)}</span>
                    <span className="text-xs text-pizarra-400 uppercase tracking-widest">MXN</span>
                  </div>

                  {/* Duración del memorial — crítico para que el usuario
                      entienda que el plan trial NO es permanente. */}
                  <p
                    className={cn(
                      'text-[10px] uppercase tracking-widest mb-4',
                      p.durationDays
                        ? 'text-dorado-700 font-medium'
                        : 'text-pizarra-400',
                    )}
                  >
                    {p.durationDays ? `Duración: ${p.durationDays} días` : 'Permanente'}
                  </p>

                  <ul className="space-y-2 mb-2">
                    {p.includes.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-pizarra-600">
                        <Check className="h-4 w-4 text-dorado-500 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {active && (
                    <motion.div
                      layoutId="plan-check"
                      className="absolute top-4 right-4 h-6 w-6 rounded-full bg-dorado-500 flex items-center justify-center"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    >
                      <Check className="h-3.5 w-3.5 text-pizarra-900" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ---------------- ORDER BUMP ---------------- */}
        <motion.label
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'relative flex gap-4 rounded-2xl border p-6 cursor-pointer transition-colors',
            addAr ? 'border-dorado-500 bg-dorado-50/60 shadow-dorado' : 'border-dashed border-pizarra-200 hover:border-dorado-300 bg-marfil',
          )}
        >
          <input
            type="checkbox"
            className="peer sr-only"
            checked={addAr}
            onChange={(e) => setAddAr(e.target.checked)}
          />
          <div className={cn(
            'h-6 w-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors',
            addAr ? 'bg-dorado-500 border-dorado-500' : 'border-pizarra-300 bg-marfil',
          )}>
            {addAr && <Check className="h-4 w-4 text-pizarra-900" />}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ScanLine className="h-4 w-4 text-dorado-600" />
              <span className="uppercase tracking-widest text-[10px] text-dorado-600">Complemento</span>
            </div>
            <p className="font-serif text-lg text-pizarra-800">
              Añadir Realidad Aumentada (Portal de Video)
              <span className="text-dorado-600"> por solo {formatMXN(AR_ADDON.priceMXN)} más</span>
            </p>
            <p className="text-sm text-pizarra-500 mt-1">
              Al escanear el QR aparecerá un video flotando en el espacio, como si estuviera contigo.
            </p>
          </div>
        </motion.label>

        {/* ---------------- GARANTÍA ---------------- */}
        <Card className="bg-pizarra-800 border-pizarra-700 text-marfil">
          <CardContent className="p-6 flex gap-5 items-start">
            <div className="h-12 w-12 rounded-full bg-dorado-500/15 border border-dorado-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6 text-dorado-400" />
            </div>
            <div>
              <p className="uppercase tracking-widest text-[10px] text-dorado-300 mb-1">
                Garantía de satisfacción
              </p>
              <h3 className="font-serif text-xl text-marfil mb-1">
                Si el retrato de IA no captura su esencia, lo repetimos sin costo.
              </h3>
              <p className="text-sm text-marfil/70">
                Queremos que cada línea y cada luz reflejen a quien amas.
                Estamos contigo hasta que el retrato se sienta como él.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================== */}
      {/* DERECHA — Resumen del tributo (sticky)    */}
      {/* ======================================== */}
      <aside className="lg:sticky lg:top-24 space-y-4">
        <Card>
          <CardContent className="p-6">
            <p className="uppercase tracking-widest text-[11px] text-dorado-600 mb-4">
              Resumen del tributo
            </p>

            {/* Miniatura del ser querido */}
            <div className="relative rounded-xl overflow-hidden bg-pizarra-100 aspect-[4/5] mb-4">
              {heroSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroSrc} alt={memorial.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-pizarra-400 text-sm px-6 text-center">
                  Sin retrato aún
                </div>
              )}
              {memorial.portrait_ai_url && (
                <span className="absolute top-3 left-3 bg-pizarra-900/80 text-marfil text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                  Retrato IA
                </span>
              )}
            </div>

            <h3 className="font-serif text-2xl text-pizarra-800 leading-tight">{memorial.name}</h3>
            <p className="text-xs text-pizarra-500 mt-1">
              {formatDate(memorial.birth_date)} · {formatDate(memorial.passing_date)}
            </p>

            <div className="my-5 h-px bg-pizarra-100" />

            {/* Líneas de pedido */}
            <div className="space-y-3 text-sm">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-baseline justify-between gap-4"
                >
                  <div>
                    <p className="font-serif text-base text-pizarra-800">Plan {plan.name}</p>
                    <p className="text-xs text-pizarra-500">{plan.tagline}</p>
                  </div>
                  <span className="font-medium text-pizarra-800">{formatMXN(plan.priceMXN)}</span>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {addAr && (
                  <motion.div
                    key="ar-line"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <div>
                      <p className="font-serif text-base text-pizarra-800">{AR_ADDON.name}</p>
                      <p className="text-xs text-pizarra-500">Portal de video en AR</p>
                    </div>
                    <span className="font-medium text-pizarra-800">{formatMXN(AR_ADDON.priceMXN)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="my-5 h-px bg-pizarra-100" />

            {/* TOTAL — animación suave al cambiar */}
            <div className="flex items-baseline justify-between">
              <span className="uppercase tracking-widest text-xs text-pizarra-500">Total</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={total}
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
                  exit={{    opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif text-4xl text-pizarra-800"
                >
                  {formatMXN(total)}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="text-[11px] text-pizarra-400 text-right mt-1">
              Pago único · sin suscripción
            </p>

            {/* CTA */}
            <Button
              onClick={onCheckout}
              disabled={submitting}
              variant="dorado"
              size="lg"
              className="w-full mt-6"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirigiendo…</>
              ) : (
                <>Preservar su historia <ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-pizarra-400">
              <Lock className="h-3 w-3" />
              <span>Pago seguro con Stripe · Visa · Mastercard · Apple/Google Pay</span>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2 text-center">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* micro-reassurance */}
        <p className="text-center text-[11px] text-pizarra-400 px-4">
          Al continuar, aceptas nuestros términos y la garantía de satisfacción.
          No almacenamos datos de tu tarjeta.
        </p>
      </aside>
    </div>
  );
}
