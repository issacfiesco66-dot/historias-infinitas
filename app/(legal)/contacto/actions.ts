'use server';

import { getResend, EMAIL_FROM } from '@/lib/emails/client';

export interface ContactResult {
  ok: boolean;
  error?: string;
}

const MAX_NAME = 120;
const MAX_EMAIL = 240;
const MAX_SUBJECT = 160;
const MAX_MESSAGE = 3000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server action — envía el formulario de contacto al buzón de soporte.
 * Incluye anti-spam básico (honeypot + límites de longitud).
 */
export async function sendContactForm(form: FormData): Promise<ContactResult> {
  try {
    // Honeypot: si el campo oculto está lleno, asumimos bot.
    if ((form.get('website') as string | null)?.trim()) {
      return { ok: true }; // respondemos OK para no delatar la heurística
    }

    const name    = ((form.get('name')    as string | null) ?? '').trim().slice(0, MAX_NAME);
    const email   = ((form.get('email')   as string | null) ?? '').trim().slice(0, MAX_EMAIL);
    const subject = ((form.get('subject') as string | null) ?? '').trim().slice(0, MAX_SUBJECT);
    const message = ((form.get('message') as string | null) ?? '').trim().slice(0, MAX_MESSAGE);
    const consent = form.get('consent') === 'on';

    if (!name || !email || !message) {
      return { ok: false, error: 'Completa nombre, correo y mensaje.' };
    }
    if (!EMAIL_RE.test(email)) {
      return { ok: false, error: 'El correo no tiene un formato válido.' };
    }
    if (!consent) {
      return {
        ok: false,
        error: 'Debes aceptar el Aviso de Privacidad para enviar el formulario.',
      };
    }

    const resend = getResend();
    const inbox = process.env.CONTACT_INBOX || 'hola@historias-infinitas.com';

    const html = `
      <p><strong>De:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p><strong>Asunto:</strong> ${escapeHtml(subject) || '(sin asunto)'}</p>
      <hr />
      <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.55">${escapeHtml(message)}</pre>
    `;

    const text = [
      `De: ${name} <${email}>`,
      `Asunto: ${subject || '(sin asunto)'}`,
      '',
      message,
    ].join('\n');

    const res = await resend.emails.send({
      from: EMAIL_FROM,
      to: inbox,
      reply_to: email,
      subject: `[Contacto] ${subject || name}`,
      html,
      text,
      tags: [{ name: 'event', value: 'contact_form' }],
    });
    if (res.error) throw new Error(res.error.message);

    return { ok: true };
  } catch (err: any) {
    console.error('[contacto]', err);
    return { ok: false, error: 'No pudimos enviar tu mensaje. Intenta de nuevo en un momento.' };
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
