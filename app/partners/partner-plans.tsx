'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  formatPartnerPrice,
  partnerPlanHasDirectCheckout,
  type PartnerPlan,
  type PartnerPlanId,
} from '@/lib/partner-plans';

interface Props {
  plans: readonly PartnerPlan[];
}

export function PartnerPlansGrid({ plans }: Props) {
  const [buying, setBuying] = useState<PartnerPlanId | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((p) => {
          const direct = partnerPlanHasDirectCheckout(p);
          return (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'relative rounded-2xl border p-6 bg-marfil flex flex-col h-full shadow-solemn',
                p.popular ? 'border-dorado-500 shadow-dorado' : 'border-pizarra-100',
              )}
            >
              {p.popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 bg-pizarra-800 text-marfil text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  <Star className="h-3 w-3 text-dorado-400" /> Más elegido
                </span>
              )}

              <div>
                <p className="uppercase tracking-widest text-[10px] text-dorado-600 mb-2">
                  {p.type === 'pack' ? 'Pago único' : p.type === 'annual' ? 'Suscripción anual' : 'A medida'}
                </p>
                <h3 className="font-serif text-2xl text-pizarra-800">{p.name}</h3>
                <p className="text-xs text-pizarra-500 italic mt-1 mb-5">{p.tagline}</p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-serif text-4xl text-pizarra-800">
                    {formatPartnerPrice(p)}
                  </span>
                  {p.priceMXN !== null && (
                    <span className="text-xs text-pizarra-400 uppercase tracking-widest ml-1">
                      {p.type === 'annual' ? '/ año' : 'MXN'}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-pizarra-700">
                      <Check className="h-4 w-4 text-dorado-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                {direct ? (
                  <Button
                    type="button"
                    variant={p.popular ? 'dorado' : 'outline'}
                    className="w-full"
                    onClick={() => setBuying(p.id)}
                  >
                    {p.ctaLabel} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button asChild variant={p.popular ? 'dorado' : 'outline'} className="w-full">
                    <a href={`/contacto?plan=${encodeURIComponent(p.id)}&empresa=1`}>
                      {p.ctaLabel} <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {buying && (
          <BuyDialog
            planId={buying}
            plans={plans}
            onClose={() => setBuying(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================================
 *  Dialogo de compra — captura nombre comercial + email antes de ir a Stripe
 * ========================================================================== */

function BuyDialog({
  planId, plans, onClose,
}: { planId: PartnerPlanId; plans: readonly PartnerPlan[]; onClose: () => void }) {
  const plan = plans.find((p) => p.id === planId)!;
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCheckout(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, businessName, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'No se pudo iniciar el pago');
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-pizarra-900/70 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
    >
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-6">
            <p className="uppercase tracking-widest text-[10px] text-dorado-600 mb-2">
              Confirmar datos
            </p>
            <h3 className="font-serif text-2xl text-pizarra-800">
              {plan.name} — {formatPartnerPrice(plan)} MXN
            </h3>
            <p className="text-sm text-pizarra-500 mt-1 mb-5">
              Pago único. Facturamos CFDI.
            </p>

            <form onSubmit={onCheckout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre comercial</Label>
                <Input
                  id="businessName"
                  required
                  disabled={submitting}
                  placeholder="p. ej. Funeraria San Lázaro"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo del contacto</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  disabled={submitting}
                  placeholder="director@funeraria.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={240}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="dorado" disabled={submitting}>
                  {submitting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirigiendo…</>
                    : <>Continuar al pago <ArrowRight className="h-4 w-4 ml-2" /></>}
                </Button>
              </div>
            </form>

            <p className="mt-5 text-[11px] text-pizarra-400 text-center">
              Pago seguro vía Stripe · Visa / Mastercard / Apple Pay
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
