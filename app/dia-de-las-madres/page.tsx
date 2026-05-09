import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart, Sparkles, ScanLine, Gift, Flower2, Flower, Clock, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Reveal, FadeH1, FadeH2, FadeP } from '@/components/viva-images';

// Día de las Madres en México: 10 de mayo (fijo, no varía).
// Revalidamos cada 6 horas para que el contador quede razonablemente vigente
// sin pegarle a Supabase en cada request.
export const revalidate = 21600;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Regalo del Día de las Madres 2026 · Tributo Digital con QR y Retrato IA',
  description:
    'El regalo más original para mamá este 10 de mayo: una página digital permanente con su retrato hecho con IA, su biografía y un QR único para que ella misma lo abra desde su celular. Empieza gratis — pagas solo si te gusta cómo queda.',
  alternates: {
    canonical: '/dia-de-las-madres',
    languages: {
      'es-MX': '/dia-de-las-madres',
      'x-default': '/dia-de-las-madres',
    },
  },
  keywords: [
    'regalo dia de las madres',
    'regalo original dia de las madres',
    'regalo 10 de mayo',
    'tributo digital para mamá',
    'homenaje a mamá en vida',
    'libro digital de mamá',
    'homenaje dia de las madres',
    'qr para mamá',
    'retrato IA para mamá',
    'regalo personalizado mamá México',
  ],
  openGraph: {
    title: 'Para mamá. Un regalo que dura para siempre — 10 de mayo 2026',
    description:
      'Una página dedicada a mamá: su retrato hecho con IA, su historia y un QR único que ella abre desde su celular. Un regalo que dura más que un ramo de flores.',
    url: '/dia-de-las-madres',
    type: 'article',
    images: [{ url: '/images/og-dia-madres.png', width: 1200, height: 630 }],
  },
};

// 10 de mayo 2026 en hora CDMX (UTC-6, sin DST en México desde 2022).
// Construimos en UTC para evitar que el servidor en Vercel lea el TZ local.
const MOTHERS_DAY = new Date(Date.UTC(2026, 4, 10, 6, 0, 0)); // 10-may 00:00 CDMX

