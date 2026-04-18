-- =========================================================================
-- HISTORIAS-INFINITAS :: Fix de warnings del Supabase Database Linter
-- =========================================================================
-- Ejecutar en Supabase Dashboard → SQL Editor. Es idempotente.
--
-- Resuelve:
--   1. function_search_path_mutable  → fija search_path en touch_updated_at
--   2. public_bucket_allows_listing  → dropea las 2 SELECT policies legacy
--                                      del bucket `memorials` (auth_write_*,
--                                      public_read_*). Las URLs públicas
--                                      SIGUEN funcionando (no dependen de
--                                      SELECT policies).
--
-- NO resuelve aquí:
--   - extension_in_public (citext) — mover la extensión rompería las
--     columnas email citext de profiles y partner_accounts. Queda igual.
--   - auth_leaked_password_protection — es un toggle en el Dashboard
--     (Authentication → Policies → Password Protection).
-- =========================================================================

/* ------------------------------------------------------------------------
 * 1. Fijar search_path en touch_updated_at (defensa en profundidad)
 * ---------------------------------------------------------------------- */
alter function public.touch_updated_at() set search_path = public, pg_catalog;

/* ------------------------------------------------------------------------
 * 2. Dropear las SELECT policies legacy del bucket `memorials`.
 *    Estas policies fueron creadas por el UI de Supabase cuando se marcó
 *    el bucket como público. Permiten LISTAR archivos (bucket enumeration)
 *    cosa que los buckets públicos NO necesitan — las URLs directas siguen
 *    funcionando sin ellas.
 * ---------------------------------------------------------------------- */
do $drop_legacy_storage_policies$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and cmd        = 'SELECT'
      and (
        policyname ilike 'auth_write%'
        or policyname ilike 'public_read%'
      )
  loop
    execute format('drop policy %I on storage.objects', pol.policyname);
  end loop;
end
$drop_legacy_storage_policies$;

-- Verificación — debería regresar 0 filas después:
-- select policyname from pg_policies
--  where schemaname='storage' and tablename='objects' and cmd='SELECT'
--    and (policyname ilike 'auth_write%' or policyname ilike 'public_read%');
