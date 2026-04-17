'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Actualiza el logo del partner. El archivo se sube desde el cliente a un
 * bucket dedicado; esta acción sólo guarda la URL final.
 */
export async function savePartnerLogo(partnerId: string, logoUrl: string | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'no_autenticado' };

  // Ownership check
  const { data: partner } = await supabase
    .from('partner_accounts')
    .select('id, user_id')
    .eq('id', partnerId)
    .single();
  if (!partner || partner.user_id !== user.id) {
    return { ok: false, error: 'sin_permiso' };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('partner_accounts')
    .update({ logo_url: logoUrl })
    .eq('id', partnerId);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard/partner');
  return { ok: true };
}
