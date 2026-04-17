import { renderBaseTemplate, hairline } from './base';
import { APP_URL } from '../client';

export interface PartnerWelcomeProps {
  businessName: string;
  contactEmail: string;
  planName: string;
  creditsTotal: number;
  validUntil: string | null;        // ISO o texto ya formateado
  onboardingUrl: string;             // link con token de activación
  hasShipping: boolean;              // si incluye placas físicas
}

export function partnerWelcomeEmail(props: PartnerWelcomeProps) {
  const {
    businessName, planName, creditsTotal, validUntil,
    onboardingUrl, hasShipping,
  } = props;

  const subject = `${businessName}, bienvenidos al Programa de Socios`;

  const bodyHtml = `
    <p style="margin:0 0 16px;">Equipo de <strong>${escapeHtml(businessName)}</strong>,</p>

    <p style="margin:0 0 16px;">
      Gracias por sumarse a <strong>Historias Infinitas</strong>. Acabamos de
      activar su plan <strong>${escapeHtml(planName)}</strong> con
      <strong>${creditsTotal} memoriales incluidos</strong>${validUntil ? `, vigentes hasta el <strong>${escapeHtml(validUntil)}</strong>` : ''}.
    </p>

    <p style="margin:0 0 16px;">
      Para empezar a regalar memoriales a sus familias, activen su panel de
      socios. Tarda menos de un minuto:
    </p>

    <ol style="margin:0 0 16px 20px;padding:0;">
      <li style="margin-bottom:6px;">Haga clic en el botón de abajo.</li>
      <li style="margin-bottom:6px;">Cree su contraseña con el correo <strong>${escapeHtml(props.contactEmail)}</strong>.</li>
      <li style="margin-bottom:6px;">Suba el logotipo de su empresa desde el panel (aparecerá en cada memorial que entreguen).</li>
      <li>Comparta el link o QR único de su panel con su equipo.</li>
    </ol>

    ${hasShipping ? `
    <div style="margin:24px 0;padding:16px 20px;background:#FBF9F4;border:1px solid #F1E6CC;border-radius:8px;">
      <p style="margin:0;font-size:14px;color:#3B4252;">
        <strong>Placas físicas incluidas:</strong> en las próximas 24 h hábiles
        les contactaremos para confirmar el domicilio de envío y el arte del
        grabado con su logotipo.
      </p>
    </div>
    ` : ''}

    <div style="margin:32px 0;">${hairline()}</div>

    <p style="margin:0 0 10px;font-weight:600;color:#2E3440;">Lo que acompaña a su plan:</p>
    <ul style="margin:0 0 16px 20px;padding:0;font-size:14px;color:#4C566A;">
      <li style="margin-bottom:4px;">Panel de socios con contador de créditos y memoriales.</li>
      <li style="margin-bottom:4px;">Logo de su empresa en cada memorial que entreguen.</li>
      <li style="margin-bottom:4px;">15 % de comisión por cada upgrade al plan Eterno.</li>
      <li>Onboarding de 20 min con el equipo — agendaremos por aparte.</li>
    </ul>

    <p style="margin:0;font-size:14px;color:#4C566A;font-style:italic;">
      Cualquier duda, respondemos personalmente en
      <a href="mailto:hola@historias-infinitas.com" style="color:#B7945A;">hola@historias-infinitas.com</a>.
    </p>
  `;

  const html = renderBaseTemplate({
    previewText: `${businessName}, su panel de socios está listo para activarse.`,
    eyebrow: 'Programa de Socios · Bienvenida',
    title: `Bienvenidos,<br/><em style="color:#B7945A;">${escapeHtml(businessName)}</em>`,
    bodyHtml,
    ctaLabel: 'Activar mi panel de socio',
    ctaHref: onboardingUrl,
  });

  const text = [
    `Equipo de ${businessName},`,
    '',
    `Acabamos de activar su plan ${planName} con ${creditsTotal} memoriales incluidos${validUntil ? `, vigentes hasta el ${validUntil}` : ''}.`,
    '',
    'Para activar su panel de socios:',
    `  ${onboardingUrl}`,
    '',
    `Correo del contacto: ${props.contactEmail}`,
    '',
    hasShipping ? 'Placas físicas: en las próximas 24 h hábiles les contactaremos para confirmar domicilio y arte del grabado.\n' : '',
    'Lo que acompaña a su plan:',
    '  · Panel de socios con contador de créditos.',
    '  · Logo de su empresa en cada memorial.',
    '  · 15 % de comisión por upgrades al plan Eterno.',
    '  · Onboarding de 20 min con nuestro equipo.',
    '',
    'Cualquier duda: hola@historias-infinitas.com',
    '',
    'Con cuidado, el equipo de Historias Infinitas.',
  ].filter(Boolean).join('\n');

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
