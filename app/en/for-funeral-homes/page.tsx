import type { Metadata } from 'next';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { VerticalLandingEN } from '../vertical-landing-en';

export const metadata: Metadata = {
  title: 'Digital Memorials for Funeral Homes — Historias Infinitas',
  description:
    'Offer every family a digital memorial with QR, AI portrait and steel plate engraved with your funeral home\'s logo. Plans from $59 USD. 30-day guarantee. 15% commission on upgrades.',
  alternates: {
    canonical: '/en/for-funeral-homes',
    languages: {
      'es-MX': '/para-funerarias',
      'en-US': '/en/for-funeral-homes',
      'x-default': '/para-funerarias',
    },
  },
  keywords: [
    'digital memorial for funeral home',
    'funeral home software',
    'funeral home tech',
    'QR code memorial',
    'memorial website service',
    'funeral home upsell',
    'grief aftercare',
  ],
  openGraph: {
    title: 'Digital Memorials with your brand — for Funeral Homes',
    description:
      'Give every family a digital memorial with QR and AI portrait. Branded with your funeral home. From $59 USD.',
    url: '/en/for-funeral-homes',
    locale: 'en_US',
    type: 'article',
  },
};

export default function ForFuneralHomesPage() {
  return (
    <>
      <SiteHeaderEN />
      <VerticalLandingEN
        copy={{
          vertical: 'Funeral Homes',
          keywordH1: 'funeral homes',
          canonical: '/en/for-funeral-homes',
          eyebrow: 'For Funeral Homes · Memorial Services · Crematories · US & Canada',
          h1: (
            <>
              The service that{' '}
              <span className="text-gradient-dorado italic">sets your funeral home apart</span>.
            </>
          ),
          intro:
            'Give every family a digital memorial with AI portrait, printable QR and engraved steel plate — all branded with your funeral home\'s logo. Families remember you for years, refer their neighbors, and upgrade (you earn 15% commission).',
          pitch: 'The emotional closure that makes families refer you',
          benefits: [
            {
              icon: Heart,
              title: 'Real emotional closure',
              text:
                'Families leave the service with something digital that preserves their loved one — not just a death certificate. They remember you years later and refer you.',
            },
            {
              icon: HeartHandshake,
              title: 'Your brand on every memorial',
              text:
                'Your funeral home\'s logo appears at the foot of every memorial and is laser-engraved on the physical plate. Permanent attribution without paying for ads.',
            },
            {
              icon: TrendingUp,
              title: '15% recurring commission',
              text:
                'When a family upgrades to the Eternal plan or adds the AR Portal, you get 15% commission. Passive income with no extra work.',
            },
            {
              icon: ShieldCheck,
              title: 'Compliant by design',
              text:
                'HIPAA-friendly data handling, signed DPA available, TLS + row-level security. Ready for state regulations on death record handling.',
            },
          ],
          testimonial: {
            quote:
              'We started with the Pack 30 and by the third week families already mentioned us for this. It\'s the emotional closure our service was missing.',
            author: 'Funeral home in California · editable testimonial',
          },
          faqs: [
            {
              q: 'How is the memorial delivered to the family?',
              a: 'Print the QR on a memorial card (we provide the PDF) or we engrave it on a stainless steel plate. During the service, your team hands it over with a short script we provide.',
            },
            {
              q: 'Can we bundle it into our existing packages?',
              a: 'Yes — most of our partners add it to a "full-service" package absorbing the cost, or sell it as a premium add-on. We help you define positioning and price for your market.',
            },
            {
              q: 'What happens with the deceased\'s and family\'s data?',
              a: 'We are data processors under GDPR-equivalent standards (Mexico\'s LFPDPPP). Memorials are private until paid; drafts remain private. We sign Data Processing Agreements on request.',
            },
            {
              q: 'What does the physical plate include?',
              a: 'Stainless steel with laser engraving of the QR and your logo. Pack 30 includes 5 plates; additional plates at $25 USD each. US/Canada shipping included.',
            },
          ],
        }}
      />
      <SiteFooterEN />
    </>
  );
}
