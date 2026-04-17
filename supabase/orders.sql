-- =========================================================================
-- HISTORIAS-INFINITAS :: Tabla canónica de pedidos
-- =========================================================================
-- Ejecutar DESPUÉS de schema.sql y functions.sql.
-- Esta tabla reemplaza cualquier versión anterior de `orders`.
-- =========================================================================

create extension if not exists "uuid-ossp";

-- Drop seguro por si existía de iteraciones anteriores
drop table if exists public.orders cascade;

-- -------------------------------------------------------------------------
-- Tabla de Pedidos para Gestión de Ventas y Logística
-- -------------------------------------------------------------------------
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE,
    stripe_session_id TEXT UNIQUE,
    plan_id TEXT NOT NULL,                -- 'digital' | 'artistico' | 'eterno'
    amount_total DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'mxn',
    status TEXT DEFAULT 'pending',        -- 'pending' | 'paid' | 'shipped' | 'cancelled'
    has_ar_addon BOOLEAN DEFAULT false,

    -- Datos para logística (Plan Eterno)
    shipping_address JSONB,               -- { line1, line2, city, state, postal_code, country, carrier?, tracking_url?, estimated_delivery? }
    tracking_number TEXT,

    -- Metadata para facilidad de búsqueda
    slug_memorial TEXT
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS orders_user_idx         ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_memorial_idx     ON public.orders(memorial_id);
CREATE INDEX IF NOT EXISTS orders_status_idx       ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx   ON public.orders(created_at desc);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- El usuario solo puede ver sus propias órdenes
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service Role (backend/webhook) puede hacer todo.
-- NOTA: en Supabase el service_role BYPASEA RLS por defecto, así que esta
-- política es redundante en tiempo de ejecución. Se restringe explícitamente
-- TO service_role para que — si alguien alguna vez revoca el bypass — no
-- quede una política abierta al rol anon/authenticated por error.
CREATE POLICY "Service role can manage all orders" ON public.orders
    FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
