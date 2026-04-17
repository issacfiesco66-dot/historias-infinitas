import { Resend } from 'resend';

let _resend: Resend | null = null;

/** Cliente Resend lazy-singleton (solo servidor). */
export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY no está configurada');
    _resend = new Resend(key);
  }
  return _resend;
}

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Historias Infinitas <hola@historias-infinitas.com>';
export const EMAIL_REPLY_TO =
  process.env.EMAIL_REPLY_TO ?? 'hola@historias-infinitas.com';

export const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com';
