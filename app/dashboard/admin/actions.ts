'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { sendTransactional } from '@/lib/emails/send';

/* ============================================================================
 *  markAsShipped
 *  — Cambia la orden a 'shipped', guarda tracking + metadata, envía correo.
 *  — Solo ejecutable por emails listados en ADMIN_EMAILS.
 *  — Envía plate_shipped directamente (no depende del DB webhook).
 * ========================================================================== */

export interface ShipPayload {
  orderId: string;
  trackingNumber: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export interface ShipResult {
  ok: boolean;
  error?: string;
}

export async function markAsShipped(input: ShipPayload): Promise<ShipResult> {
  // 1) Verifica sesión admin
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return { ok: false, error: 'No autorizado' };
  }

  const tracking = (input.trackingNumber ?? '').trim();
  if (!tracking) return { ok: false, error: 'Número de guía requerido' };

  const admin = createAdminClient();

  // 2) Lee la orden (necesitamos memorial_id, user_id y la shipping_address existente)
  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('id, user_id, memorial_id, status, plan_id, shipping_address, tracking_number')
    .eq('id', input.orderId)
    .single();

  if (orderErr || !order) return { ok: false, error: 'Orden no encontrada' };

  // Idempotencia: si ya está enviada con el mismo tracking, no re-enviamos correo.
  if (order.status === 'shipped' && order.tracking_number === tracking) {
    return { ok: true };
  }

  // 3) Fusiona shipping_address existente con los datos nuevos del transportista
  const currentAddr = (order.shipping_address ?? {}) as Record<string, any>;
  const mergedAddr = {
    ...currentAddr,
    carrier: input.carrier?.trim() || currentAddr.carrier || null,
    tracking_url: input.trackingUrl?.trim() || null,
    estimated_delivery: input.estimatedDelivery?.trim() || null,
  };

  // 4) UPDATE
  const { error: upErr } = await admin
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number: tracking,
      shipping_address: mergedAddr,
    })
    .eq('id', input.orderId);

  if (upErr) return { ok: false, error: upErr.message };

  // 5) Correo plate_shipped — mismo patrón que /api/stripe/webhook (inmediato)
  try {
    const [{ data: memorial }, { data: profile }] = await Promise.all([
      admin.from('memorials').select('name').eq('id', order.memorial_id).single(),
      admin.from('profiles').select('email, full_name').eq('id', order.user_id).single(),
    ]);
    if (profile?.email && memorial?.name) {
      await sendTransactional({
        event: 'plate_shipped',
        to: profile.email,
        data: {
          name: profile.full_name,
          memorialName: memorial.name,
          trackingNumber: tracking,
          carrier: mergedAddr.carrier ?? 'Nuestro transportista',
          trackingUrl: mergedAddr.tracking_url,
          estimatedDelivery: mergedAddr.estimated_delivery,
        },
      });
    }
  } catch (err) {
    // El correo no bloquea: la orden ya quedó marcada como enviada.
    console.error('[admin/markAsShipped] correo plate_shipped falló:', err);
  }

  revalidatePath('/dashboard/admin');
  return { ok: true };
}
