import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart, Handshake, Sparkles, Building2, TrendingUp,
  ShieldCheck, HeartHandshake, Award, Star, Coins,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal, FadeH1, FadeH2, FadeP, DustParticles } from '@/components/viva-images';
import { PARTNER_PLANS } from '@/lib/partner-plans';
import { PartnerPlansGrid } from './partner-plans';
import { CalBookingScript, CalBookingButton } from '@/components/cal-booking';
import { createAdminClient } from '@/lib/supabase/admin';
import type { PartnerLead } from '@/lib/partner-leads';

export const metadata: Metadata = {
  title: 'Programa de Socios — Historias Infinitas',
  description:
    'Funerarias, clínicas veterinarias y hospicios: ofrece a tus familias una nueva forma de recordar con nichos virtuales, retratos IA y placas físicas con tu logo.',
  alternates: { canonical: '/partners' },
};

export const dynamic = 'force-dynamic';

/**
 * Busca un lead por token y, si aplica, lo marca como 'engaged'.
 * Idempotente: si ya está engaged/converted no re-escribe engaged_at.
 */
async function resolveLeadFromToken(
  token: string | undefined,
): Promise<PartnerLead | null> {
  if (!token || typeof token !== 'string' || token.length < 16 || token.length > 100) {
    return null;
  }
  if (!/^[a-f0-9]+$/i.test(token)) return null; // el token es hex puro

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from('partner_leads')
    .select('*')
    .eq('token', token)
    .maybeSingle<PartnerLead>();

  if (!lead) return null;
  if (lead.status === 'opted_out') return null; // no personalizamos para opt-outs

  // Marca engaged si aún no está engaged/converted
  if (lead.status === 'scraped' || lead.status === 'contacted') {
    await admin
      .from('partner_leads')
      .update({ status: 'engaged', engaged_at: new Date().toISOString() })
      .eq('id', lead.id);
  }

  return lead;
}

