import { renderBaseTemplate, hairline } from './base';
import { APP_URL } from '../client';

export interface WelcomeProps {
  name?: string | null;
  email: string;
}

export function welcomeEmail({ name }: WelcomeProps) {
  const firstName = (name ?? '').split(' ')[0] || null;
  const greeting = firstName ? `Hola, ${firstName}` : 'Hola';
  const subject = 'Bienvenida al cuidado de sus memorias';

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting},</p>
    <p style="margin:0 0 16px;">
      Recibimos con cariño tu llegada a <strong>Historias Infinitas</strong>.
      A partir de hoy, somos el lugar donde los recuerdos que más importan
      encuentran un hogar sereno — al alcance de una mirada, y eternos.
    </p>
    <p style="margin:0 0 16px;">
      Cuando estés listo, podrás comenzar un tributo en tres gestos sencillos:
    </p>
    <ul style="margin:0 0 16px 20px;padding:0;">
      <li style="margin-bottom:6px;">Captura la esencia con sus fotografías y su voz.</li>
      <li style="margin-bottom:6px;">Deja que el retrato artístico despierte con Inteligencia Artificial.</li>
      <li>Recibe la placa con código único para colocar donde el corazón te pida.</li>
    </ul>
    <p style="margin:0;">No hay prisa. Este tiempo también es parte del proceso.</p>

    <div style="margin:32px 0;">${hairline()}</div>

    <p style="margin:0;font-size:15px;color:#4C566A;font-style:italic;">
      Si en algún momento necesitas compañía, respondemos personalmente a
      <a href="mailto:hola@historias-infinitas.com" style="color:#B7945A;">hola@historias-infinitas.com</a>.
    </p>
  `;

  const html = renderBaseTemplate({
    previewText: 'Tu santuario digital te espera — comienza cuando el corazón te lo pida.',
    eyebrow: 'Bienvenida · Un comienzo sereno',
    title: 'El cuidado de sus<br/><em style="color:#B7945A;">memorias empieza aquí.</em>',
    bodyHtml,
    ctaLabel: 'Entrar a mi santuario',
    ctaHref: `${APP_URL}/dashboard`,
  });

  const text = [
    `${greeting},`,
    '',
    'Recibimos con cariño tu llegada a Historias Infinitas. A partir de hoy, somos el lugar donde los recuerdos que más importan encuentran un hogar sereno.',
    '',
    'Cuando estés listo, podrás comenzar un tributo en tres gestos:',
    '  · Captura la esencia con sus fotografías y su voz.',
    '  · Deja que el retrato artístico despierte con IA.',
    '  · Recibe la placa con código único para colocar donde el corazón te pida.',
    '',
    `Entra a tu santuario: ${APP_URL}/dashboard`,
    '',
    'No hay prisa. Si necesitas compañía, respondemos en hola@historias-infinitas.com.',
    '',
    'Con cuidado, el equipo de Historias Infinitas.',
  ].join('\n');

  return { subject, html, text };
}
