-- =========================================================================
-- HISTORIAS-INFINITAS :: Programa de Socios (partners)
-- =========================================================================
-- Ejecutar DESPUÉS de: schema.sql → functions.sql → orders.sql → stripe.sql
--
-- Tres tablas:
--   · partner_accounts    — la cuenta del socio (funeraria, clínica, etc.)
--   · partner_credits_log — auditoría de consumo de créditos
--   · partner_commissions — comisiones del 15 % por upgrade de los memoriales
--                            que el socio haya originado
--
-- Relación con memorials:
--   memorials.partner_id  — FK al partner que ORIGINÓ el memorial (nullable)
--
-- RLS: el partner solo ve sus propios datos.
-- =========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

/* ------------------------------------------------------------------------
 * partner_accounts
 * ---------------------------------------------------------------------- */
create type partner_status as enum ('active', 'suspended', 'expired');
create type partner_plan as enum (
  'partner_trial',
  'partner_pack_30',
  'partner_annual_pro',
  'partner_institucional'
);

create table if not exists public.partner_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  business_name    text not null,
  contact_email    citext not null,
  logo_url         text,
  subdomain        text unique,
  plan_id          partner_plan not null,
  credits_total    int not null default 0,
  credits_used     int not null default 0,
  valid_until      timestamptz,
  stripe_session_id text unique,
  status           partner_status not null default 'active',
  onboarding_token text unique,       -- token de activación enviado por correo
  onboarded_at     timestamptz,        -- cuándo el socio completó el onboarding
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Un email sólo puede tener UNA cuenta partner activa.
create unique index if not exists partner_accounts_email_active_idx
  on public.partner_accounts(contact_email)
  where status = 'active';

create index if not exists partner_accounts_user_idx   on public.partner_accounts(user_id);
create index if not exists partner_accounts_status_idx on public.partner_accounts(status);

-- Trigger: updated_at automático
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists partner_accounts_updated_at on public.partner_accounts;
create trigger partner_accounts_updated_at
  before update on public.partner_accounts
  for each row execute function public.touch_updated_at();

/* ------------------------------------------------------------------------
 * memorials gana referencia al partner que lo originó
 * ---------------------------------------------------------------------- */
alter table public.memorials
  add column if not exists partner_id uuid references public.partner_accounts(id) on delete set null;

create index if not exists memorials_partner_idx on public.memorials(partner_id);

/* ------------------------------------------------------------------------
 * partner_credits_log — historial de consumo de créditos
 * ---------------------------------------------------------------------- */
create table if not exists public.partner_credits_log (
  id          uuid primary key default gen_random_uuid(),
  partner_id  uuid not null references public.partner_accounts(id) on delete cascade,
  memorial_id uuid references public.memorials(id) on delete set null,
  delta       int not null,            -- negativo = consumo, positivo = recarga
  reason      text not null,           -- 'memorial_created' | 'pack_purchase' | 'refund' | 'admin_adjustment'
  created_at  timestamptz not null default now()
);

create index if not exists partner_credits_log_partner_idx on public.partner_credits_log(partner_id);

/* ------------------------------------------------------------------------
 * partner_commissions — 15 % por upgrades de sus memoriales
 * ---------------------------------------------------------------------- */
create type commission_status as enum ('pending', 'ready', 'paid', 'cancelled');

create table if not exists public.partner_commissions (
  id              uuid primary key default gen_random_uuid(),
  partner_id      uuid not null references public.partner_accounts(id) on delete cascade,
  memorial_id     uuid references public.memorials(id) on delete set null,
  order_id        uuid references public.orders(id) on delete set null,
  commission_amount decimal(10,2) not null,
  commission_rate decimal(4,4) not null default 0.15,
  currency        text not null default 'mxn',
  status          commission_status not null default 'pending',
  paid_at         timestamptz,
  note            text,
  created_at      timestamptz not null default now()
);

create index if not exists partner_commissions_partner_idx  on public.partner_commissions(partner_id);
create index if not exists partner_commissions_status_idx   on public.partner_commissions(status);

/* ------------------------------------------------------------------------
 * RLS
 * ---------------------------------------------------------------------- */
alter table public.partner_accounts     enable row level security;
alter table public.partner_credits_log  enable row level security;
alter table public.partner_commissions  enable row level security;

-- El socio ve/edita sólo su cuenta (por user_id una vez vinculada)
drop policy if exists "partner_self_select" on public.partner_accounts;
create policy "partner_self_select"
  on public.partner_accounts for select
  using (auth.uid() = user_id);

drop policy if exists "partner_self_update" on public.partner_accounts;
create policy "partner_self_update"
  on public.partner_accounts for update
  using (auth.uid() = user_id);

-- Logs y comisiones: solo lectura para el dueño
drop policy if exists "partner_credits_self_select" on public.partner_credits_log;
create policy "partner_credits_self_select"
  on public.partner_credits_log for select
  using (
    exists (
      select 1 from public.partner_accounts p
      where p.id = partner_credits_log.partner_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "partner_commissions_self_select" on public.partner_commissions;
create policy "partner_commissions_self_select"
  on public.partner_commissions for select
  using (
    exists (
      select 1 from public.partner_accounts p
      where p.id = partner_commissions.partner_id and p.user_id = auth.uid()
    )
  );

-- Service role: puede todo (webhook de Stripe y admin).
-- (service_role ya bypass RLS; políticas redundantes pero explícitas.)
drop policy if exists "partner_service_all" on public.partner_accounts;
create policy "partner_service_all"
  on public.partner_accounts for all to service_role using (true) with check (true);

drop policy if exists "partner_credits_service_all" on public.partner_credits_log;
create policy "partner_credits_service_all"
  on public.partner_credits_log for all to service_role using (true) with check (true);

drop policy if exists "partner_commissions_service_all" on public.partner_commissions;
create policy "partner_commissions_service_all"
  on public.partner_commissions for all to service_role using (true) with check (true);

/* ------------------------------------------------------------------------
 * FUNCIONES de apoyo
 * ---------------------------------------------------------------------- */

-- Al crear cuenta de usuario, si su email coincide con un partner_account
-- huérfano (user_id null), los linkeamos automáticamente.
create or replace function public.link_partner_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.partner_accounts
     set user_id = new.id,
         onboarded_at = coalesce(onboarded_at, now())
   where contact_email = lower(new.email)
     and user_id is null;
  return new;
end;
$$;

drop trigger if exists link_partner_on_signup on auth.users;
create trigger link_partner_on_signup
  after insert on auth.users
  for each row execute function public.link_partner_on_signup();

-- Consumir un crédito al crear un memorial vinculado al partner.
create or replace function public.consume_partner_credit(p_memorial_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_partner_id uuid;
begin
  select partner_id into v_partner_id
    from public.memorials where id = p_memorial_id;
  if v_partner_id is null then return; end if;

  update public.partner_accounts
     set credits_used = credits_used + 1
   where id = v_partner_id
     and credits_used < credits_total;

  insert into public.partner_credits_log (partner_id, memorial_id, delta, reason)
    values (v_partner_id, p_memorial_id, -1, 'memorial_created');
end;
$$;
