import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Props {
  name: string;
  ownerId: string;
  memorialId: string;
}

/**
 * Pantalla digna que se muestra cuando un memorial del plan "Mes de Prueba"
 * llega a su fecha de caducidad.
 *
 * Muestra un mensaje calmo — nada de 404 brusco — y un CTA al usuario dueño
 * del memorial para extenderlo. Los visitantes ven solo el nombre + un
 * mensaje sereno.
 */
export function MemorialExpired({ name, ownerId, memorialId }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-marfil px-6 py-16">
      <div className="max-w-xl w-full text-center">
        <div
          aria-hidden
          className="w-16 h-0.5 bg-dorado-400 mx-auto mb-10 opacity-80"
        />

        <p className="uppercase tracking-[0.35em] text-[11px] text-dorado-700 mb-4">
          En memoria
        </p>

        <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 mb-6 leading-[1.1]">
          {name}
        </h1>

        <p className="text-pizarra-500 text-base leading-relaxed max-w-md mx-auto mb-10">
          Este nicho virtual estaba en el plan de prueba y su tiempo terminó.
          Para que los recuerdos de {name.split(' ')[0]} sigan estando aquí,
          puedes renovar el acceso en cualquier momento.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button asChild variant="dorado" size="lg">
            <Link href={`/dashboard/memorial/${memorialId}/checkout?renew=1`}>
              Extender nicho virtual
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>

        <p className="mt-10 text-xs text-pizarra-400">
          ¿Eres familiar y no tienes acceso a la cuenta? Escríbenos a{' '}
          <a
            href="mailto:hola@historias-infinitas.com"
            className="underline hover:text-dorado-700"
          >
            hola@historias-infinitas.com
          </a>
        </p>
      </div>
    </div>
  );
}