function daysUntilMothersDay(): number {
  const now = new Date();
  const diffMs = MOTHERS_DAY.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

const FAQS = [
  {
    q: '¿Llega antes del 10 de mayo si empiezo hoy?',
    a: 'Sí — la versión digital queda lista el mismo día. Subes las fotos, escribes la biografía, eliges el retrato y al terminar tienes el QR listo para imprimir. Si quieres además una placa física grabada con láser para enmarcar, esa requiere 5 a 7 días hábiles de envío; te recomendamos imprimir el QR en la tarjeta para el 10 de mayo y la placa llega después como segunda parte del regalo.',
  },
  {
    q: '¿Qué le va a parecer a mamá cuando lo abra?',
    a: 'Va a llorar de bonito. Cuando escanea el QR con su celular ve una página completa dedicada a ella: su retrato pintado al óleo (o acuarela, o sepia — tú eliges), sus fotos organizadas con fechas y lugares, su biografía contando quién es, y un espacio para que sus hijos, nietos y hermanos le dejen mensajes. Es el opuesto del ramo que se marchita en una semana.',
  },
  {
    q: '¿Cómo se lo entrego el 10 de mayo?',
    a: 'Te enviamos un PDF con el QR y una tarjeta diseñada para imprimir. La doblas, escribes tu mensaje a mano, y se la das junto con flores o como regalo principal. Cuando ella escanea el QR con su celular, abre su página personal con todo dedicado a ella.',
  },
  {
    q: '¿Mamá sabe usar tecnología? ¿Le va a costar trabajo?',
    a: 'No tiene que aprender nada. Solo abre la cámara de su celular, apunta al QR de la tarjeta, y la página se abre sola — como cualquier menú de restaurante. Funciona en cualquier teléfono (iPhone o Android). Si ella quiere, después puede agregar más fotos o textos; si no, queda perfecta tal cual la armaste tú.',
  },
  {
    q: '¿Y si mamá ya no está con nosotros?',
    a: 'Muchas familias también lo usan para recordar a mamá el 10 de mayo cuando ella ya no está físicamente. El producto es el mismo — una página permanente con su historia, sus fotos y su retrato — y se convierte en un lugar al que la familia entera puede entrar a visitarla y dejarle mensajes cualquier día.',
  },
  {
    q: '¿Cuánto dura la página de mamá?',
    a: 'Para siempre. El hosting es permanente — sin renovación anual, sin cuotas escondidas. Pagas una vez y queda en línea de manera permanente, con respaldos automáticos. Si Historias Infinitas dejara de operar, te entregamos el contenido completo para que lo migres libremente.',
  },
  {
    q: '¿Necesito saber de tecnología para armarlo yo?',
    a: 'No. El proceso completo toma 10-15 minutos: subes 3-10 fotos, escribes la biografía (te damos preguntas guía), eliges el estilo del retrato y listo. Si te atoras, te ayudamos por WhatsApp.',
  },
];

export default function DiaDeLasMadresPage() {
  const days = daysUntilMothersDay();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Regalo del Día de las Madres — Historias Infinitas',
    description: metadata.description,
    inLanguage: 'es-MX',
    url: `${SITE_URL}/dia-de-las-madres`,
    about: {
      '@type': 'Event',
      name: 'Día de las Madres en México',
      startDate: '2026-05-10',
      endDate: '2026-05-10',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'Country', name: 'México' },
    },
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Día de las Madres', item: `${SITE_URL}/dia-de-las-madres` },
    ],
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ============ HERO — paleta cálida (regalo + memorial) ============ */}
      <section className="relative overflow-hidden bg-marfil-100 text-pizarra-800">
        {/* Gradiente cálido: durazno → crema → blush. Cubre los dos intents:
            celebración (rosa cálido) y memoria suave (dorado). */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 15% 20%, rgba(255,228,210,0.85), transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(255,210,225,0.65), transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(247,237,213,0.50), transparent 70%)',
          }}
        />

        {/* Pétalos decorativos esquinas — sutiles, no compiten con el copy */}
        <Flower className="hidden md:block absolute top-12 left-8 h-12 w-12 text-rose-300/40 rotate-12" strokeWidth={1} aria-hidden />
        <Flower2 className="hidden md:block absolute top-32 right-1/3 h-8 w-8 text-dorado-300/50 -rotate-6" strokeWidth={1} aria-hidden />
        <Flower className="hidden md:block absolute bottom-16 left-1/4 h-10 w-10 text-rose-200/50 rotate-45" strokeWidth={1} aria-hidden />

        <div className="container-wide relative py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <FadeP className="uppercase tracking-[0.3em] text-[11px] md:text-sm text-rose-700 mb-5 flex items-center gap-3 font-medium">
              <Flower2 className="h-4 w-4" />
              10 de mayo · Día de las Madres
            </FadeP>
            <FadeH1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-pizarra-800">
              El regalo que mamá{' '}
              <span className="text-gradient-dorado italic">no esperaba.</span>
            </FadeH1>
            <FadeP delay={0.1} className="text-pizarra-600 mt-6 max-w-xl text-lg md:text-xl leading-relaxed">
              Una página digital dedicada solo a ella: su retrato hecho con IA, sus
              fotos, su historia y un QR único que abre desde su celular. Un homenaje
              que dura más que un ramo de flores.
            </FadeP>

            {days > 0 && (
              <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-rose-100/80 border border-rose-300/50 px-5 py-2.5 shadow-sm">
                <Clock className="h-4 w-4 text-rose-600" />
                <span className="text-rose-800 text-sm font-medium">
                  {days === 1
                    ? 'Mañana es el Día de las Madres'
                    : `Quedan ${days} días para el 10 de mayo`}
                </span>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="dorado" size="lg">
                <Link href="/empieza?type=ser_querido">
                  Crear el homenaje de mamá
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-pizarra-300 text-pizarra-700 hover:bg-marfil-200"
              >
                <Link href="#como-funciona">Cómo funciona</Link>
              </Button>
            </div>

            <FadeP delay={0.2} className="text-pizarra-500 text-sm mt-6">
              Empieza gratis · Ve cómo queda antes de decidir · Listo en 15 minutos
            </FadeP>
          </Reveal>

          {/* Composición floral: ramo de peonías estilizado en SVG.
              Reemplaza la foto de pareja anciana — el contexto es regalo,
              no funeral. */}
          <Reveal delay={0.15} className="hidden md:block">
            <div className="relative aspect-square max-w-md ml-auto">
              <FloralBouquet />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ POR QUÉ ESTE REGALO ============ */}
      <section className="container-wide py-24">
        <Reveal className="text-center mb-12">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            10 de mayo · Un homenaje en vida
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800 max-w-3xl mx-auto">
            Lo que las flores no pueden hacer.
          </FadeH2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Reveal>
            <Card className="h-full p-7 hover:shadow-dorado transition-shadow">
              <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl text-pizarra-800 mb-2">
                La hace sentir vista
              </h3>
              <p className="text-pizarra-600 text-sm leading-relaxed">
                Mamá abre su QR y ve su vida entera ordenada con cariño:
                sus fotos, sus frases, sus viajes, lo que la hace ella.
                Es decirle "te conozco" sin tener que decirlo.
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="h-full p-7 hover:shadow-dorado transition-shadow border-dorado-300/40">
              <div className="h-12 w-12 rounded-full bg-dorado-100 text-dorado-700 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl text-pizarra-800 mb-2">
                Le devuelve sus fotos viejas
              </h3>
              <p className="text-pizarra-600 text-sm leading-relaxed">
                Esa foto borrosa de cuando era joven, la del bautizo, la de
                la boda — las restauramos automáticamente y le pintamos un
                retrato al óleo. Va a verse a sí misma como nunca se vio.
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.2}>
            <Card className="h-full p-7 hover:shadow-dorado transition-shadow">
              <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl text-pizarra-800 mb-2">
                Dura más que un ramo
              </h3>
              <p className="text-pizarra-600 text-sm leading-relaxed">
                Las flores se marchitan en una semana. Esto queda en su
                celular para siempre, y el 10 de mayo del próximo año va a
                seguir ahí — con todo lo que hayan agregado los nietos.
              </p>
            </Card>
          </Reveal>
        </div>

        <Reveal className="text-center mt-10 max-w-2xl mx-auto">
          <FadeP className="text-pizarra-500 italic">
            «Le di el QR el 10 de mayo. Lloró cuando vio sus fotos organizadas
            con su retrato al óleo. Es lo único que ha guardado en su mesa de
            noche.» — Andrea M., Guadalajara
          </FadeP>
        </Reveal>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="bg-marfil py-24 scroll-mt-20">
        <div className="container-wide">
          <Reveal className="text-center mb-14">
            <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
              Tres pasos · 15 minutos
            </FadeP>
            <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
              Cómo funciona
            </FadeH2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                n: '01',
                icon: Sparkles,
                title: 'Sube sus fotos',
                text: 'De 3 a 10 fotos. Las viejas también — las restauramos automáticamente. Te ayudamos a redactar la biografía con preguntas guía.',
              },
              {
                n: '02',
                icon: Heart,
                title: 'Elige su retrato',
                text: 'La IA genera 3 retratos artísticos en óleo, acuarela o sepia preservando sus rasgos reales. Eliges el que más se le parezca.',
              },
              {
                n: '03',
                icon: ScanLine,
                title: 'Imprime el QR',
                text: 'Te enviamos el PDF con la tarjeta lista. La doblas, escribes tu mensaje, y se la das el 10 de mayo. Al escanear, ella abre su página.',
              },
            ].map((s) => (
              <Reveal key={s.n}>
                <div className="text-center">
                  <div className="text-dorado-500 font-serif text-5xl mb-3">{s.n}</div>
                  <div className="h-14 w-14 rounded-full bg-dorado-100 text-dorado-700 flex items-center justify-center mb-4 mx-auto">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif text-xl text-pizarra-800 mb-2">{s.title}</h3>
                  <p className="text-pizarra-500 text-sm leading-relaxed">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EMPIEZA GRATIS — ARMA Y VE CÓMO QUEDA ============ */}
      <section className="container-wide py-24">
        <Reveal className="text-center max-w-3xl mx-auto mb-10">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Empieza gratis
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800 mb-5">
            Arma su homenaje. Decide después.
          </FadeH2>
          <FadeP className="text-pizarra-600 text-lg leading-relaxed">
            No pagas para empezar. Subes sus fotos, escribes su historia, eliges
            su retrato — y ves la página terminada antes de cualquier
            compromiso. Si te emociona cómo queda, ahí decides cómo
            quieres entregárselo a mamá.
          </FadeP>
        </Reveal>

        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Sparkles, label: 'Empiezas sin tarjeta' },
            { icon: Heart, label: 'Ves cómo queda primero' },
            { icon: ScanLine, label: 'Pagas solo si te enamora' },
          ].map((item) => (
            <Reveal key={item.label}>
              <div className="flex items-center gap-3 bg-marfil rounded-xl p-4 border border-pizarra-100">
                <div className="h-10 w-10 rounded-full bg-dorado-100 text-dorado-700 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-pizarra-700 text-sm font-medium">{item.label}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center">
          <Button asChild variant="dorado" size="lg">
            <Link href="/empieza?type=ser_querido">
              Crear el homenaje de mamá
            </Link>
          </Button>
          <FadeP className="text-pizarra-500 text-sm mt-4">
            Sin tarjeta · 15 minutos · Listo para el 10 de mayo
          </FadeP>
        </Reveal>
      </section>

      {/* ============ TESTIMONIO ============ */}
      <section className="bg-pizarra-800 text-marfil py-20">
        <div className="container-wide max-w-3xl text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-dorado-400 fill-dorado-400" />
              ))}
            </div>
            <FadeH2 className="font-serif italic text-2xl md:text-4xl text-marfil leading-snug">
              &ldquo;Llevaba años buscando cómo regalarle a mi mamá algo que no
              fuera otro pañuelo o más flores. Esto le dolió de bonito.
              No le importaron las flores ese 10 de mayo.&rdquo;
            </FadeH2>
            <FadeP className="mt-6 text-dorado-300 uppercase tracking-widest text-xs">
              — Ana L., CDMX · cliente desde 2025
            </FadeP>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="container-wide py-24 max-w-3xl">
        <Reveal className="text-center mb-10">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Preguntas frecuentes
          </FadeP>
          <FadeH2 className="font-serif text-3xl md:text-4xl text-pizarra-800">
            Lo que más nos preguntan estos días
          </FadeH2>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group bg-marfil rounded-xl border border-pizarra-100 p-5 open:shadow-solemn transition-shadow"
            >
              <summary className="font-serif text-lg text-pizarra-800 cursor-pointer list-none flex items-center justify-between gap-4">
                {f.q}
                <span className="text-dorado-500 text-2xl transition-transform group-open:rotate-45 flex-shrink-0">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-pizarra-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="container-wide pb-24">
        <Reveal>
          <Card className="bg-dorado-500 border-dorado-400 text-pizarra-900 shadow-dorado">
            <CardContent className="p-10 md:p-14 text-center">
              <Flower2 className="h-10 w-10 mx-auto mb-4 text-pizarra-800" />
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
                {days > 0
                  ? days === 1
                    ? 'El 10 de mayo es mañana.'
                    : `Faltan ${days} días para el 10 de mayo.`
                  : '¡Feliz Día de las Madres!'}
              </h2>
              <p className="max-w-2xl mx-auto text-pizarra-800/85 mb-8 text-lg">
                Su página queda lista en minutos. El QR lo descargas e imprimes
                hoy mismo. Empieza gratis — decides cómo entregárselo cuando veas el resultado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-pizarra-900 hover:bg-pizarra-800 text-marfil"
                >
                  <Link href="/empieza?type=ser_querido">
                    Crear el homenaje de mamá
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <SiteFooter />
    </>
  );
}