export default async function PartnersPage({
  searchParams,
}: { searchParams: { lead?: string } }) {
  const lead = await resolveLeadFromToken(searchParams.lead);
  const firstName = lead?.business_name ?? null;
  const city = lead?.city ?? null;

  return (
    <>
      <SiteHeader />
      <CalBookingScript />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-pizarra-800 text-marfil">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 20% 30%, rgba(183,148,90,0.35), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(183,148,90,0.15), transparent 50%)',
          }}
        />
        <DustParticles count={24} />

        <div className="container-wide relative py-20 md:py-28">
          <Reveal>
            <FadeP className="uppercase tracking-[0.3em] text-[11px] md:text-sm text-dorado-300 mb-5">
              {firstName
                ? <>Propuesta para <span className="text-marfil">{firstName}</span>{city ? ` · ${city}` : ''}</>
                : 'Programa de socios · Funerarias · Clínicas veterinarias · Hospicios'}
            </FadeP>
            <FadeH1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-marfil max-w-4xl">
              El detalle que hace que tus familias{' '}
              <span className="text-gradient-dorado italic">nunca te olviden</span>.
            </FadeH1>
            <FadeP delay={0.1} className="text-marfil/80 mt-6 max-w-2xl text-lg md:text-xl leading-relaxed">
              Regala a cada familia un nicho virtual con retrato IA y QR — con
              el <strong>logo y subdominio de tu empresa</strong>. Un gesto que
              eleva tu servicio y genera recomendaciones durante años.
            </FadeP>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="dorado" size="lg">
                <Link href="#planes">Ver planes y precios</Link>
              </Button>
              <CalBookingButton
                variant="outline"
                size="lg"
                className="!bg-transparent !text-marfil border-marfil/40 hover:!bg-marfil/10"
              >
                Agendar demo · 15 min
              </CalBookingButton>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-marfil/70">
              <StatPill label="Setup en" value="< 48 h" />
              <StatPill label="Nichos Virtuales activos" value="+1,000" />
              <StatPill label="Ahorro vs. retail" value="hasta 60 %" />
              <StatPill label="Comisión por upgrade" value="15 %" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ BENEFICIOS ============ */}
      <section className="container-wide py-24">
        <Reveal className="text-center mb-14">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            ¿Por qué asociarte?
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            Un servicio que vende por ti
          </FadeH2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BenefitCard
            icon={<Heart className="h-6 w-6" />}
            title="Cierre emocional"
            text="Las familias recuerdan a quienes las acompañaron en el momento más difícil. Tu servicio deja un eco que dura años."
          />
          <BenefitCard
            icon={<Building2 className="h-6 w-6" />}
            title="Tu marca, tu subdominio"
            text="Cada nicho virtual vive en tunombre.historias-infinitas.com con tu logo. Los deudos te recuerdan — no a nosotros."
          />
          <BenefitCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Ingreso extra"
            text="Cada vez que una familia sube al plan Eterno o compra el Portal AR, tú recibes 15 % de comisión."
          />
          <BenefitCard
            icon={<HeartHandshake className="h-6 w-6" />}
            title="Cero fricción"
            text="Tu equipo solo entrega un QR. Nosotros hacemos el retrato IA, el hosting eterno y el envío de la placa."
          />
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section className="bg-pizarra-50 py-24">
        <div className="container-wide">
          <Reveal className="text-center mb-14">
            <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
              Cómo funciona
            </FadeP>
            <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
              Tres pasos y estás operando
            </FadeH2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number="01"
              title="Contratas tu plan"
              text="Eliges un pack o la suscripción anual. Facturamos el 100 % por adelantado con CFDI."
            />
            <Step
              number="02"
              title="Recibes tu kit"
              text="Dashboard de socio, tu subdominio, material de venta y un set de placas físicas con tu logo."
            />
            <Step
              number="03"
              title="Tu equipo regala el QR"
              text="Por cada familia, escanean el QR y completan el nicho virtual. Nosotros cuidamos el resto."
            />
          </div>
        </div>
      </section>

      {/* ============ MARGEN DE REVENTA (solo si llegan con ?lead=<token>) ============ */}
      {firstName && (
        <section className="container-wide pt-20">
          <Reveal>
            <Card className="bg-gradient-to-br from-dorado-500 to-dorado-600 border-dorado-400 shadow-dorado">
              <CardContent className="p-8 md:p-12 text-pizarra-900">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="h-16 w-16 rounded-full bg-pizarra-900/10 flex items-center justify-center shrink-0">
                    <Coins className="h-8 w-8 text-pizarra-900" />
                  </div>
                  <div className="flex-1">
                    <p className="uppercase tracking-widest text-[11px] text-pizarra-900/70 mb-2">
                      Tu margen por paquete
                    </p>
                    <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
                      {firstName} revende 30 nichos a <span className="italic">$800–$1,000</span> c/u,
                      tu costo es <span className="italic">$167</span>.
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
                      <MarginCell label="Tu inversión (Pack 30)" value="$4,999 MXN" />
                      <MarginCell label="Ingreso potencial (30 × $900)" value="$27,000 MXN" />
                      <MarginCell label="Utilidad estimada" value="~$22,000 MXN" highlight />
                    </div>
                    <p className="mt-6 text-sm text-pizarra-900/80 leading-relaxed">
                      Cada familia paga el nicho virtual + placa con tu logo — tú cobras lo mismo
                      que cobrarías por una placa física, pero con un servicio que dura para
                      siempre y te trae recomendaciones por años.
                    </p>

                    {/* CTA: ver demo del nicho virtual en vivo */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <Link
                        href={process.env.NEXT_PUBLIC_HI_DEMO_MEMORIAL_URL ?? 'https://historias-infinitas.com/m/ejemplo'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-pizarra-900 text-marfil px-5 py-2.5 text-sm font-semibold hover:bg-pizarra-800 transition-colors shadow-solemn"
                      >
                        👁 Ver un nicho virtual real
                      </Link>
                      <span className="text-xs text-pizarra-900/70">
                        (así se ve lo que entregas a cada familia — con tu logo)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </section>
      )}

      {/* ============ PLANES ============ */}
      <section id="planes" className="container-wide py-24">
        <Reveal className="text-center mb-14">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Inversión
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            Elige tu punto de entrada
          </FadeH2>
          <FadeP delay={0.1} className="text-pizarra-500 mt-4 max-w-2xl mx-auto">
            Paga por volumen o por suscripción anual. Ambos tienen garantía de
            satisfacción de 30 días.
          </FadeP>
        </Reveal>

        <PartnerPlansGrid plans={PARTNER_PLANS} />

        {/* Garantía */}
        <Reveal delay={0.2}>
          <Card className="mt-10 bg-pizarra-800 border-pizarra-700 text-marfil">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="h-14 w-14 rounded-full bg-dorado-500/15 border border-dorado-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-7 w-7 text-dorado-400" />
              </div>
              <div className="flex-1">
                <p className="uppercase tracking-widest text-[11px] text-dorado-300 mb-1">
                  Garantía de satisfacción
                </p>
                <h3 className="font-serif text-xl text-marfil mb-1">
                  30 días para probar. Si no funciona en tu operación, reembolsamos el plan completo.
                </h3>
                <p className="text-sm text-marfil/70">
                  Los nichos virtuales ya entregados a tus familias siguen activos para siempre.
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* ============ TESTIMONIO / SOCIAL PROOF ============ */}
      <section className="bg-pizarra-800 text-marfil py-24">
        <div className="container-wide">
          <Reveal className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-dorado-400 fill-dorado-400" />
              ))}
            </div>
            <FadeH2 className="font-serif italic text-2xl md:text-4xl text-marfil leading-snug">
              &ldquo;Es el cierre emocional que le faltaba a nuestro servicio. Las
              familias nos escriben meses después agradeciendo. Nunca habíamos
              tenido eso.&rdquo;
            </FadeH2>
            <FadeP delay={0.1} className="mt-8 text-dorado-300 uppercase tracking-widest text-xs">
              — Casa Funeraria testimonial · CDMX
            </FadeP>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="container-wide py-24 max-w-4xl">
        <Reveal className="text-center mb-14">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Preguntas frecuentes
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            Lo que las funerarias y clínicas nos preguntan
          </FadeH2>
        </Reveal>

        <div className="space-y-4">
          <Faq q="¿Qué pasa si supero los nichos virtuales de mi plan?">
            Puedes comprar nichos virtuales adicionales al precio preferente de socio
            ($199 MXN c/u vs. $299 MXN retail) o hacer upgrade al siguiente plan
            — te damos crédito por lo ya pagado.
          </Faq>
          <Faq q="¿Puedo cancelar el plan anual?">
            Sí, en cualquier momento. Los nichos virtuales ya entregados a tus familias
            siguen vivos para siempre. No hacemos renovación automática sin tu
            confirmación.
          </Faq>
          <Faq q="¿Se puede poner mi logo en las placas físicas?">
            Sí. En el plan Pack 30 incluimos 5 placas de acero con tu logo grabado;
            en el Profesional, 40 placas. Placas extra: $399 MXN cada una.
          </Faq>
          <Faq q="¿Ofrecen capacitación a nuestro equipo?">
            En el plan Profesional incluimos una capacitación de 60 min por
            videollamada + guión de venta para tu equipo. En los demás planes
            está disponible como servicio extra.
          </Faq>
          <Faq q="¿Cómo se factura y con qué CFDI?">
            Emitimos factura CFDI con uso &ldquo;G03 — Gastos en general&rdquo; o el que
            elijas. Requerimos Constancia de Situación Fiscal vigente.
          </Faq>
          <Faq q="¿Qué pasa con los datos de las familias?">
            Somos responsables del tratamiento conforme a la LFPDPPP. Firmamos
            DPA si lo requieres. Los datos no se comparten con terceros salvo
            los procesadores técnicos descritos en nuestro Aviso de Privacidad.
          </Faq>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="container-wide pb-24">
        <Reveal>
          <Card className="bg-dorado-500 border-dorado-400 text-pizarra-900 shadow-dorado">
            <CardContent className="p-10 md:p-14 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-pizarra-800" />
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
                Empieza con el Pack 30 y recibe las placas de regalo.
              </h2>
              <p className="max-w-2xl mx-auto text-pizarra-800/85 mb-8">
                30 nichos virtuales, 5 placas físicas con tu logo y acceso al dashboard
                de socio — por menos de lo que vale un servicio funerario estándar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-pizarra-900 hover:bg-pizarra-800 text-marfil">
                  <Link href="#planes">Contratar ahora</Link>
                </Button>
                <CalBookingButton
                  size="lg"
                  variant="outline"
                  className="border-pizarra-900 text-pizarra-900 hover:bg-pizarra-900/10"
                >
                  Agendar demo · 15 min
                </CalBookingButton>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <SiteFooter />
    </>
  );
}

