import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container-solemn py-16 md:py-24">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
