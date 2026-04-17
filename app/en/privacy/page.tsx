import type { Metadata } from 'next';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';

export const metadata: Metadata = {
  title: 'Privacy Policy — Historias Infinitas',
  description:
    'Privacy policy for Historias Infinitas, the digital memorial platform — how we collect, use and protect your data.',
  alternates: {
    canonical: '/en/privacy',
    languages: {
      'es-MX': '/privacidad',
      'en-US': '/en/privacy',
      'x-default': '/privacidad',
    },
  },
  openGraph: { locale: 'en_US' },
};

const LAST_UPDATED = 'April 17, 2026';

export default function PrivacyEN() {
  return (
    <>
      <SiteHeaderEN />
      <main className="container-solemn py-16 md:py-24">
        <article className="prose-legal mx-auto max-w-3xl">
          <p className="meta">Last updated · {LAST_UPDATED}</p>
          <h1>Privacy Policy</h1>

          <p>
            At <strong>Historias Infinitas</strong> we know the information you
            entrust to us is as intimate as the memories you seek to preserve.
            This policy explains who receives it, for what purpose, what rights
            you have over it, and how to exercise them — in accordance with the
            <strong> California Consumer Privacy Act (CCPA/CPRA)</strong>, the{' '}
            <strong>EU General Data Protection Regulation (GDPR)</strong> for our
            European visitors, and Mexico's{' '}
            <strong>Federal Law on Protection of Personal Data Held by
            Private Parties (LFPDPPP)</strong> where applicable.
          </p>

          <h2>1. Data controller</h2>
          <p>
            <strong>Historias Infinitas</strong> ("Historias Infinitas", "we", "us"),
            with legal name <strong>[LEGAL NAME, LLC / INC.]</strong> and registered
            address at <strong>[FULL ADDRESS]</strong>, is the data controller.
          </p>
          <p>
            Privacy contact:{' '}
            <a href="mailto:privacidad@historias-infinitas.com">
              privacy@historias-infinitas.com
            </a>
          </p>

          <h2>2. Data we collect</h2>
          <ul>
            <li><strong>Identification & contact data</strong>: name, email, phone and — for the Eternal plan — shipping address.</li>
            <li><strong>Data about the deceased or pet being honored</strong>: name, dates of birth and passing, biography, epitaph, photographs and videos you voluntarily upload.</li>
            <li><strong>Billing data</strong>: strictly what's needed for the receipt. Card details are processed directly by Stripe Inc. — we never store them.</li>
            <li><strong>Browsing data</strong>: IP address, browser type, pages visited, time on page — via first-party and third-party cookies.</li>
          </ul>

          <h2>3. Purposes of processing</h2>
          <h3>Primary (necessary to deliver the service)</h3>
          <ul>
            <li>Create and maintain your account.</li>
            <li>Host the digital memorial, generate its unique URL, QR code and AI portrait.</li>
            <li>Process payments and issue receipts.</li>
            <li>For the Eternal plan, produce and ship the stainless steel plate.</li>
            <li>Support and respond to your requests.</li>
            <li>Legal, tax and accounting compliance.</li>
          </ul>
          <h3>Secondary (require consent)</h3>
          <ul>
            <li>News and feature updates.</li>
            <li>Quality and improvement surveys via aggregated analysis.</li>
          </ul>

          <h2>4. Your rights</h2>
          <p>
            Depending on your jurisdiction, you have the right to:
          </p>
          <ul>
            <li><strong>Access</strong> the data we hold about you.</li>
            <li><strong>Rectify</strong> inaccurate data.</li>
            <li><strong>Delete</strong> your data (right to erasure / "right to be forgotten").</li>
            <li><strong>Object</strong> to specific processing.</li>
            <li><strong>Data portability</strong>: receive your data in a machine-readable format.</li>
            <li><strong>Opt out of sale</strong> of personal information (we don't sell, but we confirm).</li>
            <li><strong>Non-discrimination</strong> for exercising these rights.</li>
          </ul>
          <p>
            To exercise them, email{' '}
            <a href="mailto:privacidad@historias-infinitas.com">
              privacy@historias-infinitas.com
            </a>{' '}
            with your full name, the right you want to exercise, and a copy of
            a valid ID (destroyed after verification). We respond within 30 days
            (GDPR) / 45 days (CCPA).
          </p>

          <h2>5. Data transfers & processors</h2>
          <p>We share data only with these technical processors to deliver the service:</p>
          <ul>
            <li><strong>Stripe Inc.</strong> (US) — payment processing. PCI-DSS Level 1.</li>
            <li><strong>Supabase Inc.</strong> (US) — database and media hosting.</li>
            <li><strong>Replicate, Inc.</strong> (US) — AI portrait generation (Flux Kontext).</li>
            <li><strong>Resend</strong> (US) — transactional email.</li>
            <li><strong>Vercel Inc.</strong> (US) — application hosting.</li>
            <li><strong>Competent authorities</strong> when required by law.</li>
          </ul>
          <p>
            We <strong>do not sell, rent or trade</strong> your personal information.
          </p>

          <h2>6. Security & retention</h2>
          <p>
            We implement reasonable administrative, technical and physical
            safeguards — TLS encryption in transit, encryption at rest, role-based
            access control and audit logs. We retain your data while your account
            is active plus a reasonable period to comply with tax obligations
            (typically 5–7 years in the US).
          </p>

          <h2>7. Cookies</h2>
          <p>
            We use strictly necessary cookies (session, preferences) and
            aggregate analytics. You can disable cookies from your browser —
            some features may be affected.
          </p>

          <h2>8. Children</h2>
          <p>
            Our service is not directed to children under 13 (COPPA) / 16 (GDPR).
            We do not knowingly collect data from minors.
          </p>

          <h2>9. Changes</h2>
          <p>
            This policy may be updated to reflect legal or operational changes.
            We'll publish any modifications here and update the date at the top.
            Material changes are notified by email at least 30 days in advance.
          </p>

          <hr className="my-10 border-pizarra-100" />
          <p className="text-sm text-pizarra-500">
            By registering or using our service, you acknowledge you've read and
            accepted this Privacy Policy.
          </p>
        </article>
      </main>
      <SiteFooterEN />
    </>
  );
}
