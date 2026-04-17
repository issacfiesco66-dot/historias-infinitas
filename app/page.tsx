import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, ScanLine, PawPrint, Users, ArrowRight, Handshake, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import {
  ParallaxNichoCard,
  Reveal,
  DustParticles,
  FadeH2,
  FadeP,
} from '@/components/viva-images';

// Hero: ilustración personalizada del "árbol de memoria" — ya incluye título
// "Historias Infinitas" y el tagline, así que NO superponemos texto encima.
// Archivo en /public/images/hero-arbol-memoria.png
const HERO_IMG  = '/images/hero-arbol-memoria.png';

// Imágenes de Unsplash para las dos tarjetas de nichos.
const PET_IMG   = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1400&q=80';
const HUMAN_IMG = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1400&q=80';

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      {/* ============ HERO — ilustración personalizada, sin overlays ============ */}
      {/* La imagen ya trae título y tagline pintados, así que no superponemos
          ningún texto encima. Fondo pizarra para que encaje el ciclo nocturno
          de la ilustración al borde de la pantalla. */}
      <section className="relative overflow-hidden bg-pizarra-900">
        <Reveal>
          <div className="relative w-full mx-auto">
            {/* Aspect nativo de la imagen: ~1456x816 ≈ 16/9 */}
            <div className="relative w-full aspect-[16/9] min-h-[320px] sm:min-h-[420px] md:min-h-[560px] lg:min-h-[700px] max-h-[900px]">
              <Image
                src={HERO_IMG}
                alt="Historias Infinitas — un árbol de memoria con recuerdos de seres queridos y mascotas bajo un cielo estrellado"
                fill
                priority
                sizes="100vw"
                quality={90}
                className="object-cover object-center"
              />

              {/* Degradado inferior muy sutil para ligar la imagen con el
                  resto de la página sin tapar la ilustración. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-marfil"
              />
            </div>
          </div>
        </Reveal>

        {/* Copy + CTAs DEBAJO de la imagen */}
        <div className="container-solemn pt-10 pb-24 bg-marfil">
          <Reveal delay={0.1} className="text-center">
            <FadeP className="max-w-2xl mx-auto text-lg text-pizarra-600 leading-relaxed">
              Transforma una simple fotografía en un tributo vivo. Con Realidad Aumentada
              e Inteligencia Artificial, mantenemos su esencia presente en tu hogar —
              en cada mirada, en cada rincón, en cada regreso.
            </FadeP>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="dorado" size="lg">
                <Link href="/register">Comenzar su tributo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#como-funciona">Descubrir el proceso</Link>
              </Button>
            </div>

            <div className="mt-16 flex items-center justify-center gap-2 text-pizarra-400">
              <span className="hairline" />
              <span className="text-xs uppercase tracking-widest">Hecho con cuidado</span>
              <span className="hairline" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ DOS NICHOS ============ */}
      <section className="container-wide py-20">
        <div className="text-center mb-14">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
            Dos caminos, un mismo amor
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            Cada vida merece ser honrada a su manera
          </FadeH2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <ParallaxNichoCard
            id="mascotas"
            src={PET_IMG}
            alt="El retrato luminoso de una mascota amada"
            eyebrow="El compañero que nunca se va"
            icon={<PawPrint className="h-5 w-5" />}
            title="Memoriales de Mascotas"
            description="Porque una huella en el corazón es eterna. Honra a tu mejor amigo con un retrato artístico que captura su alegría — y un portal que devuelve el brillo de su mirada a tu sala."
            cta={
              <Button asChild variant="dorado">
                <Link href="/register?type=mascota">
                  Comenzar su tributo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <ParallaxNichoCard
            id="seres-queridos"
            src={HUMAN_IMG}
            alt="La silueta serena de un ser querido al atardecer"
            eyebrow="El árbol que te sostiene"
            icon={<Users className="h-5 w-5" />}
            title="Memoriales de Seres Queridos"
            description="Tu historia familiar merece ser contada. Preserva las lecciones, la voz y la mirada de quienes forjaron tu camino, para que las próximas generaciones los conozcan."
            cta={
              <Button asChild variant="dorado">
                <Link href="/register?type=ser_querido">
                  Preservar su historia <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            }
          />
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="container-wide py-24">
        <div className="text-center mb-16">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
            El ritual
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            Tres gestos para devolverle presencia
          </FadeH2>
          <FadeP delay={0.1} className="text-pizarra-500 mt-4 max-w-xl mx-auto">
            Un proceso sereno, acompañado, hecho para quienes no quieren soltar — sino recordar mejor.
          </FadeP>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          <Reveal delay={0.0}>
            <FeatureStep
              step="01"
              icon={<Heart className="h-6 w-6" />}
              title="Captura la esencia"
              description="Comparte sus fotografías, sus videos, las palabras que mejor lo describen. Cada imagen que subes es una semilla de memoria que no queremos olvidar."
            />
          </Reveal>
          <Reveal delay={0.15}>
            <FeatureStep
              step="02"
              icon={<Sparkles className="h-6 w-6" />}
              title="El Despertar"
              description="Nuestra tecnología da vida al recuerdo. La IA reinterpreta su retrato como una obra de arte, y la Realidad Aumentada prepara un portal donde su presencia vuelve a habitarse."
            />
          </Reveal>
          <Reveal delay={0.3}>
            <FeatureStep
              step="03"
              icon={<ScanLine className="h-6 w-6" />}
              title="Legado Eterno"
              description="Recibe una placa con código único. Instálala donde el corazón te pida — un árbol, un álbum, una lápida — y con un gesto, quien la escanee volverá a encontrarse con él."
            />
          </Reveal>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="container-wide py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-pizarra-700 p-12 md:p-20 text-center">
            <DustParticles count={30} />

            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, rgba(183,148,90,0.4), transparent 60%)',
              }}
            />

            <div className="relative">
              <FadeP className="uppercase tracking-[0.3em] text-[11px] text-dorado-300 mb-5">
                Un gesto pequeño. Un recuerdo infinito.
              </FadeP>
              <FadeH2
                duration={1.4}
                className="font-serif text-4xl md:text-5xl text-marfil mb-5"
              >
                Su historia no termina aquí.
                <br />
                <span className="text-gradient-dorado italic">Empieza contigo.</span>
              </FadeH2>
              <FadeP delay={0.15} className="text-marfil/75 max-w-xl mx-auto mb-8">
                Crear el memorial es gratuito. Acompañamos el proceso con el mismo
                cuidado con el que tú guardas su recuerdo.
              </FadeP>
              <Button asChild variant="dorado" size="lg">
                <Link href="/register">Comenzar su tributo</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ GROWTH PARTNER / B2B ============ */}
      <section className="container-wide pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-pizarra-200/60 bg-pizarra-800 shadow-solemn">
            <div
              aria-hidden
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 10% 20%, rgba(183,148,90,0.35), transparent 55%), radial-gradient(ellipse at 90% 80%, rgba(183,148,90,0.15), transparent 55%)',
              }}
            />

            <div className="relative px-8 py-12 md:px-14 md:py-16 grid lg:grid-cols-[1.3fr,1fr] gap-10 items-center">
              {/* Texto + badges */}
              <div>
                <div className="flex items-center gap-3 text-dorado-300 mb-4">
                  <Handshake className="h-5 w-5" />
                  <FadeP className="uppercase tracking-[0.3em] text-[11px]">
                    Programa de socios · Funerarias · Clínicas veterinarias · Hospicios
                  </FadeP>
                </div>

                <FadeH2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-marfil leading-tight mb-4">
                  El detalle que hará que tus familias{' '}
                  <span className="text-gradient-dorado italic">nunca te olviden</span>.
                </FadeH2>
                <FadeP delay={0.1} className="text-marfil/80 text-base md:text-lg max-w-xl mb-6">
                  Regala a cada familia un memorial digital con retrato IA y QR —
                  con <strong className="text-marfil">el logo y subdominio de tu empresa</strong>.
                  Desde <span className="text-dorado-300 font-medium">$999 MXN</span>.
                </FadeP>

                {/* Mini-badges de valor */}
                <ul className="grid grid-cols-2 gap-2 mb-8 max-w-md">
                  <BadgeRow>Tu marca, tu subdominio</BadgeRow>
                  <BadgeRow>15 % comisión por upgrade</BadgeRow>
                  <BadgeRow>Setup en menos de 48 h</BadgeRow>
                  <BadgeRow>30 días de garantía</BadgeRow>
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="dorado" size="lg">
                    <Link href="/partners#planes">Ver planes y precios</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="!bg-transparent !text-marfil border-marfil/40 hover:!bg-marfil/10"
                  >
                    <Link href="/contacto?plan=institucional">Hablar con ventas</Link>
                  </Button>
                </div>
              </div>

              {/* Tarjeta de oferta destacada */}
              <div className="bg-marfil rounded-2xl p-6 md:p-8 shadow-dorado">
                <p className="uppercase tracking-widest text-[10px] text-dorado-600 mb-2">
                  Oferta de entrada
                </p>
                <h3 className="font-serif text-2xl md:text-3xl text-pizarra-800 mb-1">
                  Pack 30 memoriales
                </h3>
                <p className="text-sm text-pizarra-500 italic mb-5">
                  Ahorra 40 % vs. retail · 5 placas físicas incluidas
                </p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-serif text-5xl text-pizarra-800">$4,999</span>
                  <span className="text-xs text-pizarra-400 uppercase tracking-widest ml-1">MXN</span>
                </div>

                <ul className="space-y-2 mb-6 text-sm text-pizarra-700">
                  <LiCheck>30 memoriales con tu logo (vigencia 12 meses)</LiCheck>
                  <LiCheck>Dashboard de socio + material de venta</LiCheck>
                  <LiCheck>5 placas de acero con tu logo, sin costo</LiCheck>
                  <LiCheck>Soporte dedicado por correo</LiCheck>
                </ul>

                <Button asChild variant="dorado" className="w-full" size="lg">
                  <Link href="/partners#planes">
                    Contratar ahora <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <p className="mt-3 text-[11px] text-pizarra-400 text-center">
                  Pago seguro con Stripe · factura CFDI
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </>
  );
}

function FeatureStep({
  step, icon, title, description,
}: { step: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-8 hover:shadow-dorado transition-shadow h-full">
      <div className="flex items-center gap-4 mb-4">
        <span className="font-serif text-3xl text-dorado-500">{step}</span>
        <span className="h-px flex-1 bg-pizarra-100" />
        <span className="text-dorado-600">{icon}</span>
      </div>
      <h3 className="font-serif text-2xl text-pizarra-800 mb-3">{title}</h3>
      <p className="text-pizarra-500 text-sm leading-relaxed">{description}</p>
    </Card>
  );
}

function BadgeRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-marfil/80 text-sm">
      <Check className="h-4 w-4 text-dorado-300 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function LiCheck({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-4 w-4 text-dorado-500 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
