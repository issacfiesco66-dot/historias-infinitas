import { renderBaseTemplate, divider, escapeHtml } from './base';
import { APP_URL } from '../client';

export interface PaymentConfirmedProps {
  name?: string | null;
  orderNumber: string;
  memorialName: string;
  planLabel: string;        // "Plan Legado", "Plan Esencial"
  amount: string;           // "$49.00 USD"
  memorialId?: string | null;
}

export function paymentConfirmedEmail({
  name, orderNumber, memorialName, planLabel, amount, memorialId,
}: PaymentConfirmedProps) {
  const firstName = (name ?? '').split(' ')[0] || null;
  const greeting = firstName ? `Hola, ${firstName}` : 'Hola';
  const subject = `Orden confirmada · ${orderNumber} — Historias Infinitas`;
  const memorialHref = memorialId
    ? `${APP_URL}/dashboard/memorial/${encodeURIComponent(memorialId)}`
    : `${APP_URL}/dashboard`;

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting},</p>
    <p style="margin:0 0 16px;">
      Hemos recibido tu orden con gratitud. Queremos acompañar este gesto con la
      misma intención con la que guardamos un recuerdo importante.
    </p>

    <!-- Resumen -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;background:#F4EFE4;border-radius:12px;">
      <tr>
        <td style="padding:22px 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#2E3440;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:6px 0;color:#6B7280;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;">Orden</td>
              <td align="right" style="padding:6px 0;font-family:ui-monospace,'SF Mono',monospace;">${escapeHtml(orderNumber)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6B7280;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;">Memorial</td>
              <td align="right" style="padding:6px 0;font-family:Georgia,serif;font-size:16px;">${escapeHtml(memorialName)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6B7280;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;">Plan</td>
              <td align="right" style="padding:6px 0;">${escapeHtml(planLabel)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6B7280;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;">Total</td>
              <td align="right" style="padding:6px 0;font-weight:600;color:#1E293B;">${escapeHtml(amount)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${divider()}

    <h3 style="margin:0 0 12px;font-family:Georgia,'Cormorant Garamond',serif;font-size:20px;color:#1E293B;font-weight:500;">
      Lo que sigue
    </h3>
    <ol style="margin:0 0 16px 20px;padding:0;font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#2E3440;">
      <li style="margin-bottom:8px;">
        <strong>Confirmamos el diseño.</strong> Puedes seguir editando el memorial
        hasta que lo sientas completo.
      </li>
      <li style="margin-bottom:8px;">
        <strong>Imprimimos la placa con QR único.</strong> Una pieza en aleación noble,
        lista para exterior o interior.
      </li>
      <li>
        <strong>Te avisamos cuando salga hacia tu hogar</strong> con el número de guía
        para que puedas seguirla.
      </li>
    </ol>
  `;

  const html = renderBaseTemplate({
    previewText: `Tu orden ${orderNumber} está confirmada. Lo siguiente: imprimir la placa con QR.`,
    eyebrow: 'Orden confirmada · Con gratitud',
    title: `Gracias por este gesto,<br/><em style="color:#B7945A;">${escapeHtml(memorialName)}</em> lo merece.`,
    bodyHtml,
    ctaLabel: 'Ver el memorial',
    ctaHref: memorialHref,
  });

  const text = [
    `${greeting},`,
    '',
    `Hemos recibido tu orden ${orderNumber}. Gracias por este gesto.`,
    '',
    'RESUMEN',
    `  · Memorial: ${memorialName}`,
    `  · Plan:     ${planLabel}`,
    `  · Total:    ${amount}`,
    '',
    'LO QUE SIGUE',
    '  1. Confirmamos el diseño (puedes seguir editando).',
    '  2. Imprimimos la placa con QR único.',
    '  3. Te avisamos con el número de guía cuando salga hacia tu hogar.',
    '',
    `Tu memorial: ${memorialHref}`,
    '',
    'Con cuidado, Historias Infinitas.',
  ].join('\n');

  return { subject, html, text };
}
