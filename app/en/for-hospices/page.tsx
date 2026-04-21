import type { Metadata } from 'next';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { VerticalLandingEN } from '../vertical-landing-en';

export const metadata: Metadata = {
  title: 'Digital Memorials for Hospices and Palliative Care',
  description:
    'A gift for families accompanying a loved one in their final days. Digital memorial with biography, AI portrait and QR — with your hospice\'s logo. Plans from $59 USD.',
  alternates: {
    canonical: '/en/for-hospices',
    languages: {
      'es-MX': '/para-hospicios',
      'en-US': '/en/for-hospices',
      'x-default': '/para-hospicios',
    },
  },
  keywords: [
    'hospice digital memorial',
    'palliative care legacy',
    'end of life memorial',
    'legacy documentation hospice',
    'grief support hospice',
    'anticipatory grief',
  ],
  openGraph: {
    title: 'A digital legacy — for Hospices & Palliative Care',
    description:
      'Walk with each family through a memorial that preserves the story, voice and portrait of their loved one.',
    url: '/en/for-hospices',
    locale: 'en_US',
    type: 'article',
  },
};

export default function ForHospicesPage() {
  return (
    <>
      <SiteHeaderEN />
      <VerticalLandingEN
        copy={{
          vertical: 'Hospices and Palliative Care',
          keywordH1: 'hospices',
          canonical: '/en/for-hospices',
          eyebrow: 'For Hospices · Palliative Care · Senior Living Communities',
          h1: (
            <>
              Preserve the story{' '}
              <span className="text-gradient-dorado italic">before it fades away</span>.
            </>
          ),
          intro:
            'In palliative care, every day counts. Offer families a digital memorial they can build with their loved one still present — biography, photos, voice and AI-generated portrait. A legacy that lasts forever, branded with your hospice.',
          pitch: 'A humane way to walk with them to the end',
          benefits: [
            {
              icon: Heart,
              title: 'Build together, in life',
              text:
                'Invite the family to co-create the memorial while their loved one can still participate — share their voice, approve their portrait, choose their epitaph. Therapeutic and healing.',
            },
            {
              icon: HeartHandshake,
              title: 'Your hospice, part of the legacy',
              text:
                'Your logo appears on every memorial. Families associate your care with the most transcendent moment. Real differentiation from generic eldercare providers.',
            },
            {
              icon: TrendingUp,
              title: 'Add value to your service',
              text:
                'Include it in your monthly package as a complementary service. Extra revenue + 15% commission when the family upgrades to the Eternal plan.',
            },
            {
              icon: ShieldCheck,
              title: 'Ethical and discreet',
              text:
                'The memorial stays private until the family decides to publish it. HIPAA-friendly data handling, DPA available. The patient\'s dignity comes first.',
            },
          ],
          testimonial: {
            quote:
              'Seeing a family record their father\'s voice before he passes — and listen to it months later — changes grief itself. The most emotionally valuable tool we\'ve added.',
            author: 'Hospice in Boston · editable testimonial',
          },
          faqs: [
            {
              q: 'What if the loved one passes before the memorial is finished?',
              a: 'The memorial can be completed at any time — the family keeps access. Photos and videos can be added post-facto. There\'s no deadline for publishing.',
            },
            {
              q: 'Is this psychological support or just a technical tool?',
              a: 'We are the technical tool. We recommend integrating it into your emotional accompaniment program. We share the conversation script we\'ve tested with families.',
            },
            {
              q: 'Can we pre-pay for multiple patients at once?',
              a: 'Yes — that\'s exactly the partner plan model. Pack 30 ($299 USD) gives you 30 memorials + 5 physical plates with your logo, valid for 12 months.',
            },
            {
              q: 'Does it work for degenerative illness (Alzheimer\'s, dementia)?',
              a: 'Especially well — families can rescue the story while it\'s still possible. The AI portrait can restore the vital expression of the loved one from older photographs.',
            },
          ],
        }}
      />
      <SiteFooterEN />
    </>
  );
}
