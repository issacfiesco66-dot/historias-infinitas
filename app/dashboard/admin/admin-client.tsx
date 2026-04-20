'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, CheckCircle2, ExternalLink, Truck, X, Loader2,
  AlertCircle, Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, cn } from '@/lib/utils';
import { markAsShipped } from './actions';

export interface ShippingAddress {
  name?: string | null;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export interface AdminOrderRow {
  id: string;
  createdAt: string;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  hasArAddon: boolean;
  trackingNumber: string | null;
  memorialName: string;
  memorialSlug: string | null;
  buyerEmail: string;
  buyerName: string | null;
  existingCarrier: string | null;
  shippingAddress: ShippingAddress | null;
}

export function AdminClient({ orders }: { orders: AdminOrderRow[] }) {
  const [shipping, setShipping] = useState<AdminOrderRow | null>(null);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-pizarra-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-pizarra-800">Órdenes recientes</h2>
            <p className="text-xs text-pizarra-500">Últimas {orders.length} · las doradas requieren grabar y enviar placa</p>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-pizarra-400 hidden md:block">
            Total en pantalla: {orders.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-pizarra-500 bg-pizarra-50">
                <th className="text-left px-6 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Nicho Virtual</th>
                <th className="text-left px-4 py-3">Comprador</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-right px-4 py-3">Monto</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center px-6 py-14 text-pizarra-400 text-sm">
                    Aún no hay órdenes registradas.
                  </td>
                </tr>
              )}

