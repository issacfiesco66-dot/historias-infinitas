'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';
import { PARTNER_REF_COOKIE } from '@/lib/partner-referral';

export interface CreateMemorialResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function createMemorial(input: {
  name: string;
  type: 'mascota' | 'ser_querido';
  birth_date?: string | null;
  passing_date?: string | null;
  biography?: string | null;
  epitaph?: string | null;
}): Promise<CreateMemorialResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'no_autenticado' };

  // ¿Viene de un partner?
  const cookieStore = cookies();
  const refCookie = cookieStore.get(PARTNER_REF_COOKIE)?.value ?? null;

  let partnerId: string | null = null;
  if (refCookie) {
    const admin = createAdminClient();
    const { data: partner } = await admin
      .from('partner_accounts')
      .select('id, credits_total, credits_used, status')
      .eq('id', refCookie)
      .maybeSingle();

    if (
      partner &&
      partner.status === 'active' &&
      partner.credits_used < partner.credits_total
    ) {
      partnerId = partner.id;
    }
  }

  const { data, error } = await supabase
    .from('memorials')
    .insert({
      owner_id:     user.id,
      slug:         slugify(input.name),
      type:         input.type,
      status:       'borrador',
      name:         input.name,
      birth_date:   input.birth_date || null,
      passing_date: input.passing_date || null,
      biography:    input.biography || null,
      epitaph:      input.epitaph || null,
      partner_id:   partnerId,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  // Consumir crédito si corresponde
  if (partnerId && data) {
    try {
      const admin = createAdminClient();
      await admin.rpc('consume_partner_credit', { p_memorial_id: data.id });
    } catch (err) {
      console.warn('[createMemorial] consume_partner_credit falló:', err);
    }
    // Limpiamos la cookie para que no se reutilice en memoriales siguientes
    cookieStore.delete(PARTNER_REF_COOKIE);
  }

  return { ok: true, id: data!.id };
}
