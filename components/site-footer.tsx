import Link from 'next/link';
import { MemorialCounter } from './memorial-counter';

export async function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-pizarra-100/70 bg-pizarra-700 text-marfil">
      <div className="container-solemn py-12 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">
            Historias <span className="text-gradient-dorado">Infinitas</span>
          </p>
          <p className="mt-3 text-sm text-marfil/70 max-w-sm">
            Preservamos la memoria con tecnología e intención. Cada vida merece un lugar
            eterno donde ser recordada.
          </p>
        </div>
        <div className="text-sm space-y-2">
          <p className="uppercase tracking-widest text-xs text-dorado-300 mb-2">Explorar</p>
          <Link className="block hover:text-dorado-300" href="/#mascotas">Nichos Virtuales de Mascotas</Link>
          <Link className="block hover:text-dorado-300" href="/#seres-queridos">Nichos Virtuales de Seres Queridos</Link>
          <Link className="block hover:text-dorado-300" href="/#como-funciona">Cómo funciona</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="uppercase tracking-widest text-xs text-dorado-300 mb-2">Legal</p>
          <Link className="block hover:text-dorado-300" href="/privacidad">Aviso de Privacidad</Link>
          <Link className="block hover:text-dorado-300" href="/terminos">Términos y Condiciones</Link>
          <Link className="block hover:text-dorado-300" href="/contacto">Contacto</Link>
        </div>
      </div>
      <div className="border-t border-marfil/10 py-6 text-center text-xs text-marfil/50 space-y-2">
        <MemorialCounter variant="footer" lang="es" />
        <p>© {new Date().getFullYear()} Historias Infinitas · Hecho con cuidado</p>
      </div>
    </footer>
  );
}