              {orders.map((o) => {
                const needsShipping = o.status === 'paid' && o.planId === 'eterno';
                return (
                  <tr
                    key={o.id}
                    className={cn(
                      'border-t border-pizarra-100 transition-colors',
                      needsShipping
                        ? 'bg-dorado-50/70 hover:bg-dorado-100/70'
                        : 'hover:bg-pizarra-50',
                    )}
                  >
                    <td className="px-6 py-3 text-pizarra-600 whitespace-nowrap">
                      <div>{formatDate(o.createdAt)}</div>
                      <div className="text-[10px] text-pizarra-400 font-mono">
                        HI-{o.id.slice(0, 8).toUpperCase()}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-serif text-pizarra-800">{o.memorialName}</div>
                      {o.memorialSlug && (
                        <Link
                          href={`/memorial/${o.memorialSlug}`}
                          target="_blank"
                          className="text-[11px] text-dorado-600 hover:underline inline-flex items-center gap-1"
                        >
                          /{o.memorialSlug}<ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </td>

                    <td className="px-4 py-3 text-pizarra-600">
                      <div>{o.buyerName ?? '—'}</div>
                      <div className="text-[11px] text-pizarra-400">{o.buyerEmail}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <PlanBadge planId={o.planId} />
                        {o.hasArAddon && (
                          <span title="Portal AR incluido" className="inline-flex items-center gap-1 text-[10px] text-dorado-700 bg-dorado-100 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                            <Sparkles className="h-2.5 w-2.5" /> AR
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-pizarra-800 whitespace-nowrap">
                      {o.currency} {o.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                      {o.trackingNumber && (
                        <div className="text-[11px] text-pizarra-400 font-mono mt-1">
                          {o.trackingNumber}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      {needsShipping ? (
                        <Button
                          size="sm"
                          variant="dorado"
                          onClick={() => setShipping(o)}
                        >
                          <Truck className="h-3.5 w-3.5 mr-1.5" /> Enviar placa
                        </Button>
                      ) : o.status === 'shipped' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Enviado
                        </span>
                      ) : (
                        <span className="text-[11px] text-pizarra-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ShipModal
        order={shipping}
        onClose={() => setShipping(null)}
      />
    </>
  );
}

/* ============================================================================
 *  Shipping address card (dentro del modal)
 * ========================================================================== */
function ShippingAddressCard({ address }: { address: ShippingAddress | null }) {
  const hasAnyField =
    address && (address.line1 || address.city || address.postal_code || address.country);

  if (!hasAnyField) {
    return (
      <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> Sin dirección de envío registrada
        </p>
        <p className="mt-1 text-amber-800">
          Esta orden no tiene dirección (compra anterior al fix de checkout).
          Contacta al cliente por email antes de enviar.
        </p>
      </div>
    );
  }

  const { name, phone, line1, line2, city, state, postal_code, country } = address!;
  const cityLine = [city, state, postal_code].filter(Boolean).join(', ');

  function handleCopy() {
    const full = [name, line1, line2, cityLine, country, phone && `Tel: ${phone}`]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard?.writeText(full).catch(() => {});
  }

  return (
    <div className="mt-5 rounded-lg border border-pizarra-200 bg-pizarra-50 p-4 text-sm text-pizarra-700">
      <div className="flex items-start justify-between gap-2">
        <p className="uppercase tracking-widest text-[10px] text-pizarra-500 mb-2">
          Enviar a
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[10px] uppercase tracking-widest text-dorado-600 hover:text-dorado-700"
        >
          Copiar
        </button>
      </div>
      <div className="space-y-0.5 leading-snug">
        {name && <p className="font-medium text-pizarra-800">{name}</p>}
        {line1 && <p>{line1}</p>}
        {line2 && <p>{line2}</p>}
        {cityLine && <p>{cityLine}</p>}
        {country && <p className="uppercase text-[11px] text-pizarra-500">{country}</p>}
        {phone && <p className="mt-2 font-mono text-[12px]">☎ {phone}</p>}
      </div>
    </div>
  );
}

/* ============================================================================
 *  BADGES
 * ========================================================================== */

function PlanBadge({ planId }: { planId: string }) {
  const palette: Record<string, { bg: string; text: string; label: string }> = {
    digital:   { bg: 'bg-pizarra-100',  text: 'text-pizarra-700', label: 'Digital'  },
    artistico: { bg: 'bg-dorado-100',   text: 'text-dorado-800',  label: 'Artístico'},
    eterno:    { bg: 'bg-pizarra-800',  text: 'text-marfil',      label: 'Eterno'   },
  };
  const p = palette[planId] ?? { bg: 'bg-pizarra-100', text: 'text-pizarra-700', label: planId };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
      {planId === 'eterno' && <Package className="h-2.5 w-2.5" />}
      {p.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    pending:   'bg-pizarra-100 text-pizarra-600',
    paid:      'bg-green-50 text-green-700',
    shipped:   'bg-blue-50 text-blue-700',
    cancelled: 'bg-red-50 text-red-700',
  };
  const cls = palette[status] ?? 'bg-pizarra-100 text-pizarra-600';
  return (
    <span className={`inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  );
}

/* ============================================================================
 *  MODAL — registrar envío
 * ========================================================================== */

function ShipModal({
  order, onClose,
}: { order: AdminOrderRow | null; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!order) return;
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      orderId: order.id,
      trackingNumber: String(form.get('tracking_number') ?? '').trim(),
      carrier: String(form.get('carrier') ?? '').trim() || undefined,
      trackingUrl: String(form.get('tracking_url') ?? '').trim() || undefined,
      estimatedDelivery: String(form.get('estimated_delivery') ?? '').trim() || undefined,
    };

    startTransition(async () => {
      const res = await markAsShipped(payload);
      if (!res.ok) { setError(res.error ?? 'Error'); return; }
      onClose();
    });
  }

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 bg-pizarra-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="modal"
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0,  opacity: 1, scale: 1 }}
            exit={{    y: 18, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg bg-marfil rounded-2xl shadow-solemn overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 h-9 w-9 rounded-full hover:bg-pizarra-100 text-pizarra-500 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-7">
              <p className="uppercase tracking-[0.3em] text-[11px] text-dorado-600 mb-2">
                Registrar envío
              </p>
              <h2 className="font-serif text-2xl text-pizarra-800">
                Placa de <span className="text-gradient-dorado italic">{order.memorialName}</span>
              </h2>
              <p className="text-sm text-pizarra-500 mt-1">
                Esto cambia la orden a <strong>shipped</strong> y notifica al cliente
                en <span className="font-mono">{order.buyerEmail}</span>.
              </p>

              <ShippingAddressCard address={order.shippingAddress} />

              <form onSubmit={onSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="tracking_number">Número de guía *</Label>
                  <Input
                    id="tracking_number"
                    name="tracking_number"
                    placeholder="1Z999AA10123456784"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="carrier">Transportista</Label>
                    <Input
                      id="carrier"
                      name="carrier"
                      placeholder={order.existingCarrier ?? 'DHL'}
                      defaultValue={order.existingCarrier ?? ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_delivery">Llega entre</Label>
                    <Input
                      id="estimated_delivery"
                      name="estimated_delivery"
                      placeholder="15–18 de abril"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracking_url">URL de rastreo</Label>
                  <Input
                    id="tracking_url"
                    name="tracking_url"
                    type="url"
                    placeholder="https://tracking.dhl.com/..."
                  />
                </div>

                {error && (
                  <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="dorado" disabled={pending}>
                    {pending
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…</>
                      : <><Truck className="h-4 w-4 mr-2" /> Marcar como enviado</>}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
