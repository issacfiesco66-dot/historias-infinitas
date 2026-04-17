import type { Metadata } from 'next';
import Link from 'next/link';
import Stripe from 'stripe';
import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getPartnerPlan, type PartnerPlanId } from '@/lib/partner-plans';
import ActivateForm from './activate-form';

export const metadata: Metadata = {
  title: 'Bienvenido al Programa de Socios — Historias Infinitas',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/**
 * Pantalla de éxito del pago de partner.
 *
 * Objetivo: dar ACCESO INMEDIATO sin obligar al socio a esperar el correo.
 *
 * 1. Llega con ?session_id=cs_xxx desde Stripe.
 * 2. Buscamos partner_accounts por stripe_session_id.
 *    - Si no existe aún (webhook tardó) → reconciliamos leyendo la sesión
 *      de Stripe y creando la cuenta nosotros mismos.
 * 3. Si ya tiene user_id vinculado → redirigimos a login.
 * 4. Si no tiene user_id → renderizamos <ActivateForm> para crear contraseña
 *    al instante, sin correo.
 */
export default async function PartnerSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id?.trim();

  if (!sessionId) {
    return (
      <SuccessLayout>
        <Alert
          title="Falta la referencia de tu pago"
          text="Si llegaste aquí sin completar un pago, vuelve al programa de socios. Si ya pagaste y ves este mensaje, escríbenos a hola@historias-infinitas.com."
          cta={{ label: 'Volver al Programa', href: '/partners' }}
        />
      </SuccessLayout>
    );
  }

  const admin = createAdminClient();

  // 1. Buscar partner
  let partner = await lookupPartner(admin, sessionId);

  // 2. Reconciliar con Stripe si el webhook aún no corrió
  if (!partner) {
    const reconciled = await reconcileFromStripe(sessionId, admin);
    if ('error' in reconciled) {
      return (
        <SuccessLayout>
          <Alert
            title="Estamos procesando tu pago"
            text="Aún no confirmamos tu compra. Refresca esta página en unos segundos — si continúa, escríbenos a hola@historias-infinitas.com con este código."
            code={sessionId}
            cta={{ label: 'Refrescar', href: `/partners/exito?session_id=${sessionId}` }}
          />
        </SuccessLayout>
      );
    }
    partner = reconciled;
  }

  // 3. Si ya está vinculado a un usuario, al login
  if (partner.user_id) {
    // ¿El usuario ya tiene sesión activa? Si sí, directo al panel.
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === partner.user_id) {
      redirect('/dashboard/partner');
    }
    return (
      <SuccessLayout>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-dorado-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-dorado-600" />
            </div>
            <h1 className="font-serif text-3xl text-pizarra-800 mb-2">
              Tu acceso ya está listo
            </h1>
            <p className="text-pizarra-500 max-w-md mx-auto mb-6">
              Inicia sesión con <strong>{partner.contact_email}</strong> para entrar
              a tu panel de socio.
            </p>
            <Button asChild variant="dorado" size="lg">
              <Link href={`/login?email=${encodeURIComponent(partner.contact_email)}&next=${encodeURIComponent('/dashboard/partner')}`}>
                Iniciar sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      </SuccessLayout>
    );
  }

  // 4. Formulario inline: crear contraseña ahora + login automático
  return (
    <SuccessLayout>
      <div className="text-center mb-10">
        <div className="mx-auto w-16 h-16 rounded-full bg-dorado-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-dorado-600" />
        </div>
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
          Pago confirmado
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 leading-tight">
          Bienvenidos,{' '}
          <span className="text-gradient-dorado italic">{partner.business_name}</span>
        </h1>
        <p className="text-pizarra-500 mt-4 max-w-xl mx-auto">
          Tu pago está confirmado. Crea tu contraseña aquí abajo y entras a tu
          panel de inmediato — no hace falta esperar ningún correo.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <ActivateForm
            sessionId={sessionId}
            email={partner.contact_email}
            businessName={partner.business_name}
          />
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-pizarra-400">
        También recibirás un correo con tu enlace de respaldo por si necesitas
        volver a entrar desde otro dispositivo.
      </p>
    </SuccessLayout>
  );
}

/* ============================================================================
 *  Helpers
 * ========================================================================== */

type PartnerRow = {
  id: string;
  business_name: string;
  contact_email: string;
  user_id: string | null;
  status: string;
};

async function lookupPartner(
  admin: ReturnType<typeof createAdminClient>,
  sessionId: string,
): Promise<PartnerRow | null> {
  const { data } = await admin
    .from('partner_accounts')
    .select('id, business_name, contact_email, user_id, status')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();
  return (data as PartnerRow) ?? null;
}

async function reconcileFromStripe(
  sessionId: string,
  admin: ReturnType<typeof createAdminClient>,
): Promise<PartnerRow | { error: string }> {
  if (!process.env.STRIPE_SECRET_KEY) return { error: 'no_stripe_key' };
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { error: 'session_not_found' };
  }
  if (session.payment_status !== 'paid')      return { error: 'not_paid' };
  if (session.metadata?.kind !== 'partner_pack') return { error: 'not_partner_pack' };

  const planIdRaw    = session.metadata?.partner_plan_id as PartnerPlanId | undefined;
  const businessName = session.metadata?.business_name ?? '';
  const contactEmail = (session.metadata?.contact_email ?? session.customer_email ?? '').toLowerCase();
  const creditsIncluded = Number(session.metadata?.memorials_included ?? 0);
  const validityMonths  = Number(session.metadata?.validity_months ?? 12);

  if (!planIdRaw || !businessName || !contactEmail) return { error: 'missing_metadata' };
  let plan;
  try { plan = getPartnerPlan(planIdRaw); } catch { return { error: 'bad_plan' }; }

  // Re-check por si alguien más ya lo creó
  const existing = await lookupPartner(admin, sessionId);
  if (existing) return existing;

  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + validityMonths);

  const { data: partner } = await admin
    .from('partner_accounts')
    .insert({
      business_name:     businessName,
      contact_email:     contactEmail,
      plan_id:           plan.id,
      credits_total:     creditsIncluded,
      credits_used:      0,
      valid_until:       validUntil.toISOString(),
      stripe_session_id: sessionId,
      status:            'active',
      onboarding_token:  randomBytes(24).toString('hex'),
    })
    .select('id, business_name, contact_email, user_id, status')
    .single();

  if (!partner) {
    const again = await lookupPartner(admin, sessionId);
    if (again) return again;
    return { error: 'insert_failed' };
  }
  return partner as PartnerRow;
}

/* ============================================================================
 *  UI helpers
 * ========================================================================== */

function SuccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container-solemn py-16 md:py-24 max-w-2xl">{children}</main>
      <SiteFooter />
    </>
  );
}

function Alert({
  title, text, code, cta,
}: {
  title: string;
  text: string;
  code?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="font-serif text-2xl md:text-3xl text-pizarra-800 mb-2">{title}</h1>
        <p className="text-pizarra-500 max-w-md mx-auto mb-6">{text}</p>
        {cta && (
          <Button asChild variant="dorado">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        )}
        {code && (
          <p className="mt-6 font-mono text-[10px] text-pizarra-300">ref: {code}</p>
        )}
      </CardContent>
    </Card>
  );
}
