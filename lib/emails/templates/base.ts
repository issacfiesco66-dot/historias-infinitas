/**
 * Plantilla base HTML para los correos transaccionales de Historias Infinitas.
 *
 * Decisiones de diseño:
 *  · Tablas anidadas + estilos inline  → máxima compatibilidad (Outlook, Gmail, Apple Mail).
 *  · Ancho fijo 600 px, escala a 100 % en móvil vía @media.
 *  · Paleta solemne: marfil #F4EFE4 (outer), #FBF9F4 (card), pizarra #1E293B (texto),
 *    dorado #B7945A (acentos). Evita gradientes/fondos ricos que los filtros
 *    anti-SPAM penalizan.
 *  · Preheader oculto para controlar el texto de preview en la bandeja.
 *  · Incluye siempre un pie con razón social + enlace a preferencias, para mantener
 *    un score de entregabilidad alto.
 */

import { APP_URL } from '../client';

export interface BaseOptions {
  /** Título del <head> y preheader (texto de preview en la bandeja). */
  previewText: string;
  /** Saludo en serif — por ejemplo "Con cariño," o "Hola, María" */
  eyebrow?: string;
  /** Título grande serif */
  title: string;
  /** Contenido HTML del cuerpo (entre el título y el CTA). */
  bodyHtml: string;
  /** Texto del botón principal. */
  ctaLabel?: string;
  /** URL absoluta del CTA. */
  ctaHref?: string;
  /** Bloque opcional post-CTA (por ejemplo upsell). */
  extraHtml?: string;
}

/* ------------------------ Fragmentos reutilizables ------------------------ */

export function button(label: string, href: string): string {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
      <tr>
        <td align="center" bgcolor="#B7945A" style="border-radius:9999px;">
          <a href="${escapeAttr(href)}"
             style="display:inline-block;padding:14px 32px;font-family:Georgia,'Cormorant Garamond',serif;font-size:15px;color:#1F242E;text-decoration:none;letter-spacing:0.02em;font-weight:600;">
             ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export function divider(): string {
  return `<div style="height:1px;background:#E5E9F0;margin:32px 0;line-height:1px;">&#xFEFF;</div>`;
}

export function hairline(): string {
  return `<div style="width:48px;height:1px;background:#C2A063;margin:0 auto;">&#xFEFF;</div>`;
}

/* ------------------------ Wrapper principal ------------------------ */

export function renderBaseTemplate(opts: BaseOptions): string {
  const {
    previewText, eyebrow, title, bodyHtml, ctaLabel, ctaHref, extraHtml,
  } = opts;

  const year = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
  <style>
    @media (max-width: 620px) {
      .hi-card    { width: 100% !important; border-radius: 0 !important; }
      .hi-padded  { padding: 32px 22px !important; }
      .hi-title   { font-size: 28px !important; line-height: 1.15 !important; }
      .hi-cta a   { display: block !important; padding: 16px 22px !important; }
    }
    a { color: #B7945A; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F4EFE4;-webkit-font-smoothing:antialiased;">
  <!-- Preheader (oculto pero visible en la vista previa de la bandeja) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;line-height:1px;color:#F4EFE4;opacity:0;">
    ${escapeHtml(previewText)}
  </div>

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#F4EFE4">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Marca -->
        <table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" class="hi-card" style="max-width:600px;margin-bottom:16px;">
          <tr>
            <td align="center" style="padding:0 8px 16px;">
              <span style="font-family:Georgia,'Cormorant Garamond',serif;font-size:22px;color:#1E293B;letter-spacing:0.02em;">
                Historias <span style="color:#B7945A;font-style:italic;">Infinitas</span>
              </span>
            </td>
          </tr>
        </table>

        <!-- Tarjeta principal -->
        <table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" bgcolor="#FBF9F4" class="hi-card" style="max-width:600px;border-radius:16px;border:1px solid #E5E9F0;">
          <tr>
            <td class="hi-padded" style="padding:48px 44px;">

              ${eyebrow ? `
              <p style="margin:0 0 14px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#B7945A;">
                ${escapeHtml(eyebrow)}
              </p>` : ''}

              <h1 class="hi-title" style="margin:0 0 20px;font-family:Georgia,'Cormorant Garamond',serif;font-size:34px;line-height:1.15;color:#1E293B;font-weight:500;">
                ${title /* permitimos itálicas ligeras en el título */}
              </h1>

              <div style="font-family:Georgia,'Cormorant Garamond',serif;font-size:17px;line-height:1.7;color:#2E3440;">
                ${bodyHtml}
              </div>

              ${ctaLabel && ctaHref ? `<div class="hi-cta">${button(ctaLabel, ctaHref)}</div>` : ''}

              ${extraHtml ?? ''}

            </td>
          </tr>
        </table>

        <!-- Pie (elegante, conciso, reduce score de SPAM) -->
        <table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" class="hi-card" style="max-width:600px;margin-top:24px;">
          <tr>
            <td align="center" style="padding:24px 16px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.7;color:#6B7280;">
              <p style="margin:0 0 4px;">Hecho con cuidado en Historias Infinitas.</p>
              <p style="margin:0 0 10px;">Preservamos memoria con tecnología e intención.</p>
              <p style="margin:0;">
                <a href="${APP_URL}" style="color:#6B7280;text-decoration:underline;">historias-infinitas.com</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/ajustes/notificaciones" style="color:#6B7280;text-decoration:underline;">Preferencias de correo</a>
              </p>
              <p style="margin:12px 0 0;color:#A7B0BE;">© ${year} Historias Infinitas</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ------------------------ Utilidades ------------------------ */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
export function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

/** Convierte párrafos Markdown-lite a HTML respetando itálicas *x*. */
export function richParagraph(text: string): string {
  return escapeHtml(text)
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 14px;">${p.replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>')}</p>`)
    .join('');
}
