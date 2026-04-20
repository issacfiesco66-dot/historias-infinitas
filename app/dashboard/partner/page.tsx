import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Handshake, Coins, Calendar, TrendingUp, Image as ImageIcon, Link2, Copy,
  ArrowRight, Sparkles,
} from 'lucide-react';
import { getPartnerPlan } from '@/lib/partner-plans';
import { formatDate } from '@/lib/utils';
import { LogoUploader } from './logo-uploader';
import { CopyReferralLink } from './copy-referral-link';

export const metadata = {
  title: 'Panel de Socio — Historias Infinitas',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function PartnerDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/dashboard/partner');

  const { data: partner } = await supabase
    .from('partner_accounts')
    .select('id, business_name, contact_email, logo_url, plan_id, credits_total, credits_used, valid_until, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!partner) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="mx-auto w-14 h-14 rounded-full bg-dorado-100 flex items-center justify-center mb-6">
          <Handshake className="h-6 w-6 text-dorado-600" />
        </div>
        <h1 className="font-serif text-3xl text-pizarra-800 mb-3">
          Aún no eres socio
        </h1>
        <p className="text-pizarra-500 mb-8 max-w-md mx-auto">
          El Programa de Socios te permite ofrecer nichos virtuales a
          tus familias con tu marca. Conoce los planes y únete.
        </p>
        <Button asChild variant="dorado" size="lg">
          <Link href="/partners#planes">Ver planes y precios</Link>
        </Button>
      </div>
    );
  }

  // Comisiones generadas por el socio
  const { data: commissions } = await supabase
    .from('partner_commissions')
    .select('commission_amount, status')
    .eq('partner_id', partner.id);

  // Memoriales originados por el socio
  const { data: memorials } = await supabase
    .from('memorials')
    .select('id, slug, name, status, created_at')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false })
    .limit(12);

  const plan = getPartnerPlan(partner.plan_id as any);
  const creditsRemaining = Math.max(0, partner.credits_total - partner.credits_used);
  const pctUsed = partner.credits_total > 0
    ? Math.round((partner.credits_used / partner.credits_total) * 100)
    : 0;

  const totalCommissions = (commissions ?? []).reduce(
    (sum, c) => sum + Number(c.commission_amount ?? 0), 0,
  );
  const pendingCommissions = (commissions ?? [])
    .filter((c) => c.status === 'pending' || c.status === 'ready')
    .reduce((sum, c) => sum + Number(c.commission_amount ?? 0), 0);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://historias-infinitas.com';
  const referralUrl = `${baseUrl}/register?ref=${partner.id}`;
  const qrDataUrl = await QRCode.toDataURL(referralUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 400,
    color: { dark: '#2E3440', light: '#FBF9F4' },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-2">
            Panel de socio
          </p>
          <h1 className="font-serif text-4xl text-pizarra-800">{partner.business_name}</h1>
          <p className="text-sm text-pizarra-500 mt-1">
            Plan {plan.name} · {partner.contact_email}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-pizarra-400 uppercase tracking-widest">Vigencia</p>
          <p className="font-serif text-lg text-pizarra-800">
            {partner.valid_until ? formatDate(partner.valid_until) : '—'}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-4">
        <KPICard
          icon={<Coins className="h-5 w-5" />}
          label="Créditos disponibles"
          value={String(creditsRemaining)}
          sub={`${partner.credits_used} / ${partner.credits_total} usados`}
          progress={pctUsed}
        />
        <KPICard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Comisiones generadas"
          value={formatMXN(totalCommissions)}
          sub={`${formatMXN(pendingCommissions)} por cobrar`}
        />
        <KPICard
          icon={<Calendar className="h-5 w-5" />}
          label="Nichos virtuales entregados"
          value={String((memorials ?? []).length)}
          sub="Últimos 90 días"
        />
      </div>

      {/* 2 columnas: branding + link referido */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-dorado-600">
              <ImageIcon className="h-4 w-4" />
              <span className="uppercase tracking-widest text-xs">Tu marca en cada nicho virtual</span>
            </div>
            <h2 className="font-serif text-2xl text-pizarra-800">Logotipo</h2>
            <p className="text-sm text-pizarra-500">
              Sube tu logo (PNG transparente recomendado, máximo 2 MB). Aparecerá
              al pie de cada nicho virtual que originen tus familias.
            </p>
            <LogoUploader partnerId={partner.id} initialLogoUrl={partner.logo_url} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-dorado-600">
              <Link2 className="h-4 w-4" />
              <span className="uppercase tracking-widest text-xs">Enlace y QR</span>
            </div>
            <h2 className="font-serif text-2xl text-pizarra-800">Tu link referido</h2>
            <p className="text-sm text-pizarra-500">
              Comparte este enlace o QR con tus familias. Cada nicho virtual creado
              desde aquí consume 1 crédito y queda vinculado a tu cuenta.
            </p>

            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR referido" className="w-28 h-28 rounded-md ring-1 ring-pizarra-100" />
              <div className="flex-1 min-w-0 space-y-2">
                <CopyReferralLink url={referralUrl} />
                <p className="text-[11px] text-pizarra-400 break-all font-mono">{referralUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de memoriales */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="uppercase tracking-widest text-xs text-dorado-600 mb-1">
                Nichos Virtuales recientes
              </p>
              <h2 className="font-serif text-2xl text-pizarra-800">
                Entregados por tu equipo
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/partners#planes">
                <Sparkles className="h-4 w-4 mr-1.5" /> Comprar más créditos
              </Link>
            </Button>
          </div>

          {(memorials ?? []).length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-pizarra-500 mb-4">
                Aún no hay nichos virtuales originados por tu cuenta.
              </p>
              <Button asChild variant="dorado" size="sm">
                <Link href="#">
                  <ArrowRight className="h-4 w-4 mr-1.5" /> Copia el link arriba y compártelo
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-pizarra-100">
              {(memorials ?? []).map((m: any) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg text-pizarra-800">{m.name}</p>
                    <p className="text-xs text-pizarra-500">
                      {formatDate(m.created_at)} · /{m.slug} · <span className={
                        m.status === 'publicado' ? 'text-green-600' : 'text-pizarra-400'
                      }>{m.status}</span>
                    </p>
                  </div>
                  {m.status === 'publicado' && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/memorial/${m.slug}`} target="_blank">
                        Ver <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================ UI helpers ============================ */

function KPICard({
  icon, label, value, sub, progress,
}: { icon: React.ReactNode; label: string; value: string; sub?: string; progress?: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-dorado-600 mb-3">
          {icon}
          <span className="uppercase tracking-widest text-[10px]">{label}</span>
        </div>
        <p className="font-serif text-3xl text-pizarra-800">{value}</p>
        {sub && <p className="text-xs text-pizarra-500 mt-1">{sub}</p>}
        {typeof progress === 'number' && (
          <div className="mt-3 h-1.5 bg-pizarra-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-dorado-500 transition-all"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatMXN(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n);
}
