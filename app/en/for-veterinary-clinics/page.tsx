import type { Metadata } from 'next';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { VerticalLandingEN } from '../vertical-landing-en';

export const metadata: Metadata = {
  title: 'Pet Memorial Service for Veterinary Clinics · AI Portrait & QR',
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
    'pet memorial Texas',
    'pet memorial California',
    'pet memorial Florida',
    'pet memorial New York',
    'pet loss Austin',
    'pet loss Los Angeles',
    'pet loss Chicago',
    'veterinary aftercare USA',
    'animal hospital grief service',
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
          deepContent: {
            heading: 'Why every veterinary clinic in the US should offer a real pet loss aftercare service',
            paragraphs: [
              'The US pet industry processes over 2 million veterinary euthanasia procedures each year across Texas, California, Florida, New York, Illinois and every other state. Most families leave the animal hospital with an urn or a cardboard box — and with an emotional gap that no one helps them close. Historias Infinitas turns that moment into one of the most memorable parts of the service: a digital memorial with AI-generated artistic portrait, pet biography, photo gallery and a printable QR code the family keeps forever.',
              'The operational flow is simple for your clinic: at the moment of cremation pickup or as part of the euthanasia follow-up, your team hands the family a card with the QR (or a laser-engraved stainless steel plate with our Eternal plan). They scan, fill in their pet\'s details — dogs, cats, birds, rabbits, reptiles or any species — and in minutes they own a living memorial branded with your clinic\'s logo at the footer. Our AI model (Flux Kontext Max) preserves the pet\'s identity with high fidelity, even on rare breeds, specific markings and uncommon coat patterns.',
              'For your clinic this is real differentiation against competing animal hospitals in Austin, Los Angeles, Chicago, Miami, Houston, Dallas, Phoenix, San Diego or wherever you practice. Very few veterinary businesses in the US offer digital grief companionship; you become the reference in your market. On top of retention, you earn 15% commission every time a family upgrades to the Artistic plan, the Eternal plan with physical plate, or adds the AR Portal — passive recurring revenue with zero operational overhead on your side.',
              'Infrastructure is enterprise-grade: TLS everywhere, row-level security on the database, GDPR-equivalent compliance (we comply with Mexico\'s LFPDPPP which mirrors EU GDPR principles), Data Processing Agreements (DPA) available on request for your clinic\'s internal audit. Payments are processed via Stripe with US-native methods (Visa, Mastercard, Amex, Apple Pay, Google Pay). US and Canada shipping on physical plates is included in the partner packs. No monthly fees, no long-term contracts, 30-day satisfaction guarantee.',
            ],
          },
        }}
      />
      <SiteFooterEN />
    </>
  );
}
