import { Heart } from 'lucide-react';
import { getMemorialStats } from '@/lib/memorial-stats';

type Variant = 'footer' | 'hero';
type Lang = 'es' | 'en';

interface Props {
  variant?: Variant;
  lang?: Lang;
}

/**
 * Badge discreto con el conteo de memoriales publicados. Sólo se renderiza
 * cuando el total alcanza un umbral mínimo — evita mostrar "2 vidas" en días
 * de lanzamiento.
 */
export async function MemorialCounter({ variant = 'footer', lang = 'es' }: Props) {
  const { total, weekly } = await getMemorialStats();

  // Umbral mínimo para que el contador no se sienta vacío al lanzar.
  const MIN_THRESHOLD = 10;
  if (total < MIN_THRESHOLD) return null;

  const formatted = total.toLocaleString(lang === 'en' ? 'en-US' : 'es-MX');
  const weeklyFormatted = weekly.toLocaleString(lang === 'en' ? 'en-US' : 'es-MX');

  const t = {
    es: {
      honor: 'vidas honradas',
      week: 'esta semana',
    },
    en: {
      honor: 'lives honored',
      week: 'this week',
    },
  }[lang];

  if (variant === 'hero') {
    return (
      <div className="inline-flex items-center gap-3 rounded-full border border-dorado-300/50 bg-dorado-50/60 px-5 py-2.5 text-sm text-pizarra-700 backdrop-blur-sm">
        <Heart className="h-4 w-4 text-dorado-500 fill-dorado-200" />
        <span>
          <strong className="text-pizarra-900 font-serif text-base">{formatted}</strong>{' '}
          {t.honor}
          {weekly > 0 && (
            <>
              {' · '}
              <span className="text-pizarra-500">
                +{weeklyFormatted} {t.week}
              </span>
            </>
          )}
        </span>
      </div>
    );
  }

  // variant 'footer'
  return (
    <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-marfil/50">
      <Heart className="h-3 w-3 text-dorado-300" />
      <span>
        {formatted} {t.honor}
        {weekly > 0 && ` · +${weeklyFormatted} ${t.week}`}
      </span>
    </p>
  );
}
