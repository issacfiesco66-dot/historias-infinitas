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
      <div className="relative hidden md:block bg-pizarra-900">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/login-registro.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-marfil">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-marfil/80 hover:text-marfil transition"
          >
            ← Volver al inicio
          </Link>
          <span aria-hidden />
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:p-16 bg-marfil">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
