import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com';

/**
 * Sitemap dinámico.
 *
 * Incluye páginas estáticas principales + todos los memoriales publicados
 * (no los borradores). Se regenera con ISR — no hace falta build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                       changeFrequency: 'weekly',  priority: 1.0, lastModified: new Date() },
    { url: `${SITE_URL}/partners`,               changeFrequency: 'weekly',  priority: 0.9, lastModified: new Date() },
    { url: `${SITE_URL}/para-funerarias`,        changeFrequency: 'weekly',  priority: 0.9, lastModified: new Date() },
    { url: `${SITE_URL}/para-clinicas-veterinarias`, changeFrequency: 'weekly', priority: 0.9, lastModified: new Date() },
    { url: `${SITE_URL}/para-hospicios`,         changeFrequency: 'weekly',  priority: 0.8, lastModified: new Date() },
    { url: `${SITE_URL}/contacto`,               changeFrequency: 'monthly', priority: 0.5, lastModified: new Date() },
    { url: `${SITE_URL}/privacidad`,             changeFrequency: 'yearly',  priority: 0.3, lastModified: new Date() },
    { url: `${SITE_URL}/terminos`,               changeFrequency: 'yearly',  priority: 0.3, lastModified: new Date() },
    { url: `${SITE_URL}/login`,                  changeFrequency: 'yearly',  priority: 0.2, lastModified: new Date() },
    { url: `${SITE_URL}/register`,               changeFrequency: 'yearly',  priority: 0.4, lastModified: new Date() },
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
