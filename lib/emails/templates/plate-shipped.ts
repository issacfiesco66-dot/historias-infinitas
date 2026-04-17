import { renderBaseTemplate, escapeAttr, escapeHtml, divider } from './base';
import { APP_URL } from '../client';

export interface PlateShippedProps {
  name?: string | null;
  memorialName: string;
  trackingNumber: string;
  carrier: string;             // "DHL", "FedEx", "Estafeta"
  trackingUrl?: string | null;
  estimatedDelivery?: string | null; // "15-18 de abril"
}

export function plateShippedEmail({
  name, memorialName, trackingNumber, carrier, trackingUrl, estimatedDelivery,
}: PlateShippedProps) {
  const firstName = (name ?? '').split(' ')[0] || null;
  const greeting = firstName ? `Hola, ${firstName}` : 'Hola';
  const subject = `La placa de ${memorialName} va en camino`;
  const href = trackingUrl ?? `${APP_URL}/dashboard`;

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting},</p>
    <p style="margin:0 0 16px;">
      La placa con el código único de <strong>${escapeHtml(memorialName)}</strong>
      ha salido de nuestro taller. Viaja con cuidado hacia tu hogar — lista para
      el gesto que convertirá el QR en un portal.
    </p>

    <!-- Datos de envío -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;background:#FBF9F4;border:1px solid #E5E9F0;border-radius:12px;">
      <tr>
        <td style="padding:22px 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#2E3440;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:6px 0;color:#6B7280;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;">Transportista</td>
              <td align="right" style="padding:6px 0;">${escapeHtml(carrier)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6B7280;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;">Número de guía</td>
              <td align="right" style="padding:6px 0;font-family:ui-monospace,'SF Mono',monospace;font-size:15px;color:#1E293B;">${escapeHtml(trackingNumber)}</td>
            </tr>
            ${estimatedDelivery ? `
            <tr>
              <td style="padding:6px 0;color:#6B7280;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;">Llega entre</td>
              <td align="right" style="padding:6px 0;">${escapeHtml(estimatedDelivery)}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    ${divider()}

    <h3 style="margin:0 0 10px;font-family:Georgia,'Cormorant Garamond',serif;font-size:20px;color:#1E293B;font-weight:500;">
      Cuando llegue
    </h3>
    <p style="margin:0 0 16px;">
      Elige el lugar con intención. Un árbol, una pared del recibidor, la cabecera
      de la cama, una lápida. No hay lugar equivocado — hay lugares sagrados.
    </p>
    <p style="margin:0;">
      Al escanear el QR, quien tenga el teléfono frente a sí se encontrará con su
      retrato, su voz y el Portal de Recuerdos en Realidad Aumentada.
    </p>
  `;

  const html = renderBaseTemplate({
    previewText: `Guía ${trackingNumber} · La placa viaja hacia tu hogar.`,
    eyebrow: 'En camino · Tu placa QR',
    title: `La placa de<br/><em style="color:#B7945A;">${escapeHtml(memorialName)}</em> va en camino.`,
    bodyHtml,
    ctaLabel: trackingUrl ? 'Seguir el envío' : 'Ver el memorial',
    ctaHref: href,
  });

  const text = [
    `${greeting},`,
    '',
    `La placa de ${memorialName} ha salido de nuestro taller y viaja hacia tu hogar.`,
    '',
    'ENVÍO',
    `  · Transportista: ${carrier}`,
    `  · Guía:          ${trackingNumber}`,
    estimatedDelivery ? `  · Llega entre:   ${estimatedDelivery}` : '',
    '',
    `Seguir el envío: ${href}`,
    '',
    'Cuando llegue, elige el lugar con intención. Al escanear el QR, se abrirá el memorial y el Portal de Recuerdos en Realidad Aumentada.',
    '',
    'Con cuidado, Historias Infinitas.',
  ].filter(Boolean).join('\n');

  return { subject, html, text };
}
