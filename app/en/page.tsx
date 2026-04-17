import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Heart, Sparkles, ScanLine, PawPrint, Users, ArrowRight, Handshake, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import {
  ParallaxNichoCard,
  Reveal,
  DustParticles,
  FadeH2,
  FadeP,
} from '@/components/viva-images';

export const metadata: Metadata = {
  title: 'Historias Infinitas — Digital Memorials with AI Portraits and Augmented Reality',
  description:
    'Preserve the memory of those you love. We create eternal digital memorials with AI-generated artistic portraits and Augmented Reality portals — for pets and loved ones. Plans from $17 USD.',
  alternates: {
    canonical: '/en',
    languages: { 'es-MX': '/', 'en-US': '/en', 'x-default': '/' },
  },
  openGraph: {
    title: 'Digital Memorials with AI & AR — Historias Infinitas',
    description:
      'A timeless home online for those you love. AI portraits + Augmented Reality + QR plate.',
    url: '/en',
    locale: 'en_US',
    type: 'website',
  },
  keywords: [
    'digital memorial',
    'pet memorial online',
    'memorial website',
    'online tribute',
    'AI portrait memorial',
    'augmented reality memorial',
    'QR code memorial',
    'remember a pet',
    'grief pet loss',
    'forever memorial',
  ],
};

const HERO_IMG       = '/images/hero-arbol-memoria.png';
const PET_IMG        = '/images/nicho-mascotas.png';
const HUMAN_IMG      = '/images/nicho-seres-queridos.png';

