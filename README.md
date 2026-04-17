# Historias Infinitas

> Memoriales digitales con IA y Realidad Aumentada — **Next.js 14 · Tailwind · Supabase · Replicate · WebAR**

Plataforma para crear memoriales digitales de **mascotas** y **seres queridos**: biografía, galería,
**retratos artísticos generados con Stable Diffusion XL**, **QR único** y un **Portal de Recuerdos en AR**
que flota sobre superficies reales al escanear desde el móvil.

---

## Stack

- **Next.js 14** (App Router, Server Components, API Routes)
- **Tailwind CSS** + componentes estilo **shadcn/ui**
- **Supabase** (Auth · PostgreSQL · Storage · RLS)
- **Replicate** (`stability-ai/sdxl`)
- **<model-viewer>** de Google para WebAR (ARCore / ARKit)
- **qrcode** para generación de QR únicos

## Estructura

```
app/
  (auth)/login | register        → Auth con Supabase
  auth/callback | signout        → Flujo OAuth/magic link
  dashboard/                     → Panel privado
    new/                         → Crear memorial
    memorial/[id]/               → Editor (fotos, IA, AR, publicar)
                      /qr/       → Descarga del QR único
  memorial/[slug]/               → Vista PÚBLICA con Portal AR
  api/
    ai/portrait/                 → Generación SDXL con Replicate
    qr/[slug]/                   → PNG del QR descargable
components/
  ui/                            → button, input, card, label, textarea
  site-header / site-footer
lib/
  supabase/{client,server,admin} → Clientes (SSR + admin)
  replicate.ts                   → Wrapper de SDXL
  utils.ts                       → cn(), slugify(), formatDate()
supabase/
  schema.sql                     → Tablas + RLS + triggers
  functions.sql                  → RPCs auxiliares
types/
  database.ts · model-viewer.d.ts
middleware.ts                    → Protege /dashboard
```

## Configuración

1. **Instala dependencias**

   ```bash
   npm install
   ```

2. **Variables de entorno** (copia `.env.local.example` a `.env.local`)

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   REPLICATE_API_TOKEN=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Supabase**: en el panel SQL ejecuta, en orden:
   - `supabase/schema.sql` (tablas, enums, RLS, trigger de perfiles)
   - `supabase/functions.sql` (RPC `increment_memorial_views`)
   - Crea los buckets públicos: `memorials`, `ai-outputs`, `ar-assets`

4. **Ejecuta el proyecto**

   ```bash
   npm run dev
   ```

## Flujo de uso

1. Usuario se registra → `profiles` se crea por trigger.
2. Desde `/dashboard/new` crea un memorial (mascota o ser_querido) → genera `slug` único.
3. En `/dashboard/memorial/[id]` sube fotos al bucket `memorials`.
4. Pasa el cursor sobre una foto → **"Retrato IA"** llama a `/api/ai/portrait` → Replicate SDXL → guarda en `ai_generations` y actualiza `memorials.portrait_ai_url`.
5. Pega la URL de un video en "Portal de Recuerdos (AR)" → se guarda en `memorials.ar_video_url`.
6. Publica el memorial → queda accesible en `/memorial/[slug]` con el visualizador `<model-viewer>` que activa AR en móvil.
7. Descarga el **QR** desde `/dashboard/memorial/[id]/qr` o `/api/qr/[slug]`.

## Paleta "solemne y elegante"

- `marfil` — fondos cálidos (#FBF9F4)
- `pizarra` — texto y UI oscura (#2E3440)
- `dorado` — acentos tenues (#B7945A)

Tipografía: **Cormorant Garamond** (serif) + **Inter** (sans).

## Seguridad

- **RLS** activado en todas las tablas.
- `memorials` solo legibles públicamente cuando `status = 'publicado'`.
- La API `/api/ai/portrait` verifica ownership antes de invocar a Replicate.
- Service-role key **solo** usada en rutas server.

## Roadmap post-MVP

- Subida y generación de `.glb` del Portal AR (actualmente usa URL de video + modelo genérico de fallback).
- Libro de condolencias con moderación.
- Pago por memorial permanente (Stripe).
- Hosting de video en Mux/Cloudflare Stream.
