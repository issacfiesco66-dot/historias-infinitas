-- =========================================================================
-- HISTORIAS-INFINITAS :: Esquema Supabase (PostgreSQL)
-- =========================================================================
-- Tablas: profiles, memorials, memorial_media, ai_generations
-- Extensiones: pgcrypto (UUID), citext
-- =========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- -------------------------------------------------------------------------
-- PROFILES: extiende auth.users
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       citext unique not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: crea perfil automático al registrarse
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

-- -------------------------------------------------------------------------
-- MEMORIALS: memorial digital por ser querido o mascota
-- -------------------------------------------------------------------------
create type memorial_type as enum ('mascota', 'ser_querido');
create type memorial_status as enum ('borrador', 'publicado', 'privado');

create table if not exists public.memorials (
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
  view_count      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists memorials_owner_idx on public.memorials(owner_id);
create index if not exists memorials_slug_idx  on public.memorials(slug);

-- -------------------------------------------------------------------------
-- MEMORIAL_MEDIA: fotos y videos del memorial
-- -------------------------------------------------------------------------
create type media_kind as enum ('foto', 'video');

create table if not exists public.memorial_media (
  id          uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  kind        media_kind not null,
  url         text not null,
  caption     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists media_memorial_idx on public.memorial_media(memorial_id);

-- -------------------------------------------------------------------------
-- AI_GENERATIONS: historial de generaciones con Replicate / SDXL
-- -------------------------------------------------------------------------
create type ai_status as enum ('pendiente', 'procesando', 'completado', 'fallido');

create table if not exists public.ai_generations (
  id            uuid primary key default gen_random_uuid(),
  memorial_id   uuid not null references public.memorials(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  source_url    text not null,                       -- foto original
  prompt        text not null,
  model         text not null default 'stability-ai/sdxl',
  replicate_id  text,                                -- id de la predicción
  output_url    text,                                -- retrato artístico generado
  status        ai_status not null default 'pendiente',
  error         text,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index if not exists ai_memorial_idx on public.ai_generations(memorial_id);
create index if not exists ai_user_idx     on public.ai_generations(user_id);

-- -------------------------------------------------------------------------
-- RLS: Row Level Security
-- -------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.memorials       enable row level security;
alter table public.memorial_media  enable row level security;
alter table public.ai_generations  enable row level security;

-- profiles: el usuario puede leer/editar su propio perfil
create policy "profiles_self_select"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update"
  on public.profiles for update using (auth.uid() = id);

-- memorials: el dueño gestiona; cualquier persona puede leer los 'publicado'
create policy "memorials_public_read"
  on public.memorials for select using (status = 'publicado' or auth.uid() = owner_id);
create policy "memorials_owner_write"
  on public.memorials for insert with check (auth.uid() = owner_id);
create policy "memorials_owner_update"
  on public.memorials for update using (auth.uid() = owner_id);
create policy "memorials_owner_delete"
  on public.memorials for delete using (auth.uid() = owner_id);

-- memorial_media: visible si el memorial es público; gestionable por el dueño
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
    exists (select 1 from public.memorials m where m.id = memorial_media.memorial_id and m.owner_id = auth.uid())
  );

-- ai_generations: solo el dueño
create policy "ai_owner_all"
  on public.ai_generations for all using (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- STORAGE BUCKETS (ejecutar en SQL editor de Supabase)
-- -------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('memorials', 'memorials', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('ai-outputs', 'ai-outputs', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('ar-assets', 'ar-assets', true) on conflict do nothing;
