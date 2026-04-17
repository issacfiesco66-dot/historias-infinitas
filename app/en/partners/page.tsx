import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart, Handshake, Sparkles, Building2, TrendingUp,
  ShieldCheck, HeartHandshake, Award, Star, Check,
} from 'lucide-react';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal, FadeH1, FadeH2, FadeP, DustParticles } from '@/components/viva-images';

export const metadata: Metadata = {
  title: 'Partner Program — Historias Infinitas',
  description:
    'Funeral homes, veterinary clinics and hospices: offer your families a new way to remember with branded digital memorials, AI portraits and engraved steel plates. Plans from $99 USD.',
  alternates: {
    canonical: '/en/partners',
    languages: {
      'es-MX': '/partners',
      'en-US': '/en/partners',
      'x-default': '/partners',
    },
  },
  keywords: [
    'funeral home partner program',
    'veterinary clinic digital memorial',
    'hospice memorial service',
    'memorial white label',
    'funeral upsell program',
  ],
  openGraph: {
    title: 'Partner Program — Historias Infinitas',
    description:
      'Branded digital memorials for your families. Setup in under 48 hours.',
    url: '/en/partners',
    locale: 'en_US',
    type: 'website',
  },
};

// Partner plans in USD for the US/CA market.
const PLANS = [
  {
    id: 'trial',
    type: 'One-time',
    name: 'Trial',
    tagline: 'Try before you commit.',
    priceUSD: 99,
    ctaLabel: 'Talk to sales',
    features: [
      '5 digital memorials',
      '6-month validity',
      'Your logo on every memorial',
      'No renewal commitment',
    ],
  },
  {
    id: 'pack_30',
    type: 'One-time',
    name: 'Pack 30',
    tagline: 'The sweet spot for most partners.',
    priceUSD: 299,
    popular: true,
    ctaLabel: 'Talk to sales',
    features: [
      '30 digital memorials (40% savings)',
      '12-month validity',
      'Your logo on every memorial',
      'Partner management dashboard',
      '5 physical plates with your logo, free',
      'Sales materials for your team',
    ],
  },
  {
    id: 'annual_pro',
    type: 'Annual',
    name: 'Professional',
    tagline: 'For busy funeral homes and clinics.',
    priceUSD: 899,
    ctaLabel: 'Talk to sales',
    features: [
      '200 memorials per year (60% savings)',
      '40 physical plates with your logo',
      'Team training (via Zoom)',
      '15% commission on upgrades',
      'Custom subdomain (coming soon)',
      'Priority support <4 h business hours',
    ],
  },
  {
    id: 'institutional',
    type: 'Custom',
    name: 'Institutional',
    tagline: 'For chains, groups and enterprises.',
    priceUSD: null,
    ctaLabel: 'Talk to sales',
    features: [
      'Unlimited memorials',
      '15% commission on upgrades',
      'Dedicated account manager',
      'Signed DPA',
      'Full white-label (coming soon)',
      'CRM integration API (coming soon)',
    ],
  },
];

