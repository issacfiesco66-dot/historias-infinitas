'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Elimina un memorial y todo lo que cuelga de él.
 *
 * - Valida ownership (el caller debe ser el owner).
 * - Limpia los archivos de Storage del bucket `memorials` bajo la carpeta
 *   `{memorial.id}/...` (best-effort — si falla no bloquea la eliminación).
 * - Borra la fila en `memorials`; las FKs con `on delete cascade` limpian
 *   `memorial_media`, `ai_generations` y `orders`.
 * - Revalida el dashboard.
 */
export async function deleteMemorial(memorialId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'no_autenticado' };

  // Ownership
  const { data: memorial, error: fetchErr } = await supabase
    .from('memorials')
    .select('id, owner_id')
    .eq('id', memorialId)
    .single();

  if (fetchErr || !memorial) return { ok: false, error: 'memorial_no_encontrado' };
  if (memorial.owner_id !== user.id) return { ok: false, error: 'sin_permiso' };

  const admin = createAdminClient();

  // Limpieza de Storage — listar y borrar archivos del memorial.
  try {
    const { data: files } = await admin.storage
      .from('memorials')
      .list(memorial.id, { limit: 1000 });
    if (files && files.length > 0) {
      const paths = files.map((f) => `${memorial.id}/${f.name}`);
      await admin.storage.from('memorials').remove(paths);
    }
  } catch {
    // No bloquear la eliminación del memorial si Storage falla.
  }

  // Borrar memorial (cascade limpia media, ai_generations, orders).
  const { error: deleteErr } = await admin
    .from('memorials')
    .delete()
    .eq('id', memorial.id)
    .eq('owner_id', user.id);

  if (deleteErr) return { ok: false, error: deleteErr.message };

  revalidatePath('/dashboard');
  return { ok: true };
}
