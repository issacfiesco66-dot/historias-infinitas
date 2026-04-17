-- =========================================================================
-- HISTORIAS-INFINITAS :: Security Hardening (2026-04-17)
-- =========================================================================
-- Correr DESPUÉS de schema.sql / orders.sql / stripe.sql / partners.sql.
-- Idempotente — seguro de re-ejecutar.
--
-- Cubre:
--   1. RLS activa y verificada en todas las tablas privadas.
--   2. Políticas mínimamente privilegiadas por tabla.
--   3. search_path fijado en SECURITY DEFINER functions (defensa en profundidad).
--   4. Políticas de Storage sobre el bucket `memorials`.
--
-- NOTA STORAGE BUCKET:
--   Si tu bucket `memorials` está en modo PÚBLICO, las policies de abajo
--   no cambian el acceso: cualquiera con la URL puede ver los archivos.
--   RECOMENDADO: en Supabase Dashboard → Storage → memorials → desmarcar
--   "Public bucket" y usar signed URLs desde el servidor (helper abajo).
-- =========================================================================

/* ------------------------------------------------------------------------
 * 1. RLS activa en todas las tablas privadas
 * ---------------------------------------------------------------------- */
alter table if exists public.profiles            enable row level security;
alter table if exists public.memorials           enable row level security;
alter table if exists public.memorial_media      enable row level security;
alter table if exists public.ai_generations      enable row level security;
alter table if exists public.orders              enable row level security;
alter table if exists public.stripe_events       enable row level security;
alter table if exists public.partner_accounts    enable row level security;
alter table if exists public.partner_credits_log enable row level security;
alter table if exists public.partner_commissions enable row level security;

/* ------------------------------------------------------------------------
 * 2. Políticas de service_role (webhook / admin actions)
 *    Granted únicamente al rol de servicio — NUNCA a authenticated/anon.
 * ---------------------------------------------------------------------- */
do $svc$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles','memorials','memorial_media','ai_generations',
      'orders','stripe_events','partner_accounts',
      'partner_credits_log','partner_commissions'
    ])
  loop
    execute format('drop policy if exists %I on public.%I', t || '_service_all', t);
    execute format(
      'create policy %I on public.%I for all to service_role using (true) with check (true)',
      t || '_service_all', t
    );
  end loop;
end
$svc$;

/* ------------------------------------------------------------------------
 * 3. Políticas de authenticated / anon  —  ownership estricto
 * ---------------------------------------------------------------------- */

-- profiles: el usuario solo ve y edita su propio perfil
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id);

-- memorials: owner ve y edita los suyos; cualquiera puede leer los 'publicado'
drop policy if exists "memorials_owner_all" on public.memorials;
create policy "memorials_owner_all"
  on public.memorials for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "memorials_public_select" on public.memorials;
create policy "memorials_public_select"
  on public.memorials for select
  using (status = 'publicado');

-- memorial_media: owner ve/edita los de sus memoriales; público ve los de memoriales publicados
drop policy if exists "memorial_media_owner_all" on public.memorial_media;
create policy "memorial_media_owner_all"
  on public.memorial_media for all
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_media.memorial_id and m.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_media.memorial_id and m.owner_id = auth.uid()
    )
  );

drop policy if exists "memorial_media_public_select" on public.memorial_media;
create policy "memorial_media_public_select"
  on public.memorial_media for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_media.memorial_id and m.status = 'publicado'
    )
  );

-- ai_generations: solo el owner del memorial puede ver las suyas
drop policy if exists "ai_generations_owner_select" on public.ai_generations;
create policy "ai_generations_owner_select"
  on public.ai_generations for select
  using (auth.uid() = user_id);

-- NO damos insert/update/delete a authenticated — esas operaciones
-- las hace el service_role desde el webhook o el endpoint /api/ai/portrait.

-- orders: solo el dueño
drop policy if exists "orders_owner_select" on public.orders;
create policy "orders_owner_select"
  on public.orders for select
  using (auth.uid() = user_id);

-- stripe_events: NO es accesible a authenticated/anon. Solo service_role.
-- (Sin policies para auth/anon = denegado por default cuando RLS está on.)

-- partner_accounts: el partner ve y actualiza solo su cuenta
drop policy if exists "partner_self_select" on public.partner_accounts;
create policy "partner_self_select"
  on public.partner_accounts for select
  using (auth.uid() = user_id);

