import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import type { PartnerLead } from '@/lib/partner-leads';
import { LeadsFunerariaPanel } from './leads-client';

export const metadata = {
  title: 'Leads de funerarias — Panel admin',
  robots: { index: false },
};

// Siempre dinámica — datos en tiempo real.
export const dynamic = 'force-dynamic';

export default async function LeadsFunerariasPage() {
  // ——— auth ———
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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

  // ——— data (service-role, evita RLS) ———
  const admin = createAdminClient();

  const { data: leads, error } = await admin
    .from('partner_leads')
    .select(
      'id, business_name, phone, city, state, google_place_id, source, status, token, notes, converted_partner_id, contacted_at, engaged_at, opted_out_at, converted_at, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) {
    console.error('[leads-funerarias] select falló:', error.message);
  }

  const rows = (leads ?? []) as PartnerLead[];

  // ——— stats ———
  const byStatus = {
    scraped: 0,
    contacted: 0,
    engaged: 0,
    opted_out: 0,
    converted: 0,
  };
  for (const l of rows) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ??
    'https://historias-infinitas.com';

  return (
    <div className="space-y-8">
      {/* ——— cabecera ——— */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-2">
            Panel privado · Leads B2B
          </p>
          <h1 className="font-serif text-4xl text-pizarra-800">Funerarias — Pipeline</h1>
          <p className="text-pizarra-500 mt-1 text-sm">
            {rows.length} lead{rows.length !== 1 && 's'} totales — scrapedos por indexa e
            ingestados vía <code className="bg-pizarra-100 px-1 py-0.5 rounded text-xs">/api/leads/funeraria</code>.
          </p>
        </div>
        <Link href="/dashboard/admin" className="text-sm text-pizarra-500 hover:text-pizarra-800">
          ← Volver al panel general
        </Link>
      </div>

      {/* ——— KPIs ——— */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatusCard label="Scraped" value={byStatus.scraped} hint="Descubiertos, sin contactar" tone="gray" />
        <StatusCard label="Contactados" value={byStatus.contacted} hint="WhatsApp enviado" tone="blue" />
        <StatusCard label="Engaged" value={byStatus.engaged} hint="Abrieron el link personalizado" tone="purple" />
        <StatusCard label="Convertidos" value={byStatus.converted} hint="Compraron un plan" tone="green" />
        <StatusCard label="Opt-out" value={byStatus.opted_out} hint="Pidieron baja" tone="red" />
      </div>

      {/* ——— panel interactivo ——— */}
      <LeadsFunerariaPanel leads={rows} baseUrl={baseUrl} />
    </div>
  );
}

/* ============================================================================
 *  Stat card (misma estética que KpiCard del dashboard admin general)
 * ========================================================================== */
function StatusCard({
  label, value, hint, tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: 'gray' | 'blue' | 'purple' | 'green' | 'red';
}) {
  const toneClasses: Record<typeof tone, string> = {
    gray:   'border-pizarra-200 bg-pizarra-50 text-pizarra-700',
    blue:   'border-blue-200 bg-blue-50 text-blue-800',
    purple: 'border-purple-200 bg-purple-50 text-purple-800',
    green:  'border-emerald-200 bg-emerald-50 text-emerald-800',
    red:    'border-red-200 bg-red-50 text-red-700',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="uppercase tracking-widest text-[10px] font-semibold opacity-80">{label}</p>
      <p className="font-serif text-3xl mt-1">{value.toLocaleString('es-MX')}</p>
      <p className="text-[11px] mt-1 opacity-70 leading-tight">{hint}</p>
    </div>
  );
}
