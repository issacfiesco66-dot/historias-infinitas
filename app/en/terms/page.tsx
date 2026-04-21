import type { Metadata } from 'next';
import { SiteHeaderEN } from '@/components/site-header-en';
import { SiteFooterEN } from '@/components/site-footer-en';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';

const bcLd = breadcrumbJsonLd([
  { name: 'Home', path: '/en' },
  { name: 'Terms of Service', path: '/en/terms' },
]);

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for Historias Infinitas — the digital memorial platform. Governing law, user rights, refund policy.',
  alternates: {
    canonical: '/en/terms',
    languages: {
      'es-MX': '/terminos',
      'en-US': '/en/terms',
      'x-default': '/terminos',
    },
  },
  openGraph: { locale: 'en_US' },
};

const LAST_UPDATED = 'April 17, 2026';

export default function TermsEN() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bcLd) }}
      />
      <SiteHeaderEN />
      <main className="container-solemn py-16 md:py-24">
        <article className="prose-legal mx-auto max-w-3xl">
          <p className="meta">Last updated · {LAST_UPDATED}</p>
          <h1>Terms of Service</h1>

          <p>
            These Terms of Service ("Terms") govern your use of{' '}
            <strong>historias-infinitas.com</strong> and the services provided
            through it. By registering or purchasing any plan you acknowledge
            you have read, understood and accepted these Terms in full.
          </p>

          <h2>1. Provider</h2>
          <p>
            <strong>[LEGAL NAME, LLC / INC.]</strong> ("Historias Infinitas"),
            registered at <strong>[FULL ADDRESS]</strong>, is the service
            provider.
            <br />
            Contact: <a href="mailto:hola@historias-infinitas.com">hello@historias-infinitas.com</a>
          </p>

          <h2>2. Service description</h2>
          <p>
            Historias Infinitas is a platform that lets you create a{' '}
            <strong>digital memorial</strong> for a loved one or pet, with
            biography, photographs, videos, an AI-generated artistic portrait
            and optionally an Augmented Reality portal. Each memorial is tied
            to a <strong>permanent unique URL</strong> and a printable QR code.
          </p>
          <p>Plans (prices in USD):</p>
          <ul>
            <li><strong>Digital</strong> — online memorial + digital QR.</li>
            <li><strong>Artistic</strong> — Digital + AI portrait + 3 styles + downloadable file.</li>
            <li><strong>Eternal</strong> — Artistic + physical stainless steel plate with engraved QR + US/Canada shipping.</li>
          </ul>
          <p>Optional add-on: <strong>Augmented Reality Portal</strong>.</p>

          <h2>3. Registration & account</h2>
          <p>
            You must create an account with a valid email. You represent you
            are 18+ and have legal capacity to contract. You are responsible for
            maintaining the confidentiality of your password.
          </p>

          <h2>4. Pricing, payment & invoicing</h2>
          <p>
            Prices are shown in USD and exclude applicable sales tax. Payment is
            processed through <strong>Stripe</strong>; we don't store card data.
            W-9 available on request for US business partners.
          </p>

          <h2>5. Memorial activation</h2>
          <p>
            The memorial stays in <strong>private draft mode</strong> until payment
            is completed. After confirmation, its public URL and QR become
            permanently available, subject to continued compliance with these Terms.
          </p>

          <h2>6. Cancellation & refunds</h2>
          <p>
            You may cancel your purchase within <strong>30 days</strong> of
            payment for a full refund, provided:
          </p>
          <ul>
            <li>The AI portrait has not yet been generated, and</li>
            <li>For the Eternal plan, the physical plate has not entered production.</li>
          </ul>
          <p>
            Once the portrait is generated or the plate enters production, the
            purchase is considered executed. However, our{' '}
            <strong>satisfaction guarantee</strong> applies: if the AI portrait
            doesn't capture the essence of your loved one, we regenerate it at
            no cost until it does.
          </p>

          <h2>7. Shipping (Eternal plan)</h2>
          <p>
            The physical plate ships within the United States and Canada in an
            estimated <strong>10–21 business days</strong> from payment
            confirmation. Times may vary due to factors beyond our control
            (weather, customs, carrier strikes).
          </p>

          <h2>8. User content & license</h2>
          <p>
            You own the photographs, videos and texts you upload. By uploading
            them you grant us a <strong>limited, non-exclusive, royalty-free,
            revocable</strong> license to process, host, display them on the
            memorial's public URL and — when included in your plan — generate
            the derived AI portrait. This license ends when you delete the memorial.
          </p>
          <p>You warrant that:</p>
          <ul>
            <li>You own the rights or have authorization for use.</li>
            <li>You have consent of identifiable persons (or their next of kin, where applicable).</li>
            <li>Content doesn't infringe copyright, trademark, privacy or image rights.</li>
          </ul>

          <h2>9. Prohibited uses</h2>
          <ul>
            <li>Unlawful, offensive, defamatory or hate-inciting content.</li>
            <li>Impersonating third parties or deceased persons without authorization.</li>
            <li>Distributing malware or reverse-engineering our systems.</li>
            <li>Unauthorized commercial exploitation.</li>
          </ul>

          <h2>10. Intellectual property</h2>
          <p>
            The "Historias Infinitas" mark, logo, site design, source code and
            institutional copy belong to Historias Infinitas or its licensors,
            protected by US copyright and trademark law. Reproduction without
            written authorization is prohibited.
          </p>

          <h2>11. AI-generated portraits</h2>
          <p>
            Portraits are generated with the third-party model "Flux Kontext"
            (Black Forest Labs) via Replicate, Inc. The result is an artistic
            interpretation; while we prioritize identity preservation, we cannot
            guarantee absolute fidelity to the source photograph.
          </p>

          <h2>12. Availability & "eternal" hosting</h2>
          <p>
            We aim for 24/7 availability. The "eternal" hosting commitment means
            we dedicate reasonable resources to preserve memorials for as long
            as Historias Infinitas exists. If we cease operations, we'll give a
            minimum of <strong>90 days</strong> notice and provide a data export.
          </p>

          <h2>13. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, our liability for any claim
            related to the service is limited to the amount you actually paid in
            the past twelve (12) months. We are not liable for indirect, incidental
            or consequential damages, nor for loss of content due to causes
            beyond our control.
          </p>

          <h2>14. Changes</h2>
          <p>
            We may update these Terms. New versions are published at this URL
            with the date updated. Material changes are emailed to you at least
            <strong> 30 days</strong> in advance.
          </p>

          <h2>15. Governing law & jurisdiction</h2>
          <p>
            These Terms are governed by the laws of the{' '}
            <strong>State of [STATE], United States</strong>, for US customers,
            and by Mexican federal law for Mexican customers. Any dispute will
            be resolved in the courts of <strong>[COUNTY, STATE]</strong> — the
            parties waive any other forum.
          </p>

          <h2>16. Contact</h2>
          <p>
            For questions on these Terms email{' '}
            <a href="mailto:hola@historias-infinitas.com">hello@historias-infinitas.com</a>
            {' '}or visit <a href="/en/contact">our contact page</a>.
          </p>
        </article>
      </main>
      <SiteFooterEN />
    </>
  );
}
