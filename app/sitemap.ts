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
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
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
