import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import { AdminClient, type AdminOrderRow } from './admin-client';
import { formatMXN } from '@/lib/plans';

export const metadata = {
  title: 'Panel de administración — Historias Infinitas',
  robots: { index: false },
};

// Página SIEMPRE dinámica — depende de datos en tiempo real.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // ———————— gate de admin ————————
  if (!isAdminEmail(user.email)) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">Acceso restringido</p>
        <h1 className="font-serif text-3xl text-pizarra-800 mb-3">
          Este panel es privado.
        </h1>
        <p className="text-pizarra-500">
          Si crees que deberías tener acceso, escribe a{' '}
          <a href="mailto:hola@historias-infinitas.com" className="text-dorado-600">
            hola@historias-infinitas.com
          </a>.
        </p>
      </div>
    );
  }

  // ———————— data (service-role, evita RLS) ————————
  const admin = createAdminClient();

  const [
    revenuePaid,
    memorialsActive,
    pendingShipments,
    recentOrders,
  ] = await Promise.all([
    admin
      .from('orders')
      .select('amount_total, currency')
      .in('status', ['paid', 'shipped']),
    admin
      .from('memorials')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'publicado'),
    admin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .eq('plan_id', 'eterno'),
    admin
      .from('orders')
      .select('id, created_at, user_id, memorial_id, plan_id, amount_total, currency, status, has_ar_addon, tracking_number, slug_memorial, shipping_address')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  // Revenue total (suma en JS, sin aggregate RPC)
  const totalRevenue = (revenuePaid.data ?? []).reduce(
    (acc, r: any) => acc + Number(r.amount_total ?? 0),
    0,
  );

  // Enriquecer filas con nombre del memorial + email del usuario
  const rows = (recentOrders.data ?? []) as any[];
  const memorialIds = Array.from(new Set(rows.map((r) => r.memorial_id).filter(Boolean)));
  const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));

  const [{ data: memorials }, { data: profiles }] = await Promise.all([
    memorialIds.length
      ? admin.from('memorials').select('id, name, slug').in('id', memorialIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? admin.from('profiles').select('id, email, full_name').in('id', userIds)
      : Promise.resolve({ data: [] }),
  ] as const);

  const memoByMid = new Map((memorials ?? []).map((m: any) => [m.id, m]));
  const profByUid = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const enriched: AdminOrderRow[] = rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    planId: r.plan_id,
    amount: Number(r.amount_total ?? 0),
    currency: (r.currency ?? 'usd').toString().toUpperCase(),
    status: r.status,
    hasArAddon: Boolean(r.has_ar_addon),
    trackingNumber: r.tracking_number,
    memorialName: memoByMid.get(r.memorial_id)?.name ?? '—',
    memorialSlug: memoByMid.get(r.memorial_id)?.slug ?? r.slug_memorial ?? null,
    buyerEmail: profByUid.get(r.user_id)?.email ?? '—',
    buyerName: profByUid.get(r.user_id)?.full_name ?? null,
    existingCarrier: r.shipping_address?.carrier ?? null,
  }));

  return (
    <div className="space-y-8">
      {/* ——— cabecera ——— */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-2">Panel privado</p>
          <h1 className="font-serif text-4xl text-pizarra-800">Administración</h1>
          <p className="text-pizarra-500 mt-1 text-sm">
            Sesión activa como <strong>{user.email}</strong>
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-pizarra-500 hover:text-pizarra-800">
          ← Volver a mis memoriales
        </Link>
      </div>

      {/* ——— KPIs ——— */}
      <div className="grid md:grid-cols-3 gap-4">
        <KpiCard
          label="Ingresos (pagado + enviado)"
          value={formatMXN(Math.round(totalRevenue))}
          hint="Suma de amount_total sin órdenes canceladas"
          accent="dorado"
        />
        <KpiCard
          label="Memoriales activos"
          value={(memorialsActive.count ?? 0).toLocaleString('es-MX')}
          hint="status = 'publicado'"
        />
        <KpiCard
          label="Placas pendientes de envío"
          value={(pendingShipments.count ?? 0).toLocaleString('es-MX')}
          hint="Plan Eterno · status 'paid'"
          accent={pendingShipments.count && pendingShipments.count > 0 ? 'urgent' : undefined}
        />
      </div>

      {/* ——— tabla de órdenes ——— */}
      <AdminClient orders={enriched} />
    </div>
  );
}

/* ============================================================================
 *  KPI card
 * ========================================================================== */
function KpiCard({
  label, value, hint, accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'dorado' | 'urgent';
}) {
  const tone =
    accent === 'dorado' ? 'border-dorado-300 bg-dorado-50' :
    accent === 'urgent' ? 'border-amber-300 bg-amber-50' :
    'border-pizarra-100 bg-marfil';

  return (
    <div className={`rounded-xl border p-6 ${tone} shadow-solemn`}>
      <p className="uppercase tracking-widest text-[10px] text-pizarra-500 mb-3">{label}</p>
      <p className="font-serif text-4xl text-pizarra-800 leading-none">{value}</p>
      {hint && <p className="text-[11px] text-pizarra-400 mt-2">{hint}</p>}
    </div>
  );
}
