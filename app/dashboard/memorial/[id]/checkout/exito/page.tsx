import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, QrCode, Heart, AlertTriangle } from 'lucide-react';
import { getPlan, type PlanId } from '@/lib/plans';
import { PurchaseTracker } from './purchase-tracker';

interface Props {
  params: { id: string };
  searchParams: { session_id?: string };
}

export const metadata = {
  title: 'Gracias — Historias Infinitas',
  robots: { index: false },
};

// Página dinámica (depende de la Stripe session en querystring).
export const dynamic = 'force-dynamic';

/**
 * Página de éxito tras el pago.
 *
 * Además de mostrar el agradecimiento, RECONCILIA el pago:
 *  - Si el webhook ya marcó el memorial como publicado, seguimos.
 *  - Si no llegó (Stripe lento, misconfig, dev local sin `stripe listen`,
 *    etc.), verificamos la session directamente con la API de Stripe y,
 *    si está "paid", actualizamos el memorial a publicado e insertamos
 *    la orden. Idempotente — seguro correr siempre.
 */
export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: memorial } = await supabase
    .from('memorials')
    .select('id, slug, name, status, plan_id')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single();

  if (!memorial) notFound();

  // Intento de reconciliación — sólo si tenemos session_id y el memorial
  // todavía está en borrador.
  let reconciled = memorial.status === 'publicado';
  let reconcileError: string | null = null;
  let orderForTracking: {
    id: string;
    plan_id: string;
    amount_total: number;
    currency: string;
    has_ar_addon: boolean;
  } | null = null;

  if (!reconciled && searchParams.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);

      const paidStatuses = ['paid', 'no_payment_required'];
      if (session && paidStatuses.includes(session.payment_status ?? '')) {
        // Ownership double check — la metadata del Checkout debe coincidir.
        const metaUserId = session.metadata?.user_id;
        const metaMemorialId = session.metadata?.memorial_id;
        const metaPlanId = session.metadata?.plan_id as PlanId | undefined;

        if (metaUserId === user.id && metaMemorialId === memorial.id && metaPlanId) {
          const admin = createAdminClient();

          // Insertar la orden si no existe (idempotente por stripe_session_id UNIQUE)
          try {
            await admin.from('orders').insert({
              user_id: user.id,
              memorial_id: memorial.id,
              stripe_session_id: session.id,
              plan_id: metaPlanId,
              amount_total: (session.amount_total ?? 0) / 100,
              currency: (session.currency ?? 'mxn').toLowerCase(),
              status: 'paid',
              has_ar_addon: session.metadata?.ar_addon === '1',
              slug_memorial: memorial.slug,
            });
          } catch {
            // ya existe — ok
          }

          // Activar memorial
          const { error: updateErr } = await admin
            .from('memorials')
            .update({ status: 'publicado', plan_id: metaPlanId })
            .eq('id', memorial.id)
            .eq('owner_id', user.id);

          if (!updateErr) {
            reconciled = true;
            memorial.status = 'publicado';
            try { getPlan(metaPlanId); } catch { /* plan desconocido — ignorar */ }
          } else {
            reconcileError = updateErr.message;
          }
        }
      }
    } catch (err: any) {
      console.error('[exito] reconcile error:', err?.message);
      reconcileError = 'No pudimos confirmar el pago automáticamente.';
    }
  }

  // Si está reconciliado, traemos los datos de la orden para el tracker de conversión.
  if (reconciled && searchParams.session_id) {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, plan_id, amount_total, currency, has_ar_addon')
      .eq('stripe_session_id', searchParams.session_id)
      .maybeSingle();
    if (order) {
      orderForTracking = {
        id: order.id,
        plan_id: order.plan_id,
        amount_total: Number(order.amount_total),
        currency: order.currency,
        has_ar_addon: Boolean(order.has_ar_addon),
      };
    }
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-10">
      {orderForTracking && (
        <PurchaseTracker
          orderId={orderForTracking.id}
          planId={orderForTracking.plan_id}
          amount={orderForTracking.amount_total}
          currency={orderForTracking.currency}
          hasArAddon={orderForTracking.has_ar_addon}
        />
      )}
      <div className="mx-auto w-16 h-16 rounded-full bg-dorado-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="h-8 w-8 text-dorado-600" />
      </div>

      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
        {reconciled ? 'Nicho virtual activo' : 'Orden recibida'}
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 leading-tight">
        Gracias por este gesto,<br />
        <span className="text-gradient-dorado italic">{memorial.name}</span> lo merece.
      </h1>

      <p className="text-pizarra-500 mt-4">
        {reconciled
          ? 'Tu nicho virtual ya es público — su URL única y el QR están listos.'
          : 'Hemos recibido tu orden y estamos confirmando el pago. Si no se activa en los próximos minutos, vuelve a esta página.'}
      </p>

      {reconcileError && (
        <div className="mt-6 inline-flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm text-left max-w-md">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{reconcileError} Si el problema persiste, escríbenos y lo activaremos manualmente.</span>
        </div>
      )}

      <Card className="mt-10 text-left">
        <CardContent className="p-6 space-y-4">
          <p className="uppercase tracking-widest text-[11px] text-dorado-600">Lo que sigue</p>
          <ol className="space-y-3 text-sm text-pizarra-700">
            <li className="flex gap-3">
              <Heart className="h-4 w-4 text-dorado-500 mt-0.5 shrink-0" />
              Revisa tu nicho virtual y completa los últimos detalles si lo deseas.
            </li>
            <li className="flex gap-3">
              <QrCode className="h-4 w-4 text-dorado-500 mt-0.5 shrink-0" />
              Tu QR único ya está disponible en el panel. Puedes imprimirlo donde el corazón te pida.
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild variant="dorado">
          <Link href={`/dashboard/memorial/${memorial.id}`}>Volver al nicho virtual</Link>
        </Button>
        {reconciled ? (
          <Button asChild variant="outline">
            <Link href={`/memorial/${memorial.slug}`} target="_blank">Ver nicho virtual público</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={`/dashboard/memorial/${params.id}/checkout/exito?session_id=${searchParams.session_id ?? ''}`}>
              Volver a intentar
            </Link>
          </Button>
        )}
      </div>

      {searchParams.session_id && (
        <p className="mt-8 font-mono text-[10px] text-pizarra-300">
          ref: {searchParams.session_id}
        </p>
      )}
    </div>
  );
}
