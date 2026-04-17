/**
 * Helper compartido para restringir páginas y server actions al administrador.
 * Usa ADMIN_EMAILS (env var) — separados por coma si hay varios.
 *
 * En servidor. No importar desde Client Components.
 */

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