/* ============================================================================
 *  FLORAL BOUQUET — SVG decorativo del hero
 *  Ramo de peonías estilizado: 3 blooms + tallos + hojas. Dorado + rose.
 *  Contexto: regalo del 10 de mayo, no funeral — paleta cálida deliberada.
 * ========================================================================== */
function FloralBouquet() {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      role="img"
      aria-label="Ramo de flores ilustrado para el Día de las Madres"
    >
      {/* Halo difuso detrás del ramo */}
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE4D6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFE4D6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bloomGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E2CC99" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#B7945A" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="bloomRose" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FED7DC" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F4A4B0" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="bloomBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCE4D8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E8B5A0" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="200" r="180" fill="url(#halo)" />

      {/* Tallos curvos saliendo de un punto inferior */}
      <g stroke="#8F7245" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M 200 380 Q 180 320, 140 220" />
        <path d="M 200 380 Q 200 300, 220 180" />
        <path d="M 200 380 Q 230 320, 280 240" />
        <path d="M 200 380 Q 190 350, 170 320" />
        <path d="M 200 380 Q 215 350, 245 320" />
      </g>

      {/* Hojas: ovales elongadas en verde-dorado tenue */}
      <g fill="#A8B57C" opacity="0.55">
        <ellipse cx="155" cy="290" rx="22" ry="9" transform="rotate(-30 155 290)" />
        <ellipse cx="245" cy="295" rx="22" ry="9" transform="rotate(35 245 295)" />
        <ellipse cx="180" cy="240" rx="18" ry="7" transform="rotate(-50 180 240)" />
        <ellipse cx="240" cy="245" rx="18" ry="7" transform="rotate(45 240 245)" />
      </g>

      {/* Bloom 1: peonía dorada (arriba-izquierda) */}
      <g transform="translate(140 220)">
        <FlowerBloom fill="url(#bloomGold)" core="#6B5534" />
      </g>

      {/* Bloom 2: peonía rosa (arriba-derecha, más grande) */}
      <g transform="translate(280 240) scale(1.15)">
        <FlowerBloom fill="url(#bloomRose)" core="#B7945A" />
      </g>

      {/* Bloom 3: peonía durazno (centro, frontal) */}
      <g transform="translate(220 180) scale(1.25)">
        <FlowerBloom fill="url(#bloomBlush)" core="#8F7245" />
      </g>

      {/* Capullos pequeños */}
      <g transform="translate(170 320)">
        <ellipse cx="0" cy="0" rx="10" ry="14" fill="url(#bloomRose)" opacity="0.85" />
      </g>
      <g transform="translate(245 320)">
        <ellipse cx="0" cy="0" rx="9" ry="13" fill="url(#bloomGold)" opacity="0.85" />
      </g>

      {/* Listón sutil del ramo */}
      <path
        d="M 175 365 Q 200 358, 225 365 L 225 380 Q 200 372, 175 380 Z"
        fill="#B7945A"
        opacity="0.65"
      />
    </svg>
  );
}

/* Una peonía estilizada: 8 capas de pétalos rotados + núcleo. */
function FlowerBloom({ fill, core }: { fill: string; core: string }) {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g>
      {/* Pétalos exteriores grandes */}
      {petals.map((deg) => (
        <ellipse
          key={`outer-${deg}`}
          cx="0"
          cy="-22"
          rx="18"
          ry="26"
          fill={fill}
          opacity="0.85"
          transform={`rotate(${deg})`}
        />
      ))}
      {/* Pétalos medios */}
      {petals.map((deg) => (
        <ellipse
          key={`mid-${deg}`}
          cx="0"
          cy="-12"
          rx="12"
          ry="18"
          fill={fill}
          opacity="0.95"
          transform={`rotate(${deg + 22})`}
        />
      ))}
      {/* Pétalos centro */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={`inner-${deg}`}
          cx="0"
          cy="-7"
          rx="7"
          ry="11"
          fill={fill}
          transform={`rotate(${deg})`}
        />
      ))}
      {/* Núcleo */}
      <circle cx="0" cy="0" r="5" fill={core} opacity="0.85" />
    </g>
  );
}
