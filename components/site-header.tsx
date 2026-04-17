import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-pizarra-100/60 bg-marfil/70 backdrop-blur-md">
      <div className="container-solemn flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-dorado-500 animate-glow" />
          <span className="font-serif text-base sm:text-lg md:text-xl tracking-wide text-pizarra-800">
            Historias <span className="text-gradient-dorado">Infinitas</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-pizarra-600">
          <Link href="/#mascotas" className="hover:text-pizarra-900 transition">Mascotas</Link>
          <Link href="/#seres-queridos" className="hover:text-pizarra-900 transition">Seres Queridos</Link>
          <Link href="/#como-funciona" className="hover:text-pizarra-900 transition">Cómo funciona</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline text-sm text-pizarra-600 hover:text-pizarra-900">
            Iniciar sesión
          </Link>
          <Button asChild variant="dorado" size="sm">
            <Link href="/register">Crear memorial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
