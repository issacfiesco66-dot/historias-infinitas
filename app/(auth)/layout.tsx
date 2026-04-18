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
      <div className="relative hidden md:block">
        <Image
          src="/images/login-registro.png"
          alt="Historias Infinitas — creando un lugar eterno para tus recuerdos"
          fill
          priority
          sizes="50vw"
          className="object-cover object-[center_40%]"
        />
        <Link
          href="/"
          className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 rounded-full bg-marfil/90 hover:bg-marfil text-pizarra-800 text-sm px-4 py-2 shadow-sm transition backdrop-blur"
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
