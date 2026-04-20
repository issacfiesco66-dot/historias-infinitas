import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ProfileForm,
  PasswordForm,
  ShippingEditor,
  DeleteAccountForm,
} from './forms';

export const metadata = {
  title: 'Mi cuenta — Historias Infinitas',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function CuentaPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  // Órdenes editables: Eterno (requiere envío) que aún no se enviaron.
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from('orders')
    .select('id, plan_id, status, shipping_address, memorial_id')
    .eq('user_id', user.id)
    .eq('plan_id', 'eterno')
    .in('status', ['pending', 'paid'])
    .order('created_at', { ascending: false });

  const memorialIds = (orders ?? []).map((o) => o.memorial_id).filter(Boolean) as string[];
  const { data: memorials } = memorialIds.length
    ? await admin.from('memorials').select('id, name').in('id', memorialIds)
    : { data: [] };
  const nameByMid = new Map((memorials ?? []).map((m: any) => [m.id, m.name]));

  const editableOrders = (orders ?? []).map((o: any) => ({
    id: o.id,
    memorialName: nameByMid.get(o.memorial_id) ?? 'Nicho Virtual',
    planId: o.plan_id,
    status: o.status,
    shippingAddress: o.shipping_address ?? null,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-2">Tu cuenta</p>
        <h1 className="font-serif text-4xl text-pizarra-800">Mi cuenta</h1>
        <p className="text-pizarra-500 mt-1 text-sm">
          Gestiona tu perfil, contraseña, envíos y datos personales.
        </p>
      </div>

      <ProfileForm
        initialName={profile?.full_name ?? ''}
        email={profile?.email ?? user.email ?? ''}
      />

      <PasswordForm />

      <ShippingEditor orders={editableOrders} />

      <DeleteAccountForm email={profile?.email ?? user.email ?? ''} />
    </div>
  );
}
