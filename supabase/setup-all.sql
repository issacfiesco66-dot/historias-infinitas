-- =========================================================================
-- HISTORIAS-INFINITAS :: Setup TODO-EN-UNO
-- =========================================================================
-- Pega este archivo completo en el SQL Editor de Supabase y dale Run.
-- Es seguro ejecutarlo más de una vez (usa CREATE ... IF NOT EXISTS,
-- DROP IF EXISTS y DROP TYPE ... CASCADE).
--
-- Al terminar, crea los tres buckets (o descomenta las líneas del final).
-- =========================================================================


-- =========================================================================
-- 1. EXTENSIONES
-- =========================================================================
create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "uuid-ossp";


-- =========================================================================
-- 2. RESET LIMPIO (solo tablas del proyecto — deja auth.users intacto)
-- =========================================================================
-- Borra en orden inverso de dependencias. Si es la primera vez, no hace nada.
drop table if exists public.stripe_events    cascade;
drop table if exists public.orders           cascade;
drop table if exists public.ai_generations   cascade;
drop table if exists public.memorial_media   cascade;
drop table if exists public.memorials        cascade;
drop table if exists public.profiles         cascade;

drop type  if exists ai_status        cascade;
drop type  if exists media_kind       cascade;
drop type  if exists memorial_status  cascade;
drop type  if exists memorial_type    cascade;


-- =========================================================================
-- 3. PROFILES (extiende auth.users)
-- =========================================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       citext unique not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =========================================================================
-- 4. MEMORIALS + ENUMS
-- =========================================================================
create type memorial_type   as enum ('mascota', 'ser_querido');
create type memorial_status as enum ('borrador', 'publicado', 'privado');

create table public.memorials (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  slug            text unique not null,
  type            memorial_type not null,
  status          memorial_status not null default 'borrador',
  name            text not null,
  birth_date      date,
  passing_date    date,
  biography       text,
  epitaph         text,
  cover_photo_url text,
  portrait_ai_url text,
  ar_video_url    text,
  ar_model_url    text,
  plan_id         text,                 -- 'digital' | 'artistico' | 'eterno' (se llena tras Stripe)
  view_count      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index memorials_owner_idx on public.memorials(owner_id);
create index memorials_slug_idx  on public.memorials(slug);


-- =========================================================================
-- 5. MEMORIAL_MEDIA
-- =========================================================================
create type media_kind as enum ('foto', 'video');

create table public.memorial_media (
  id          uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  kind        media_kind not null,
  url         text not null,
  caption     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index media_memorial_idx on public.memorial_media(memorial_id);


-- =========================================================================
-- 6. AI_GENERATIONS
-- =========================================================================
create type ai_status as enum ('pendiente', 'procesando', 'completado', 'fallido');

create table public.ai_generations (
  id            uuid primary key default gen_random_uuid(),
  memorial_id   uuid not null references public.memorials(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  source_url    text not null,
  prompt        text not null,
  model         text not null default 'stability-ai/sdxl',
  replicate_id  text,
  output_url    text,
  status        ai_status not null default 'pendiente',
  error         text,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index ai_memorial_idx on public.ai_generations(memorial_id);
create index ai_user_idx     on public.ai_generations(user_id);


-- =========================================================================
-- 7. ORDERS (esquema canónico)
-- =========================================================================
create table public.orders (
  id                 uuid primary key default uuid_generate_v4(),
  created_at         timestamptz default timezone('utc'::text, now()) not null,
  user_id            uuid references auth.users(id) on delete cascade,
  memorial_id        uuid references public.memorials(id) on delete cascade,
  stripe_session_id  text unique,
  plan_id            text not null,
  amount_total       decimal(10, 2) not null,
  currency           text default 'mxn',
  status             text default 'pending',     -- 'pending' | 'paid' | 'shipped' | 'cancelled'
  has_ar_addon       boolean default false,
  shipping_address   jsonb,
  tracking_number    text,
  slug_memorial      text
);

create index orders_user_idx       on public.orders(user_id);
create index orders_memorial_idx   on public.orders(memorial_id);
create index orders_status_idx     on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);


-- =========================================================================
-- 8. STRIPE_EVENTS (idempotencia de webhooks)
-- =========================================================================
create table public.stripe_events (
  id         text primary key,              -- event.id de Stripe
  type       text not null,
  created_at timestamptz not null default now()
);


-- =========================================================================
-- 9. RPC increment_memorial_views
-- =========================================================================
create or replace function public.increment_memorial_views(m_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.memorials
    set view_count = view_count + 1
  where id = m_id and status = 'publicado';
$$;

grant execute on function public.increment_memorial_views(uuid) to anon, authenticated;


-- =========================================================================
-- 10. ROW LEVEL SECURITY
-- =========================================================================
alter table public.profiles        enable row level security;
alter table public.memorials       enable row level security;
alter table public.memorial_media  enable row level security;
alter table public.ai_generations  enable row level security;
alter table public.orders          enable row level security;

-- profiles
create policy "profiles_self_select"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update"
  on public.profiles for update using (auth.uid() = id);

-- memorials
create policy "memorials_public_read"
  on public.memorials for select using (status = 'publicado' or auth.uid() = owner_id);
create policy "memorials_owner_write"
  on public.memorials for insert with check (auth.uid() = owner_id);
create policy "memorials_owner_update"
  on public.memorials for update using (auth.uid() = owner_id);
create policy "memorials_owner_delete"
  on public.memorials for delete using (auth.uid() = owner_id);

-- memorial_media
create policy "media_public_read"
  on public.memorial_media for select using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_media.memorial_id
        and (m.status = 'publicado' or m.owner_id = auth.uid())
    )
  );
create policy "media_owner_write"
  on public.memorial_media for all using (
    exists (select 1 from public.memorials m
            where m.id = memorial_media.memorial_id
              and m.owner_id = auth.uid())
  );

-- ai_generations
create policy "ai_owner_all"
  on public.ai_generations for all using (auth.uid() = user_id);

-- orders
create policy "Users can view their own orders"
  on public.orders for select using (auth.uid() = user_id);
create policy "Service role can manage all orders"
  on public.orders for all to service_role using (true) with check (true);


-- =========================================================================
-- 11. STORAGE BUCKETS (públicos para lectura — escritura requiere sesión)
-- =========================================================================
insert into storage.buckets (id, name, public) values ('memorials', 'memorials', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('ai-outputs', 'ai-outputs', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('ar-assets', 'ar-assets', true)
  on conflict (id) do nothing;

-- Políticas de storage: cualquiera puede leer, solo authenticated sube.
-- (Ajusta si quieres limitar escritura por path/owner.)
create policy "public_read_memorials"
  on storage.objects for select to public
  using (bucket_id in ('memorials', 'ai-outputs', 'ar-assets'));

create policy "auth_upload_memorials"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('memorials', 'ai-outputs', 'ar-assets'));

create policy "auth_update_own"
  on storage.objects for update to authenticated
  using (auth.uid() = owner);

create policy "auth_delete_own"
  on storage.objects for delete to authenticated
  using (auth.uid() = owner);


-- =========================================================================
-- LISTO
-- =========================================================================
-- Verifica: select table_name from information_schema.tables where table_schema='public';
-- Deberías ver: ai_generations, memorial_media, memorials, orders,
--               profiles, stripe_events
