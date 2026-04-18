-- ============================================================================
-- Memoriales con caducidad — soporte para el plan "Mes de Prueba" ($100 MXN).
-- Aplicar en Supabase SQL Editor una sola vez.
--
-- Cómo funciona:
--   · Los memoriales permanentes (digital/artístico/eterno) NO se tocan —
--     `expires_at` queda NULL y siguen viviendo para siempre.
--   · Los memoriales del plan trial obtienen `expires_at = now() + interval '30 days'`
--     al momento del pago (lógica en /api/stripe/webhook).
--   · La página pública `/memorial/[slug]` comprueba `expires_at` en cada render
--     — si ya pasó, muestra la página de "memorial expirado" con CTA para
--     extender. No se necesita un cron: la comprobación es en tiempo real.
-- ============================================================================

-- Columna nueva — nullable, así los memoriales existentes no requieren backfill.
alter table public.memorials
  add column if not exists expires_at timestamptz null;

-- Índice parcial: solo indexa los memoriales con fecha de caducidad, útil
-- para reportes administrativos ("listar memoriales que vencen esta semana")
-- sin pagar el coste de indexar todos los millones de filas permanentes.
create index if not exists memorials_expires_at_idx
  on public.memorials(expires_at)
  where expires_at is not null;

-- Comentario de documentación en la columna para que quien abra el esquema
-- en un cliente SQL entienda el propósito sin mirar código.
comment on column public.memorials.expires_at is
  'Fecha en la que el memorial deja de ser visible públicamente. NULL = permanente (planes digital/artistico/eterno). Se llena al pagar el plan trial_mensual.';
