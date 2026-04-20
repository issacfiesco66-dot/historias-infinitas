-- =========================================================================
-- HISTORIAS-INFINITAS :: partner_leads vertical multi-nicho
-- Ejecutar DESPUÉS de partner-leads.sql
-- Idempotente.
--
-- Agrega la columna `vertical` para poder clasificar leads B2B por su tipo
-- de negocio (funeraria, veterinaria, hospicio, etc.). El pitch, el pricing
-- sugerido de reventa, y el template de WhatsApp se personalizan según este
-- campo. Los planes de `lib/partner-plans.ts` son los mismos para todas las
-- verticales — solo cambia la estrategia comercial, no el producto.
-- =========================================================================

alter table public.partner_leads
  add column if not exists vertical text not null default 'funeraria';

create index if not exists partner_leads_vertical_idx
  on public.partner_leads(vertical);

-- Backfill: todos los leads existentes son funerarias (histórico).
update public.partner_leads
   set vertical = 'funeraria'
 where vertical is null;

-- Check constraint suave — permite strings arbitrarios pero documenta los
-- valores canónicos. Si a futuro queremos más restrictivo, cambiar a enum.
do $check_vertical$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'partner_leads_vertical_known'
  ) then
    alter table public.partner_leads
      add constraint partner_leads_vertical_known
      check (vertical in ('funeraria', 'veterinaria', 'hospicio', 'geriatrico', 'otro'));
  end if;
end
$check_vertical$;
