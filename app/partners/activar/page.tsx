import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Activar Panel de Socio — Historias Infinitas',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

/**
 * Pantalla de activación que el socio abre desde el correo de bienvenida.
 *
 * Flujo:
 *  1. Recibimos ?token=xxx.
 *  2. Buscamos la partner_account correspondiente.
 *  3. Si el token es válido:
 *      - Si el usuario NO está logueado → invitamos a registrarse con el
 *        email de la cuenta partner (el trigger `link_partner_on_signup`
 *        en la BD los vincula automáticamente al completarse el signup).
 *      - Si SÍ está logueado con ese email → ya quedó vinculado; redirige
 *        a /dashboard/partner.
 *      - Si está logueado con OTRO email → le pedimos cerrar sesión.
 */
export default async function ActivarPartnerPage({
  searchParams,
}: { searchParams: { token?: string } }) {
  const token = searchParams.token?.trim();

  if (!token) {
    return (
      <ActivarLayout>
        <Alert
          title="Falta el token de activación"
          text="El enlace que usaste no incluye el token. Revisa el correo de bienvenida y abre el botón “Activar mi panel de socio”."
        />
      </ActivarLayout>
    );
  }

  const admin = createAdminClient();
  const { data: partner } = await admin
    .from('partner_accounts')
    .select('id, business_name, contact_email, user_id, status')
    .eq('onboarding_token', token)
    .maybeSingle();

  if (!partner) {
    return (
      <ActivarLayout>
        <Alert
          title="Token inválido o ya usado"
          text="No encontramos una cuenta partner para este enlace. Si crees que es un error escríbenos a hola@historias-infinitas.com."
        />
      </ActivarLayout>
    );
  }

  if (partner.status !== 'active') {
    return (
      <ActivarLayout>
        <Alert
          title="Cuenta no activa"
          text="Tu cuenta partner no está activa. Escríbenos a hola@historias-infinitas.com para revisar el estado."
        />
      </ActivarLayout>
    );
  }

  // ¿El usuario está autenticado?
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Caso A: partner ya está vinculado a un user_id — redirige al panel
  if (partner.user_id) {
    if (user && user.id === partner.user_id) {
      redirect('/dashboard/partner');
    }
    return (
      <ActivarLayout>
        <Alert
          title="Esta cuenta ya está activada"
          text={`Tu panel de socio para ${partner.business_name} ya está listo. Inicia sesión con ${partner.contact_email}.`}
          cta={{ label: 'Ir a iniciar sesión', href: `/login?next=${encodeURIComponent('/dashboard/partner')}` }}
        />
      </ActivarLayout>
    );
  }

  // Caso B: el usuario está autenticado con OTRO email
  if (user && user.email && user.email.toLowerCase() !== partner.contact_email) {
    return (
      <ActivarLayout>
        <Alert
          title="Sesión con otro correo"
          text={`Estás autenticado con ${user.email}, pero esta cuenta partner corresponde a ${partner.contact_email}. Cierra sesión y vuelve a entrar con ese correo.`}
          cta={{ label: 'Cerrar sesión', href: `/auth/signout?next=${encodeURIComponent(`/partners/activar?token=${token}`)}` }}
        />
      </ActivarLayout>
    );
  }

  // Caso C: el usuario está autenticado con el email correcto — el trigger
  // link_partner_on_signup ya hizo su trabajo al crearse la cuenta. Si el
  // partner_account aún tiene user_id null, lo vinculamos aquí manualmente.
  if (user && user.email?.toLowerCase() === partner.contact_email) {
    await admin
      .from('partner_accounts')
      .update({ user_id: user.id, onboarded_at: new Date().toISOString() })
      .eq('id', partner.id);
    redirect('/dashboard/partner');
  }

  // Caso D: no está autenticado — invitamos a registrarse
  const registerHref = `/register?email=${encodeURIComponent(partner.contact_email)}&next=${encodeURIComponent(`/partners/activar?token=${token}`)}`;
  const loginHref    = `/login?email=${encodeURIComponent(partner.contact_email)}&next=${encodeURIComponent(`/partners/activar?token=${token}`)}`;

  return (
    <ActivarLayout>
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-dorado-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-dorado-600" />
          </div>
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-2">
            Activar panel
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-pizarra-800 mb-2">
            Bienvenidos, <span className="text-gradient-dorado italic">{partner.business_name}</span>
          </h1>
          <p className="text-pizarra-500 max-w-md mx-auto mb-6">
            Crea tu acceso con el correo{' '}
            <strong className="text-pizarra-700">{partner.contact_email}</strong> — con esa cuenta entrarás a tu panel de socio.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="dorado" size="lg">
              <Link href={registerHref}>Crear mi contraseña</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={loginHref}>Ya tengo cuenta, iniciar sesión</Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-pizarra-400">
            Al crear cuenta con <strong>{partner.contact_email}</strong>, tu
            acceso de socio queda vinculado automáticamente.
          </p>
        </CardContent>
      </Card>
    </ActivarLayout>
  );
}

/* ============================ Helpers ============================ */

function ActivarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container-solemn py-16 md:py-24 max-w-2xl">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

function Alert({
  title, text, cta,
}: { title: string; text: string; cta?: { label: string; href: string } }) {
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
      </CardContent>
    </Card>
  );
}
