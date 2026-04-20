import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Conteo público de memoriales publicados (total + últimos 7 días).
 * Cacheado 10 min a nivel de Next.js — el contador no necesita ser real-time.
 */
export const getMemorialStats = unstable_cache(
  async (): Promise<{ total: number; weekly: number }> => {
    try {
      const admin = createAdminClient();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [totalRes, weeklyRes] = await Promise.all([
        admin.from('memorials').select('id', { count: 'exact', head: true }).eq('status', 'publicado'),
        admin
          .from('memorials')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'publicado')
          .gte('created_at', weekAgo),
      ]);

      return {
        total: totalRes.count ?? 0,
        weekly: weeklyRes.count ?? 0,
      };
    } catch {
      return { total: 0, weekly: 0 };
    }
  },
  ['memorial-stats-v1'],
  { revalidate: 600, tags: ['memorial-stats'] },
);
