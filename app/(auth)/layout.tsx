import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Iniciar sesión — Historias Infinitas',
  description: 'Accede a tu cuenta de Historias Infinitas y gestiona los memoriales de quienes amas.',
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:flex items-center justify-center bg-marfil p-8">
        <Image
          src="/images/login-registro.png"
          alt="Historias Infinitas — creando un lugar eterno para tus recuerdos"
          width={1408}
          height={768}
          priority
          className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-solemn"
        />
        <Link
          href="/"
          className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 rounded-full bg-marfil/90 hover:bg-marfil text-pizarra-800 text-sm px-4 py-2 shadow-sm transition"
        >
          ← Volver al inicio
        </Link>
      </div>

      <div className="flex items-center justify-center p-8 md:p-16 bg-marfil">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
