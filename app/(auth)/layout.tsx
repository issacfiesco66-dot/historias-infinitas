import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Iniciar sesión — Historias Infinitas',
  description: 'Accede a tu cuenta de Historias Infinitas y gestiona los memoriales de quienes amas.',
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/hi-auth/1600/1200)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-pizarra-800/60" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-marfil">
          <Link href="/" className="font-serif text-2xl">
            Historias <span className="text-gradient-dorado">Infinitas</span>
          </Link>
          <blockquote className="max-w-md">
            <p className="font-serif text-3xl leading-snug italic">
              "Los que amamos no se van, viven con nosotros en cada atardecer."
            </p>
            <p className="mt-4 text-sm text-marfil/60 uppercase tracking-widest">— Anónimo</p>
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-16 bg-marfil">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
