import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-marfil">
      <div className="text-center max-w-md">
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">404</p>
        <h1 className="font-serif text-4xl text-pizarra-800 mb-3">
          Memorial no encontrado
        </h1>
        <p className="text-pizarra-500 mb-8">
          Este memorial no existe o aún no ha sido publicado.
        </p>
        <Button asChild variant="dorado">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
