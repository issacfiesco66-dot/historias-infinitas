import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CalBookingScript } from '@/components/cal-booking';

export default function VerticalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <CalBookingScript />
      {children}
      <SiteFooter />
    </>
  );
}