drop policy if exists "partner_self_update" on public.partner_accounts;
create policy "partner_self_update"
  on public.partner_accounts for update
  using (auth.uid() = user_id);

-- partner_credits_log y partner_commissions ya tienen policies seguras en partners.sql

/* ------------------------------------------------------------------------
 * 4. SECURITY DEFINER functions — search_path fijado (defensa en profundidad)
 *    (Ya está en partners.sql; este bloque solo verifica idempotencia.)
 * ---------------------------------------------------------------------- */

-- Nada extra: link_partner_on_signup y consume_partner_credit ya usan
--    SECURITY DEFINER + SET search_path = public.

/* ------------------------------------------------------------------------
 * 5. Storage: políticas para el bucket `memorials`
 *    Supabase expone storage.objects con RLS. Debemos tener policies
 *    claras aunque el bucket sea público (redundancia segura).
 * ---------------------------------------------------------------------- */

-- Asegura RLS en storage.objects (Supabase lo tiene ON por default pero por si acaso).
alter table if exists storage.objects enable row level security;

-- Limpieza idempotente
drop policy if exists "memorials_owner_upload"  on storage.objects;
drop policy if exists "memorials_owner_update"  on storage.objects;
drop policy if exists "memorials_owner_delete"  on storage.objects;
drop policy if exists "memorials_public_read"   on storage.objects;
drop policy if exists "memorials_owner_read"    on storage.objects;

-- Convención de path: `{memorial_id}/archivo.ext`  ó  `avatars/{uid}/…`
-- Solo el owner del memorial puede subir/actualizar/borrar en su carpeta.
create policy "memorials_owner_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'memorials'
    and (
      -- memorial: primer segmento = uuid del memorial propio
      (
        split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and exists (
          select 1 from public.memorials m
          where m.id::text = split_part(name, '/', 1)
            and m.owner_id = auth.uid()
        )
      )
      or
      -- partner logo: carpeta "partners/{partner_id}/..."
      (
        split_part(name, '/', 1) = 'partners'
        and exists (
          select 1 from public.partner_accounts p
          where p.id::text = split_part(name, '/', 2)
            and p.user_id = auth.uid()
        )
      )
    )
  );

create policy "memorials_owner_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'memorials'
    and (
      (
        split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and exists (
          select 1 from public.memorials m
          where m.id::text = split_part(name, '/', 1)
            and m.owner_id = auth.uid()
        )
      )
      or
      (
        split_part(name, '/', 1) = 'partners'
        and exists (
          select 1 from public.partner_accounts p
          where p.id::text = split_part(name, '/', 2)
            and p.user_id = auth.uid()
        )
      )
    )
  );

create policy "memorials_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'memorials'
    and (
      (
        split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and exists (
          select 1 from public.memorials m
          where m.id::text = split_part(name, '/', 1)
            and m.owner_id = auth.uid()
        )
      )
      or
      (
        split_part(name, '/', 1) = 'partners'
        and exists (
          select 1 from public.partner_accounts p
          where p.id::text = split_part(name, '/', 2)
            and p.user_id = auth.uid()
        )
      )
    )
  );

-- Lectura: si el bucket es público el CDN responde igual, pero añadimos
-- policy explícita por claridad y para cuando cambies a bucket privado.
create policy "memorials_public_read"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'memorials'
    and exists (
      select 1 from public.memorials m
      where m.id::text = split_part(name, '/', 1)
        and m.status = 'publicado'
    )
  );

create policy "memorials_owner_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'memorials'
    and (
      (
        split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        and exists (
          select 1 from public.memorials m
          where m.id::text = split_part(name, '/', 1)
            and m.owner_id = auth.uid()
        )
      )
      or
      (
        split_part(name, '/', 1) = 'partners'
        and exists (
          select 1 from public.partner_accounts p
          where p.id::text = split_part(name, '/', 2)
            and p.user_id = auth.uid()
        )
      )
    )
  );

/* ------------------------------------------------------------------------
 * 6. Para que el storage sea realmente privado:
 *    Ejecuta en Dashboard de Supabase (no vía SQL):
 *      Storage → memorials → Settings → desactiva "Public bucket"
 *    Luego ajusta el código cliente para usar `createSignedUrl()` en vez de
 *    `getPublicUrl()` cuando sirvas imágenes de memoriales en borrador.
 *    Para memoriales 'publicado', mantén URLs públicas vía policy pública.
 * ---------------------------------------------------------------------- */

-- Fin
