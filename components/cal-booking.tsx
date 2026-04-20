'use client';

import Script from 'next/script';
import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Cal.com — popup embed para el funnel B2B.
 *
 * Reemplaza el viejo flujo "Hablar con ventas → /contacto → form → void"
 * (fuga #2 del funnel) con un calendario en popup que permite al director
 * funerario / veterinario agendar demo en 15 segundos.
 *
 * Uso:
 *   // En la página que necesita el botón:
 *   <CalBookingScript />
 *   <CalBookingButton>Agendar demo</CalBookingButton>
 *
 * El script se carga una sola vez por navegación (afterInteractive). El
 * botón simplemente lleva los data-attrs que el SDK de Cal intercepta.
 */

/** Username/slug del workspace de Historias Infinitas en Cal.com */
export const CAL_USER = 'historias-infinitas-f2rpjw';

/* ============================================================================
 *  Script loader — inyecta el SDK de Cal y configura el namespace.
 * ========================================================================== */

export function CalBookingScript() {
  return (
    <Script id="cal-embed-init" strategy="afterInteractive">
      {`
        (function (C, A, L) {
          let p = function (a, ar) { a.q.push(ar); };
          let d = C.document;
          C.Cal = C.Cal || function () {
            let cal = C.Cal;
            let ar = arguments;
            if (!cal.loaded) {
              cal.ns = {};
              cal.q = cal.q || [];
              d.head.appendChild(d.createElement("script")).src = A;
              cal.loaded = true;
            }
            if (ar[0] === L) {
              const api = function () { p(api, arguments); };
              const namespace = ar[1];
              api.q = api.q || [];
              if (typeof namespace === "string") {
                cal.ns[namespace] = cal.ns[namespace] || api;
                p(cal.ns[namespace], ar);
                p(cal, ["initNamespace", namespace]);
              } else {
                p(cal, ar);
              }
              return;
            }
            p(cal, ar);
          };
        })(window, "https://app.cal.com/embed/embed.js", "init");

        Cal("init", "${CAL_USER}", { origin: "https://cal.com" });

        Cal.ns["${CAL_USER}"]("ui", {
          hideEventTypeDetails: false,
          layout: "month_view",
          theme: "light",
          cssVarsPerTheme: {
            light: {
              "cal-brand": "#B7945A"
            }
          }
        });
      `}
    </Script>
  );
}

/* ============================================================================
 *  Button — abre el popup al hacer click.
 *
 *  Usa nuestro <Button> para mantener la misma estética (dorado / outline /
 *  ghost). Los data-attrs son interceptados globalmente por el SDK de Cal.
 * ========================================================================== */

type CalButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

export const CalBookingButton = forwardRef<HTMLButtonElement, CalButtonProps>(
  function CalBookingButton({ children, ...rest }, ref) {
    return (
      <Button
        ref={ref}
        type="button"
        data-cal-link={CAL_USER}
        data-cal-namespace={CAL_USER}
        data-cal-config='{"layout":"month_view"}'
        {...rest}
      >
        {children}
      </Button>
    );
  },
);
