'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Result = { ok: true } | { ok: false; error: string };

export async function updateProfile(formData: FormData): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'no_autenticado' };

  const fullName = String(formData.get('full_name') ?? '').trim();
  if (fullName.length < 2 || fullName.length > 120) {
    return { ok: false, error: 'El nombre debe tener entre 2 y 120 caracteres.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/cuenta');
  return { ok: true };
}

export async function changePassword(formData: FormData): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: 'no_autenticado' };

  const currentPassword = String(formData.get('current_password') ?? '');
  const newPassword = String(formData.get('new_password') ?? '');

  if (newPassword.length < 8) {
    return { ok: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' };
  }
  if (newPassword === currentPassword) {
    return { ok: false, error: 'La nueva contraseña debe ser distinta a la actual.' };
  }

  // Verifica la contraseña actual re-autenticando.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) {
    return { ok: false, error: 'La contraseña actual no es correcta.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true };
}

export async function updateOrderShipping(formData: FormData): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'no_autenticado' };

  const orderId = String(formData.get('order_id') ?? '');
  if (!orderId) return { ok: false, error: 'order_id_requerido' };

  const address = {
    name:        String(formData.get('name') ?? '').trim() || null,
    phone:       String(formData.get('phone') ?? '').trim() || null,
    line1:       String(formData.get('line1') ?? '').trim() || null,
    line2:       String(formData.get('line2') ?? '').trim() || null,
    city:        String(formData.get('city') ?? '').trim() || null,
    state:       String(formData.get('state') ?? '').trim() || null,
    postal_code: String(formData.get('postal_code') ?? '').trim() || null,
    country:     String(formData.get('country') ?? '').trim().toUpperCase() || null,
  };

  if (!address.line1 || !address.city || !address.postal_code || !address.country) {
    return { ok: false, error: 'Dirección incompleta (calle, ciudad, CP y país son obligatorios).' };
  }

  // Ownership check + sólo editar si aún no se envió
  const admin = createAdminClient();
  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) return { ok: false, error: 'orden_no_encontrada' };
  if (order.user_id !== user.id) return { ok: false, error: 'no_autorizado' };
  if (order.status === 'shipped' || order.status === 'cancelled') {
    return { ok: false, error: 'Esta orden ya no se puede editar.' };
  }

  const { error: updateErr } = await admin
    .from('orders')
    .update({ shipping_address: address })
    .eq('id', orderId);

  if (updateErr) return { ok: false, error: updateErr.message };

  revalidatePath('/dashboard/cuenta');
  return { ok: true };
}

/**
 * Elimina la cuenta del usuario actual. Cascadea por FK:
 *  - profiles (ON DELETE CASCADE en auth.users)
 *  - memorials.owner_id → orders.user_id → memorial_media, etc.
 *
 * Cumple LFPDPPP Art. 25 (derecho de cancelación ARCO) y GDPR Art. 17.
 */
export async function deleteAccount(formData: FormData): Promise<Result> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'no_autenticado' };

  // Requiere que el usuario escriba su email para confirmar
  const confirmation = String(formData.get('confirm_email') ?? '').trim().toLowerCase();
  if (confirmation !== (user.email ?? '').toLowerCase()) {
    return { ok: false, error: 'La confirmación no coincide con tu correo.' };
  }

  const admin = createAdminClient();

  // Limpieza de Storage: cada memorial tiene carpeta {memorial_id}/ en bucket 'memorials'.
  try {
    const { data: memorials } = await admin
      .from('memorials')
      .select('id')
      .eq('owner_id', user.id);
    for (const m of memorials ?? []) {
      try {
        const { data: files } = await admin.storage.from('memorials').list(m.id, { limit: 1000 });
        if (files && files.length > 0) {
          await admin.storage.from('memorials').remove(files.map((f) => `${m.id}/${f.name}`));
        }
      } catch { /* seguir con los demás */ }
    }
  } catch { /* no bloquear borrado de cuenta si storage falla */ }

  // Borrado manual de registros con FK no-cascade (partner accounts, si existe)
  try {
    await admin.from('partner_accounts').update({ status: 'suspended' }).eq('user_id', user.id);
  } catch { /* noop */ }

  // Elimina el usuario en auth.users → cascadea en profiles, memorials, orders
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: error.message };

  // Cierra sesión local
  await supabase.auth.signOut();
  redirect('/?deleted=1');
}
