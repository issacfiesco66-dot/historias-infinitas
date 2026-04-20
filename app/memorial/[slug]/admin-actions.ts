'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail, getAdminEmails } from '@/lib/admin';
import { getResend, EMAIL_FROM, EMAIL_REPLY_TO } from '@/lib/emails/client';

type Result = { ok: true } | { ok: false; error: string };

type Action = 'hide' | 'unhide' | 'delete';

async function guardAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { ok: false as const, error: 'sin_permiso' };
  }
  return { ok: true as const, email: user.email! };
}

async function notifyAdmins(
  action: Action,
  moderatorEmail: string,
  memorial: { id: string; slug: string; name: string },
  reason: string | null,
) {
  try {
    const recipients = getAdminEmails();
    if (recipients.length === 0) return;

    const label =
      action === 'hide'   ? 'Nicho Virtual OCULTADO' :
      action === 'unhide' ? 'Nicho Virtual RE-PUBLICADO' :
                            'Nicho Virtual ELIMINADO';

    const subject = `[Moderación] ${label}: ${memorial.name}`;
    const html = `
      <h2>${label}</h2>
      <p><strong>Nicho Virtual:</strong> ${escapeHtml(memorial.name)}</p>
      <p><strong>Slug:</strong> <code>/memorial/${memorial.slug}</code></p>
      <p><strong>ID:</strong> <code>${memorial.id}</code></p>
      <p><strong>Moderador:</strong> ${escapeHtml(moderatorEmail)}</p>
      ${reason ? `<p><strong>Razón:</strong> ${escapeHtml(reason)}</p>` : ''}
      <p style="color:#6b7280;font-size:12px;">Acción automática desde el panel público de admin.</p>
    `.trim();

    const resend = getResend();
    await resend.emails.send({
      from: EMAIL_FROM,
      to: recipients,
      reply_to: EMAIL_REPLY_TO,
      subject,
      html,
    });
  } catch (err) {
    console.error('[moderation] fallo al notificar admins:', err);
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function hideMemorial(slug: string, reason: string): Promise<Result> {
  const guard = await guardAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (reason.trim().length < 5) {
    return { ok: false, error: 'Razón muy corta (mínimo 5 caracteres).' };
  }

  const admin = createAdminClient();
  const { data: memorial, error: fetchErr } = await admin
    .from('memorials')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();
  if (fetchErr || !memorial) return { ok: false, error: 'memorial_no_encontrado' };

  const { error } = await admin
    .from('memorials')
    .update({ status: 'privado' })
    .eq('id', memorial.id);
  if (error) return { ok: false, error: error.message };

  console.info(
    `[moderation] ${guard.email} OCULTÓ memorial ${memorial.id} (${memorial.slug}) — razón: ${reason}`,
  );
  await notifyAdmins('hide', guard.email, memorial, reason);

  revalidatePath(`/memorial/${memorial.slug}`);
  return { ok: true };
}

export async function unhideMemorial(slug: string): Promise<Result> {
  const guard = await guardAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const admin = createAdminClient();
  const { data: memorial, error: fetchErr } = await admin
    .from('memorials')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();
  if (fetchErr || !memorial) return { ok: false, error: 'memorial_no_encontrado' };

  const { error } = await admin
    .from('memorials')
    .update({ status: 'publicado' })
    .eq('id', memorial.id);
  if (error) return { ok: false, error: error.message };

  console.info(`[moderation] ${guard.email} RE-PUBLICÓ memorial ${memorial.id} (${memorial.slug})`);
  await notifyAdmins('unhide', guard.email, memorial, null);

  revalidatePath(`/memorial/${memorial.slug}`);
  return { ok: true };
}

export async function adminDeleteMemorial(slug: string, reason: string): Promise<Result> {
  const guard = await guardAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (reason.trim().length < 5) {
    return { ok: false, error: 'Razón muy corta (mínimo 5 caracteres).' };
  }

  const admin = createAdminClient();
  const { data: memorial, error: fetchErr } = await admin
    .from('memorials')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();
  if (fetchErr || !memorial) return { ok: false, error: 'memorial_no_encontrado' };

  // Limpieza de Storage
  try {
    const { data: files } = await admin.storage.from('memorials').list(memorial.id, { limit: 1000 });
    if (files && files.length > 0) {
      await admin.storage.from('memorials').remove(files.map((f) => `${memorial.id}/${f.name}`));
    }
  } catch { /* no bloquear */ }

  const { error } = await admin.from('memorials').delete().eq('id', memorial.id);
  if (error) return { ok: false, error: error.message };

  console.warn(
    `[moderation] ${guard.email} ELIMINÓ memorial ${memorial.id} (${memorial.slug}) — razón: ${reason}`,
  );
  await notifyAdmins('delete', guard.email, memorial, reason);

  redirect('/dashboard/admin');
}