export default function HomePageEN() {
  return (
    <>
      <SiteHeaderEN />

      {/* ============ HERO ============ */}
      <section className="relative">
        <Reveal>
          <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden bg-pizarra-900">
            <div className="relative w-full aspect-[16/9] min-h-[320px] sm:min-h-[420px] md:min-h-[560px] lg:min-h-[700px] max-h-[900px]">
              <Image
                src={HERO_IMG}
                alt="Historias Infinitas — a tree of memory carrying loved ones and pets beneath a starlit sky"
                fill
                priority
                sizes="100vw"
                quality={90}
                className="object-cover object-center"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-marfil"
              />
            </div>
          </div>
        </Reveal>

        <div className="container-solemn pt-10 pb-24">
          <Reveal delay={0.1} className="text-center">
            <FadeP className="max-w-2xl mx-auto text-lg text-pizarra-600 leading-relaxed">
              Turn a single photograph into a living tribute. With Augmented
              Reality and Artificial Intelligence, we keep their presence alive
              in your home — in every glance, in every corner, in every return.
            </FadeP>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="dorado" size="lg">
                <Link href="/register">Start their tribute</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            <div className="mt-16 flex items-center justify-center gap-2 text-pizarra-400">
              <span className="hairline" />
              <span className="text-xs uppercase tracking-widest">Made with care</span>
              <span className="hairline" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ TWO NICHES ============ */}
      <section className="container-wide py-20">
        <div className="text-center mb-14">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
            Two paths, one love
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            Every life deserves its own kind of tribute
          </FadeH2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <ParallaxNichoCard
            id="pets"
            src={PET_IMG}
            alt="A radiant portrait of a beloved pet"
            eyebrow="The companion who never really leaves"
            icon={<PawPrint className="h-5 w-5" />}
            title="Pet Memorials"
            description="Because a paw print on your heart is eternal. Honor your best friend with an artistic portrait that captures their joy — and a portal that brings their gaze back to your living room."
            cta={
              <Button asChild variant="dorado">
                <Link href="/register?type=mascota">
                  Start their tribute <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <ParallaxNichoCard
            id="loved-ones"
            src={HUMAN_IMG}
            alt="A serene portrait of elders sharing their legacy"
            eyebrow="The tree that holds you"
            icon={<Users className="h-5 w-5" />}
            title="Memorials for Loved Ones"
            description="Your family story deserves to be told. Preserve the lessons, the voice and the gaze of those who built your path, so the next generations can know them."
            cta={
              <Button asChild variant="dorado">
                <Link href="/register?type=ser_querido">
                  Preserve their story <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            }
          />
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="container-wide py-24">
        <div className="text-center mb-16">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
            The ritual
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            Three gestures to bring them back
          </FadeH2>
          <FadeP delay={0.1} className="text-pizarra-500 mt-4 max-w-xl mx-auto">
            A calm, guided process — made for those who don't want to let go, but to remember better.
          </FadeP>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          <Reveal delay={0.0}>
            <FeatureStep
              step="01"
              icon={<Heart className="h-6 w-6" />}
              title="Capture the essence"
              description="Share their photographs, videos and the words that describe them best. Each image you upload is a seed of memory we won't let fade."
            />
          </Reveal>
          <Reveal delay={0.15}>
            <FeatureStep
              step="02"
              icon={<Sparkles className="h-6 w-6" />}
              title="The Awakening"
              description="Our technology brings the memory to life. AI reinterprets their portrait as fine art, and Augmented Reality prepares a portal where their presence returns home."
            />
          </Reveal>
          <Reveal delay={0.3}>
            <FeatureStep
              step="03"
              icon={<ScanLine className="h-6 w-6" />}
              title="Eternal Legacy"
              description="Receive a plate with a unique QR code. Place it wherever your heart asks — a tree, an album, a headstone — and with a single scan, their presence returns."
            />
          </Reveal>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
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
                A small gesture. An infinite memory.
              </FadeP>
              <FadeH2
                duration={1.4}
                className="font-serif text-4xl md:text-5xl text-marfil mb-5"
              >
                Their story doesn't end here.
                <br />
                <span className="text-gradient-dorado italic">It begins with you.</span>
              </FadeH2>
              <FadeP delay={0.15} className="text-marfil/75 max-w-xl mx-auto mb-8">
                Creating the memorial is free. We walk with you through the whole
                process with the same care you carry their memory.
              </FadeP>
              <Button asChild variant="dorado" size="lg">
                <Link href="/register">Start their tribute</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ B2B PARTNERS ============ */}
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
              <div>
                <div className="flex items-center gap-3 text-dorado-300 mb-4">
                  <Handshake className="h-5 w-5" />
                  <FadeP className="uppercase tracking-[0.3em] text-[11px]">
                    Partner Program · Funeral Homes · Veterinary Clinics · Hospices
                  </FadeP>
                </div>

                <FadeH2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-marfil leading-tight mb-4">
                  The detail that will make your families{' '}
                  <span className="text-gradient-dorado italic">never forget you</span>.
                </FadeH2>
                <FadeP delay={0.1} className="text-marfil/80 text-base md:text-lg max-w-xl mb-6">
                  Gift each family a digital memorial with AI portrait and QR —
                  with <strong className="text-marfil">your brand and logo</strong>.
                  Starting at <span className="text-dorado-300 font-medium">$59 USD</span>.
                </FadeP>

                <ul className="grid grid-cols-2 gap-2 mb-8 max-w-md">
                  <BadgeRow>Your brand on every memorial</BadgeRow>
                  <BadgeRow>15% commission on upgrades</BadgeRow>
                  <BadgeRow>Setup in under 48 hours</BadgeRow>
                  <BadgeRow>30-day guarantee</BadgeRow>
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="dorado" size="lg">
                    <Link href="/en/partners#plans">View plans & pricing</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="!bg-transparent !text-marfil border-marfil/40 hover:!bg-marfil/10"
                  >
                    <Link href="/en/contact?plan=institutional">Talk to sales</Link>
                  </Button>
                </div>
              </div>

              <div className="bg-marfil rounded-2xl p-6 md:p-8 shadow-dorado">
                <p className="uppercase tracking-widest text-[10px] text-dorado-600 mb-2">
                  Entry offer
                </p>
                <h3 className="font-serif text-2xl md:text-3xl text-pizarra-800 mb-1">
                  Pack 30 memorials
                </h3>
                <p className="text-sm text-pizarra-500 italic mb-5">
                  Save 40% vs. retail · 5 physical plates included
                </p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-serif text-5xl text-pizarra-800">$299</span>
                  <span className="text-xs text-pizarra-400 uppercase tracking-widest ml-1">USD</span>
                </div>

                <ul className="space-y-2 mb-6 text-sm text-pizarra-700">
                  <LiCheck>30 memorials with your logo (12-month validity)</LiCheck>
                  <LiCheck>Partner dashboard + sales materials</LiCheck>
                  <LiCheck>5 steel plates with your logo, free</LiCheck>
                  <LiCheck>Dedicated email support</LiCheck>
                </ul>

                <Button asChild variant="dorado" className="w-full" size="lg">
                  <Link href="/en/partners#plans">
                    Buy now <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <p className="mt-3 text-[11px] text-pizarra-400 text-center">
                  Secure payment via Stripe · invoice available
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooterEN />
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
