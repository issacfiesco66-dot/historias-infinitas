import { getResend, EMAIL_FROM, EMAIL_REPLY_TO } from './client';
import { welcomeEmail, type WelcomeProps } from './templates/welcome';
import { aiReadyEmail, type AiReadyProps } from './templates/ai-ready';
import { paymentConfirmedEmail, type PaymentConfirmedProps } from './templates/payment-confirmed';
import { plateShippedEmail, type PlateShippedProps } from './templates/plate-shipped';
import { partnerWelcomeEmail, type PartnerWelcomeProps } from './templates/partner-welcome';

/* ============================================================================
 *  Tipos del payload de eventos (discriminados por `event`)
 * ========================================================================== */

export type NotifyEvent =
  | { event: 'welcome'; to: string; data: WelcomeProps }
  | { event: 'ai_ready'; to: string; data: AiReadyProps }
  | { event: 'payment_confirmed'; to: string; data: PaymentConfirmedProps }
  | { event: 'plate_shipped'; to: string; data: PlateShippedProps }
  | { event: 'partner_welcome'; to: string; data: PartnerWelcomeProps };

/* ============================================================================
 *  Dispatcher
 * ========================================================================== */

export async function sendTransactional(payload: NotifyEvent) {
  const { event, to, data } = payload;

  const built =
    event === 'welcome'           ? welcomeEmail(data) :
    event === 'ai_ready'          ? aiReadyEmail(data) :
    event === 'payment_confirmed' ? paymentConfirmedEmail(data) :
    event === 'plate_shipped'     ? plateShippedEmail(data) :
    event === 'partner_welcome'   ? partnerWelcomeEmail(data) :
    null;

  if (!built) throw new Error(`Evento desconocido: ${(payload as any).event}`);

  const resend = getResend();
  const res = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    reply_to: EMAIL_REPLY_TO,
    subject: built.subject,
    html: built.html,
    text: built.text,                               // mejora entregabilidad
    headers: {
      'X-Entity-Ref-ID': `hi-${event}-${Date.now()}`,
      'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://historias-infinitas.com'}/ajustes/notificaciones>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    tags: [{ name: 'event', value: event }],
  });

  if (res.error) throw new Error(res.error.message);
  return { id: res.data?.id ?? null };
}
