-- =========================================================================
-- HISTORIAS-INFINITAS :: Leads de funerarias (pipeline indexa → HI)
-- Ejecutar DESPUÉS de partners.sql.
-- Idempotente: seguro re-ejecutar.
--
-- Indexa (E:\Indexa, servicio externo) scrapea funerarias con WhatsApp,
-- las registra aquí vía POST /api/leads/funeraria, envía el primer mensaje
-- con un link /partners?lead=<token>. Cuando abren el link marcamos
-- 'engaged'; cuando compran, 'converted'; cuando responden BAJA, 'opted_out'.
-- =========================================================================

create extension if not exists "pgcrypto";

/* ------------------------------------------------------------------------
 * ENUM lead_status
 * ---------------------------------------------------------------------- */
do $enum_lead_status$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum (
      'scraped',    -- indexa lo descubrió, aún no envía WhatsApp
      'contacted',  -- indexa envió el primer WhatsApp
      'engaged',    -- funeraria abrió el link /partners?lead=<token>
      'opted_out',  -- respondió BAJA — no volver a contactar jamás
      'converted'   -- compró un plan (tiene partner_account)
    );
  end if;
end
$enum_lead_status$;

/* ------------------------------------------------------------------------
 * partner_leads
 *
 * phone es UNIQUE para que POST /api/leads/funeraria sea idempotente:
 * si indexa re-envía el mismo número, devolvemos el lead existente con
 * su token original. La blocklist de opt-outs vive aquí mismo
 * (status='opted_out') — no necesita tabla aparte.
 * ---------------------------------------------------------------------- */
create table if not exists public.partner_leads (
  id                    uuid primary key default gen_random_uuid(),
  business_name         text not null,
  phone                 text not null unique,
  city                  text,
  state                 text,
  google_place_id       text unique,
  source                text not null default 'indexa',
  status                lead_status not null default 'scraped',
  token                 text unique not null default encode(gen_random_bytes(24), 'hex'),
  notes                 text,
  metadata              jsonb not null default '{}'::jsonb,
  converted_partner_id  uuid references public.partner_accounts(id) on delete set null,
  contacted_at          timestamptz,
  engaged_at            timestamptz,
  opted_out_at          timestamptz,
  converted_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists partner_leads_phone_idx     on public.partner_leads(phone);
create index if not exists partner_leads_status_idx    on public.partner_leads(status);
create index if not exists partner_leads_created_idx   on public.partner_leads(created_at desc);
create index if not exists partner_leads_opted_out_idx
  on public.partner_leads(opted_out_at)
  where status = 'opted_out';

/* ------------------------------------------------------------------------
 * Trigger updated_at (reutiliza public.touch_updated_at definida en partners.sql)
 * ---------------------------------------------------------------------- */
drop trigger if exists partner_leads_updated_at on public.partner_leads;
create trigger partner_leads_updated_at
  before update on public.partner_leads
  for each row execute function public.touch_updated_at();

/* ------------------------------------------------------------------------
 * RLS: los leads nunca se exponen al cliente. Solo service_role.
 * ---------------------------------------------------------------------- */
alter table public.partner_leads enable row level security;

drop policy if exists "partner_leads_service_all" on public.partner_leads;
create policy "partner_leads_service_all"
  on public.partner_leads for all to service_role
  using (true) with check (true);
