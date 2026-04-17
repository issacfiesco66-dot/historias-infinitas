import { renderBaseTemplate, hairline, escapeAttr, escapeHtml } from './base';
import { APP_URL } from '../client';

export interface AiReadyProps {
  name?: string | null;
  memorialName: string;
  memorialId: string;
  portraitUrl: string;
}

/**
 * Correo: "El retrato ha despertado."
 * Incluye bloque de upsell al Plan Legado (lienzo físico).
 */
export function aiReadyEmail({ name, memorialName, memorialId, portraitUrl }: AiReadyProps) {
  const firstName = (name ?? '').split(' ')[0] || null;
  const greeting = firstName ? `Hola, ${firstName}` : 'Hola';
  const subject = `El retrato de ${memorialName} está listo`;
  const memorialHref = `${APP_URL}/dashboard/memorial/${encodeURIComponent(memorialId)}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting},</p>
    <p style="margin:0 0 16px;">
      El retrato artístico de <strong>${escapeHtml(memorialName)}</strong> ha despertado.
      Nuestra Inteligencia Artificial lo ha reinterpretado con la ternura de una obra
      pintada a mano — listo para que lo revises en su santuario digital.
    </p>

    <!-- Previsualización del retrato -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${escapeAttr(memorialHref)}" style="display:inline-block;text-decoration:none;">
            <img src="${escapeAttr(portraitUrl)}"
                 alt="Retrato artístico de ${escapeAttr(memorialName)}"
                 width="360"
                 style="display:block;width:360px;max-width:100%;height:auto;border:1px solid #E2CC99;border-radius:12px;box-shadow:0 8px 24px rgba(46,52,64,0.12);" />
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:15px;text-align:center;color:#4C566A;font-style:italic;">
      “Un recuerdo nuevo, con la misma alma.”
    </p>
  `;

  // Upsell — Plan Legado (lienzo físico)
  const extraHtml = `
    <div style="margin:40px 0 0;">${hairline()}</div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px;">
      <tr>
        <td style="padding:26px;border:1px solid #E2CC99;border-radius:12px;background:#FAF5EC;">
          <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#8F7245;">
            Plan Legado
          </p>
          <h2 style="margin:0 0 10px;font-family:Georgia,'Cormorant Garamond',serif;font-size:22px;color:#1E293B;font-weight:500;line-height:1.25;">
            ¿Te gustaría este retrato en un lienzo físico?
          </h2>
          <p style="margin:0 0 18px;font-family:Georgia,'Cormorant Garamond',serif;font-size:15px;line-height:1.6;color:#4C566A;">
            Ahora puedes subir de categoría al <strong>Plan Legado</strong> e imprimirlo
            en lienzo de museo con marco dorado, entregado en tu hogar.
          </p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td bgcolor="#1E293B" style="border-radius:9999px;">
                <a href="${APP_URL}/ajustes/plan-legado"
                   style="display:inline-block;padding:12px 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#FBF9F4;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
                  Descubrir el Plan Legado
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = renderBaseTemplate({
    previewText: `El retrato de ${memorialName} ya espera en su santuario.`,
    eyebrow: 'Retrato IA · Listo para revisar',
    title: `El retrato de<br/><em style="color:#B7945A;">${escapeHtml(memorialName)}</em> ha despertado.`,
    bodyHtml,
    ctaLabel: 'Ver en el santuario',
    ctaHref: memorialHref,
    extraHtml,
  });

  const text = [
    `${greeting},`,
    '',
    `El retrato artístico de ${memorialName} está listo para su revisión en el santuario digital.`,
    '',
    `Ábrelo aquí: ${memorialHref}`,
    '',
    'PLAN LEGADO',
    '¿Te gustaría este retrato en un lienzo físico con marco dorado, entregado en tu hogar?',
    `Descubre el Plan Legado: ${APP_URL}/ajustes/plan-legado`,
    '',
    'Con cuidado, Historias Infinitas.',
  ].join('\n');

  return { subject, html, text };
}
