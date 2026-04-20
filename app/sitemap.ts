import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

/**
 * Sitemap dinámico.
 *
 * Incluye páginas estáticas principales + todos los memoriales publicados
 * (no los borradores). Se regenera con ISR — no hace falta build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Añadimos alternates por idioma en cada ruta "con par" — Google usa esto
  // como señal fuerte de hreflang para seleccionar la versión correcta.
  const now = new Date();
  const pair = (esPath: string, enPath: string, opts: { priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }) => [
    {
      url: `${SITE_URL}${esPath}`,
      lastModified: now,
      changeFrequency: opts.changeFrequency,
      priority: opts.priority,
      alternates: {
        languages: {
          es: `${SITE_URL}${esPath}`,
          en: `${SITE_URL}${enPath}`,
          'x-default': `${SITE_URL}${esPath}`,
        },
      },
    },
    {
      url: `${SITE_URL}${enPath}`,
      lastModified: now,
      changeFrequency: opts.changeFrequency,
      priority: opts.priority,
      alternates: {
        languages: {
          es: `${SITE_URL}${esPath}`,
          en: `${SITE_URL}${enPath}`,
          'x-default': `${SITE_URL}${esPath}`,
        },
      },
    },
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    ...pair('/',                         '/en',                        { priority: 1.0, changeFrequency: 'weekly' }),
    ...pair('/partners',                 '/en/partners',               { priority: 0.9, changeFrequency: 'weekly' }),
    ...pair('/para-funerarias',          '/en/for-funeral-homes',      { priority: 0.9, changeFrequency: 'weekly' }),
    ...pair('/para-clinicas-veterinarias','/en/for-veterinary-clinics',{ priority: 0.9, changeFrequency: 'weekly' }),
    ...pair('/para-hospicios',           '/en/for-hospices',           { priority: 0.8, changeFrequency: 'weekly' }),
    ...pair('/contacto',                 '/en/contact',                { priority: 0.5, changeFrequency: 'monthly' }),
    ...pair('/privacidad',               '/en/privacy',                { priority: 0.3, changeFrequency: 'yearly' }),
    ...pair('/terminos',                 '/en/terms',                  { priority: 0.3, changeFrequency: 'yearly' }),
    { url: `${SITE_URL}/login`,    lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];

  // Memoriales públicos
  let memorialRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('memorials')
      .select('slug, updated_at, created_at')
      .eq('status', 'publicado')
      .order('updated_at', { ascending: false })
      .limit(10000);

    memorialRoutes =
      data?.map((m) => ({
        url: `${SITE_URL}/memorial/${m.slug}`,
        lastModified: new Date(m.updated_at ?? m.created_at ?? Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })) ?? [];
  } catch {
    // Si Supabase no responde durante el build, devolvemos solo las rutas
    // estáticas — mejor un sitemap pequeño que un 500.
  }

  return [...staticRoutes, ...memorialRoutes];
}
