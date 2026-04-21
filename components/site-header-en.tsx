import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteHeaderEN() {
  return (
    <header className="sticky top-0 z-40 border-b border-pizarra-100/60 bg-marfil/70 backdrop-blur-md">
      <div className="container-solemn flex h-16 items-center justify-between">
        <Link href="/en" className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-dorado-500 animate-glow" />
          <span className="font-serif text-base sm:text-lg md:text-xl tracking-wide text-pizarra-800">
            Historias <span className="text-gradient-dorado">Infinitas</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-pizarra-600">
          <Link href="/en#pets" className="hover:text-pizarra-900 transition">Pets</Link>
          <Link href="/en#loved-ones" className="hover:text-pizarra-900 transition">Loved Ones</Link>
          <Link href="/en/partners" className="hover:text-pizarra-900 transition">For Business</Link>
          <Link href="/en/blog" className="hover:text-pizarra-900 transition">Blog</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/" className="hidden sm:inline text-sm text-pizarra-600 hover:text-pizarra-900">
            🇲🇽 ES
          </Link>
          <Link href="/login" className="hidden sm:inline text-sm text-pizarra-600 hover:text-pizarra-900">
            Sign in
          </Link>
          <Button asChild variant="dorado" size="sm">
            <Link href="/register">Create memorial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
