-- =========================================================================
-- HISTORIAS-INFINITAS :: Complementos para Stripe Webhook
-- =========================================================================
-- Ejecutar DESPUÉS de: schema.sql → functions.sql → orders.sql
--
-- Las columnas relacionadas con Stripe (stripe_session_id, has_ar_addon,
-- status, etc.) ya viven en orders.sql. Este archivo añade lo que falta:
--   · Campo plan_id en memorials (rastrea el plan adquirido)
--   · Tabla stripe_events (log de idempotencia a nivel de evento)
-- =========================================================================

-- -------------------------------------------------------------------------
-- memorials: plan adquirido
-- -------------------------------------------------------------------------
alter table public.memorials
  add column if not exists plan_id text;            -- 'digital' | 'artistico' | 'eterno'

-- -------------------------------------------------------------------------
-- Log de eventos de Stripe procesados — defensa extra contra replays.
-- El webhook ya valida idempotencia por stripe_session_id (UNIQUE en orders),
-- pero este PK por event.id previene trabajo duplicado aun antes de tocar
-- la tabla de pedidos.
-- -------------------------------------------------------------------------
create table if not exists public.stripe_events (
  id         text primary key,              -- el event.id de Stripe
  type       text not null,
  created_at timestamptz not null default now()
);