/* ============ Subcomponentes ============ */

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-serif text-2xl text-dorado-300">{value}</span>
      <span className="text-marfil/60 text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}

function BenefitCard({
  icon, title, text,
}: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Reveal>
      <Card className="h-full p-6 hover:shadow-dorado transition-shadow">
        <div className="h-12 w-12 rounded-full bg-dorado-100 text-dorado-700 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-serif text-xl text-pizarra-800 mb-2">{title}</h3>
        <p className="text-pizarra-500 text-sm leading-relaxed">{text}</p>
      </Card>
    </Reveal>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <Reveal>
      <div className="bg-marfil rounded-2xl p-8 h-full border border-pizarra-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-serif text-4xl text-dorado-500">{number}</span>
          <span className="h-px flex-1 bg-pizarra-100" />
          <Award className="h-5 w-5 text-dorado-600" />
        </div>
        <h3 className="font-serif text-2xl text-pizarra-800 mb-3">{title}</h3>
        <p className="text-pizarra-500 text-sm leading-relaxed">{text}</p>
      </div>
    </Reveal>
  );
}

function MarginCell({
  label, value, highlight,
}: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={
        'rounded-xl px-4 py-3 border ' +
        (highlight
          ? 'bg-pizarra-900 border-pizarra-900 text-marfil'
          : 'bg-marfil/50 border-pizarra-900/10 text-pizarra-900')
      }
    >
      <p className={'uppercase tracking-widest text-[10px] mb-1 ' + (highlight ? 'text-dorado-300' : 'text-pizarra-900/60')}>
        {label}
      </p>
      <p className="font-serif text-xl">{value}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group bg-marfil rounded-xl border border-pizarra-100 p-5 open:shadow-solemn transition-shadow">
      <summary className="font-serif text-lg text-pizarra-800 cursor-pointer list-none flex items-center justify-between">
        {q}
        <span className="text-dorado-500 text-2xl transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm text-pizarra-600 leading-relaxed">{children}</p>
    </details>
  );
}