function formatUSD(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PartnersEN() {
  return (
    <>
      <SiteHeaderEN />

      {/* HERO */}
      <section className="relative overflow-hidden bg-pizarra-800 text-marfil">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 20% 30%, rgba(183,148,90,0.35), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(183,148,90,0.15), transparent 50%)',
          }}
        />
        <DustParticles count={24} />

        <div className="container-wide relative py-20 md:py-28">
          <Reveal>
            <FadeP className="uppercase tracking-[0.3em] text-[11px] md:text-sm text-dorado-300 mb-5">
              Partner Program · Funeral Homes · Veterinary Clinics · Hospices
            </FadeP>
            <FadeH1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-marfil max-w-4xl">
              The detail that will make your families{' '}
              <span className="text-gradient-dorado italic">never forget you</span>.
            </FadeH1>
            <FadeP delay={0.1} className="text-marfil/80 mt-6 max-w-2xl text-lg md:text-xl leading-relaxed">
              Gift every family a digital memorial with AI portrait and QR — with
              <strong className="text-marfil"> your brand and subdomain</strong>.
              A gesture that elevates your service and drives referrals for years.
            </FadeP>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild variant="dorado" size="lg">
                <Link href="#plans">View plans & pricing</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="!bg-transparent !text-marfil border-marfil/40 hover:!bg-marfil/10">
                <Link href="/en/contact?plan=institutional">Talk to sales</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-marfil/70">
              <StatPill value="< 48 h" label="Setup in" />
              <StatPill value="+1,000" label="Active memorials" />
              <StatPill value="up to 60%" label="Savings vs retail" />
              <StatPill value="15%" label="Upgrade commission" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="container-wide py-24">
        <Reveal className="text-center mb-14">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Why partner with us?
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            A service that sells itself
          </FadeH2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BenefitCard icon={<Heart className="h-6 w-6" />}
            title="Emotional closure"
            text="Families remember those who accompanied them in the hardest moment. Your service leaves an echo that lasts years." />
          <BenefitCard icon={<Building2 className="h-6 w-6" />}
            title="Your brand, your subdomain"
            text="Every memorial lives on yourname.historias-infinitas.com with your logo. Families remember you — not us." />
          <BenefitCard icon={<TrendingUp className="h-6 w-6" />}
            title="Extra revenue"
            text="Whenever a family upgrades to the Eternal plan or buys the AR Portal, you receive 15% commission." />
          <BenefitCard icon={<HeartHandshake className="h-6 w-6" />}
            title="Zero friction"
            text="Your team just hands over a QR. We handle the AI portrait, eternal hosting and plate shipping." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-pizarra-50 py-24">
        <div className="container-wide">
          <Reveal className="text-center mb-14">
            <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
              How it works
            </FadeP>
            <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
              Three steps and you're live
            </FadeH2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            <Step number="01" title="Pick your plan"
              text="One-time pack or annual subscription. We invoice 100% upfront with W-9 available." />
            <Step number="02" title="Get your kit"
              text="Partner dashboard, your subdomain, sales materials, and a set of physical plates with your logo." />
            <Step number="03" title="Your team gifts the QR"
              text="For each family, they scan the QR and complete the memorial. We take care of everything else." />
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="container-wide py-24">
        <Reveal className="text-center mb-14">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Investment
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            Pick your entry point
          </FadeH2>
          <FadeP delay={0.1} className="text-pizarra-500 mt-4 max-w-2xl mx-auto">
            Pay by volume or annual subscription. Both include a 30-day satisfaction guarantee.
          </FadeP>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 bg-marfil flex flex-col h-full shadow-solemn ${
                p.popular ? 'border-dorado-500 shadow-dorado' : 'border-pizarra-100'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 bg-pizarra-800 text-marfil text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  <Star className="h-3 w-3 text-dorado-400" /> Most popular
                </span>
              )}

              <div>
                <p className="uppercase tracking-widest text-[10px] text-dorado-600 mb-2">
                  {p.type}
                </p>
                <h3 className="font-serif text-2xl text-pizarra-800">{p.name}</h3>
                <p className="text-xs text-pizarra-500 italic mt-1 mb-5">{p.tagline}</p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-serif text-4xl text-pizarra-800">
                    {p.priceUSD === null ? 'Custom' : formatUSD(p.priceUSD)}
                  </span>
                  {p.priceUSD !== null && (
                    <span className="text-xs text-pizarra-400 uppercase tracking-widest ml-1">
                      {p.type === 'Annual' ? '/ year' : 'USD'}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-pizarra-700">
                      <Check className="h-4 w-4 text-dorado-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild variant={p.popular ? 'dorado' : 'outline'} className="w-full mt-auto">
                <Link href={`/en/contact?plan=${p.id}`}>
                  {p.ctaLabel}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <Reveal delay={0.2}>
          <Card className="mt-10 bg-pizarra-800 border-pizarra-700 text-marfil">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="h-14 w-14 rounded-full bg-dorado-500/15 border border-dorado-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-7 w-7 text-dorado-400" />
              </div>
              <div className="flex-1">
                <p className="uppercase tracking-widest text-[11px] text-dorado-300 mb-1">
                  Satisfaction guarantee
                </p>
                <h3 className="font-serif text-xl text-marfil mb-1">
                  30 days to try. If it doesn't fit your operation, we refund the full plan.
                </h3>
                <p className="text-sm text-marfil/70">
                  Memorials already delivered to your families remain active forever.
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* TESTIMONIAL */}
      <section className="bg-pizarra-800 text-marfil py-24">
        <div className="container-wide max-w-3xl text-center">
          <Reveal>
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-dorado-400 fill-dorado-400" />
              ))}
            </div>
            <FadeH2 className="font-serif italic text-2xl md:text-4xl text-marfil leading-snug">
              &ldquo;It's the emotional closure our service was missing. Families
              write months later thanking us. We'd never had that before.&rdquo;
            </FadeH2>
            <FadeP className="mt-8 text-dorado-300 uppercase tracking-widest text-xs">
              — Funeral Home testimonial · California
            </FadeP>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-wide py-24 max-w-4xl">
        <Reveal className="text-center mb-14">
          <FadeP className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">
            Frequently asked questions
          </FadeP>
          <FadeH2 className="font-serif text-4xl md:text-5xl text-pizarra-800">
            What funeral homes and clinics ask us
          </FadeH2>
        </Reveal>

        <div className="space-y-4">
          <Faq q="What if I go over my plan's memorials?">
            You can buy additional memorials at partner price ($12 USD each vs. $17 retail) or upgrade to the next plan — we credit what you've already paid.
          </Faq>
          <Faq q="Can I cancel the annual plan?">
            Yes, at any time. Memorials already delivered to your families remain live forever. We never auto-renew without your confirmation.
          </Faq>
          <Faq q="Can you put our logo on the physical plates?">
            Yes. Pack 30 includes 5 laser-engraved steel plates with your logo; Professional includes 40. Extra plates: $25 USD each.
          </Faq>
          <Faq q="Do you train our team?">
            The Professional plan includes a 60-minute Zoom training + sales script for your team. Other plans can add it as a paid service.
          </Faq>
          <Faq q="How are we invoiced?">
            US-based partners: invoice with W-9 / 1099 setup. International: Stripe invoice with tax IDs. Quarterly commission statements for upgrade revenue.
          </Faq>
          <Faq q="What happens to the families' data?">
            We are data controllers under GDPR-equivalent standards. Signed DPA on request. Data is only shared with technical processors listed in our Privacy Policy.
          </Faq>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-wide pb-24">
        <Reveal>
          <Card className="bg-dorado-500 border-dorado-400 text-pizarra-900 shadow-dorado">
            <CardContent className="p-10 md:p-14 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-pizarra-800" />
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
                Start with Pack 30 and get the plates as a gift.
              </h2>
              <p className="max-w-2xl mx-auto text-pizarra-800/85 mb-8">
                30 memorials, 5 physical plates with your logo, and access to the
                partner dashboard — for less than a single premium service.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-pizarra-900 hover:bg-pizarra-800 text-marfil">
                  <Link href="/en/contact?plan=pack_30">Contact sales</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-pizarra-900 text-pizarra-900 hover:bg-pizarra-900/10">
                  <Link href="/en/contact?plan=institutional">Talk to an advisor</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <SiteFooterEN />
    </>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-serif text-2xl text-dorado-300">{value}</span>
      <span className="text-marfil/60 text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}

function BenefitCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Reveal>
      <Card className="h-full p-6 hover:shadow-dorado transition-shadow">
        <div className="h-12 w-12 rounded-full bg-dorado-100 text-dorado-700 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-serif text-xl text-pizarra-800 mb-2">{title}</h3>
        <p className="text-pizarra-500 text-sm leading-relaxed">{text}</p>
      </Card>
    </Reveal>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <Reveal>
      <div className="bg-marfil rounded-2xl p-8 h-full border border-pizarra-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-serif text-4xl text-dorado-500">{number}</span>
          <span className="h-px flex-1 bg-pizarra-100" />
          <Award className="h-5 w-5 text-dorado-600" />
        </div>
        <h3 className="font-serif text-2xl text-pizarra-800 mb-3">{title}</h3>
        <p className="text-pizarra-500 text-sm leading-relaxed">{text}</p>
      </div>
    </Reveal>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group bg-marfil rounded-xl border border-pizarra-100 p-5 open:shadow-solemn transition-shadow">
      <summary className="font-serif text-lg text-pizarra-800 cursor-pointer list-none flex items-center justify-between">
        {q}
        <span className="text-dorado-500 text-2xl transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm text-pizarra-600 leading-relaxed">{children}</p>
    </details>
  );
}
