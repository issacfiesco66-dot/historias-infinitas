import type { Metadata } from 'next';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { VerticalLandingEN } from '../vertical-landing-en';

export const metadata: Metadata = {
  title: 'Pet Memorial Service for Veterinary Clinics — Historias Infinitas',
  description:
    'Offer grieving families a digital memorial with AI portrait to honor their pet. Branded with your clinic\'s logo. From $59 USD. 30-day guarantee.',
  alternates: {
    canonical: '/en/for-veterinary-clinics',
    languages: {
      'es-MX': '/para-clinicas-veterinarias',
      'en-US': '/en/for-veterinary-clinics',
      'x-default': '/para-clinicas-veterinarias',
    },
  },
  keywords: [
    'pet memorial veterinary clinic',
    'pet loss grief service',
    'euthanasia aftercare',
    'pet cremation memorial',
    'veterinary clinic add-on',
    'dog cat tribute',
    'veterinary aftercare revenue',
  ],
  openGraph: {
    title: 'A dignified farewell for every pet — for Veterinary Clinics',
    description:
      'Gift a digital memorial with AI portrait and QR to families who must say goodbye. Branded with your clinic.',
    url: '/en/for-veterinary-clinics',
    locale: 'en_US',
    type: 'article',
  },
};

export default function ForVeterinaryClinicsPage() {
  return (
    <>
      <SiteHeaderEN />
      <VerticalLandingEN
        copy={{
          vertical: 'Veterinary Clinics',
          keywordH1: 'veterinary clinics',
          canonical: '/en/for-veterinary-clinics',
          eyebrow: 'For Veterinary Clinics · Pet Hospitals · Cremation Services',
          h1: (
            <>
              The dignified farewell{' '}
              <span className="text-gradient-dorado italic">your families will always remember</span>.
            </>
          ),
          intro:
            'When a pet passes, families need to close with love. Offer them a digital memorial with AI-generated portrait and QR — branded with your clinic\'s logo. A gesture that turns grief into memory, and your clinic into a reference point.',
          pitch: 'The detail that turns grief into trust',
          benefits: [
            {
              icon: Heart,
              title: 'Grief companionship',
              text:
                'The farewell is the most sensitive moment. A tangible memorial helps families process the loss and leaves them something beautiful to share.',
            },
            {
              icon: HeartHandshake,
              title: 'Your clinic, their sanctuary',
              text:
                'Your logo appears on every memorial and on the engraved plate. Families associate your brand with the most human moment of their story.',
            },
            {
              icon: TrendingUp,
              title: 'Differentiation + revenue',
              text:
                'Few veterinary services in the US offer this. Beyond retention, you earn 15% commission on upgrades — recurring passive revenue.',
            },
            {
              icon: ShieldCheck,
              title: 'Works with any species',
              text:
                'Dogs, cats, birds, rabbits, reptiles. Our AI model preserves pet identity as faithfully as human portraits — even rare breeds and unusual markings.',
            },
          ],
          testimonial: {
            quote:
              'It\'s the service our families didn\'t know they needed. When they come back with another pet, they come back to us.',
            author: 'Animal Hospital in Austin · editable testimonial',
          },
          faqs: [
            {
              q: 'How do we integrate it with euthanasia or cremation services?',
              a: 'Offer it as part of the farewell package. Our team trains you on how to present it respectfully — typically when handing over ashes or as a follow-up gift.',
            },
            {
              q: 'Does the AI really preserve my patient\'s features?',
              a: 'We use Flux Kontext Max, the latest identity-preserving editing model. It works beautifully with specific breeds, coat colors, markings and face structures. If the first generation doesn\'t capture the essence, we regenerate at no cost.',
            },
            {
              q: 'Can the family view the QR without paying?',
              a: 'Before payment the URL is private (draft mode). After payment it\'s public forever with eternal hosting. If your client doesn\'t pay the base plan, the memorial is not published.',
            },
            {
              q: 'Are the physical plates suitable for urns and garden memorials?',
              a: 'Yes — stainless steel with laser engraving, weather-resistant. Standard 6×6 cm, perfect for urns, pet collars or garden stones. US/Canada shipping included.',
            },
          ],
        }}
      />
      <SiteFooterEN />
    </>
  );
}
