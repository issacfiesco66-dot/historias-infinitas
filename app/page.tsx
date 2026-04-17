import Link from 'next/link';
import { Heart, Sparkles, ScanLine, PawPrint, Users, ArrowRight, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import {
  AnimatedHeroImage,
  ParallaxNichoCard,
  Reveal,
  DustParticles,
  FadeH1,
  FadeH2,
  FadeP,
} from '@/components/viva-images';

// Imágenes de Unsplash (CDN gratuito, licencia libre) alineadas con el tono
// solemne del proyecto: velas encendidas, mascotas en retrato cálido, y
// un retrato familiar evocador.
//  - Hero: vela y atardecer cálido → memoria eterna
//  - Pet:  retrato íntimo de mascota
//  - Human: manos entrelazadas / figura reflexiva
const HERO_IMG  = 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?auto=format&fit=crop&w=1800&q=80';
const PET_IMG   = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1400&q=80';
const HUMAN_IMG = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1400&q=80';

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="container-solemn pt-16 pb-24">
          <Reveal>
            <div className="relative">
              <AnimatedHeroImage
                src={HERO_IMG}
                alt="Un amanecer sereno que evoca la memoria eterna"
                priority
                aspect="hero"
                className="mb-12"
              />

              {/* Texto superpuesto — marfil sobre pizarra 40% */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <div className="max-w-3xl">
                  <FadeP
                    delay={0.2}
                    className="uppercase tracking-[0.3em] text-xs text-dorado-200 mb-6"
                  >
                    · Un legado · Una presencia · Un hogar eterno ·
                  </FadeP>

                  <FadeH1
                    delay={0.35}
                    duration={1.4}
                    className="font-serif text-5xl md:text-7xl leading-[1.05] text-marfil drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]"
                  >
                    Donde los recuerdos <br />
                    <span className="text-gradient-dorado italic">respiran para siempre.</span>
                  </FadeH1>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="text-center">
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
          <div className="relative overflow-hidden rounded-xl border border-pizarra-200/60 bg-pizarra-800 p-10 md:p-14">
            <div
              aria-hidden
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(183,148,90,0.25) 0%, transparent 40%, rgba(183,148,90,0.15) 100%)',
              }}
            />

            <div className="relative grid md:grid-cols-[auto,1fr,auto] items-center gap-8">
              <div className="hidden md:flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-dorado-300/40 bg-pizarra-900/40 text-dorado-300">
                <Handshake className="h-6 w-6" />
              </div>

              <div>
                <FadeP className="uppercase tracking-[0.3em] text-[11px] text-dorado-300 mb-3">
                  Programa de socios · Funerarias · Clínicas veterinarias
                </FadeP>
                <FadeH2 className="font-serif text-2xl md:text-3xl text-marfil leading-snug mb-3">
                  Sanar también es acompañar con nuevas formas de recordar.
                </FadeH2>
                <FadeP delay={0.1} className="text-marfil/75 max-w-2xl">
                  ¿Eres una funeraria o clínica veterinaria? Únete a nuestra red de socios
                  y ofrece a tus clientes una nueva forma de sanar a través de la tecnología —
                  con la delicadeza que ya los caracteriza a ustedes.
                </FadeP>
              </div>

              <div className="md:justify-self-end">
                <Button asChild variant="dorado" size="lg">
                  <Link href="/partners">Conversemos</Link>
                </Button>
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
