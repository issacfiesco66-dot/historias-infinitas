# GEO Audit Report — Historias Infinitas

**Dominio:** https://historias-infinitas.com
**Fecha:** 2026-04-20
**Tipo de negocio detectado:** SaaS/E-commerce híbrido (memoriales digitales + B2B partners)
**Idiomas:** es-MX (primario) / en-US (secundario)
**Mercados:** México / USA / Canadá

---

## Composite GEO Score: **47 / 100** — "Fundamentos sólidos, techo bajo por falta de contenido editorial y autoridad de marca"

| Categoría | Peso | Score | Notas clave |
|---|---|---|---|
| AI Citability & Visibility | 25% | 55/100 | `llms.txt` excelente, pero robots.txt bloquea memoriales a todas las IAs |
| Brand Authority Signals | 20% | 25/100 | `sameAs: []` vacío. Sin presencia en Reddit / LinkedIn / Wikipedia |
| Content Quality & E-E-A-T | 20% | 35/100 | Sin blog. Sin contenido editorial. Sin autoridad demostrada |
| Technical Foundations | 15% | 80/100 | Next.js SSR + Vercel + HSTS + CSP — muy bien |
| Structured Data | 10% | 50/100 | Solo Organization + WebSite. Faltan Product, FAQPage, Service, BreadcrumbList, HowTo |
| Platform Optimization | 10% | 40/100 | Base OK para Google AIO; débil para ChatGPT/Perplexity/Gemini |

---

## 🟢 Lo que ya hacen bien

1. **`llms.txt` bilingüe, completo** (4.4 KB con productos, precios, URLs, tecnología). Está en el ~5% de sitios que lo tienen.
2. **JSON-LD Organization + WebSite+SearchAction** en home.
3. **hreflang correcto** (es-MX / en-US / x-default) en sitemap y head.
4. **Security headers fuertes:** HSTS preload, CSP estricta, X-Frame DENY, COOP, Referrer-Policy.
5. **Next.js 14 con SSR en Vercel** → render rápido, HTML completo para crawlers.
6. **Meta tags completos:** title, description, OG, Twitter, canonical, keywords, robots expandido, author.
7. **Rutas legales:** `/terminos` + `/privacidad` + contacto + dirección fiscal (señal trust).
8. **Sitemap con `<lastmod>`, `<priority>`, alternate links.**

---

## 🔴 Bloqueadores críticos (resolver en los próximos 7-14 días)

### 1. `robots.txt` bloquea todas las IAs en `/memorial/*` — contradice el objetivo GEO

```
User-Agent: GPTBot / CCBot / Google-Extended / anthropic-ai / ClaudeBot
Disallow: /memorial/
```

**Impacto:** ChatGPT, Claude, Gemini y Perplexity **no pueden leer ni citar ningún memorial** — el núcleo del producto es invisible a las IAs. Cuando alguien pregunte "¿qué es un nicho virtual?" o "¿ejemplo de memorial digital?", ninguna IA podrá mostrar el producto.

**Trade-off:** Probablemente esto se puso por privacidad. Válido, pero hay matices:
- Los memoriales con consentimiento de la familia (los de demo, ej. `/memorial/rosa-y-fernando-ket9rc`) deberían ser crawleables.
- Alternativa: bloquear solo `/memorial/*/qr` y `/memorial/*/admin`, permitir vista pública.

**Recomendación:** Dos tiers — memoriales públicos opt-in (crawleables) vs privados (bloqueados con `X-Robots-Tag: noindex` a nivel de header).

### 2. **Falta H1 en homepage** — tiene H2 pero el primer encabezado real debe ser H1

Actualmente el home empieza con `<h2>Cada vida merece ser honrada a su manera</h2>`. Google y los LLMs priorizan H1 para identificar el tema central.

**Fix:** convertir el primer H2 en H1, o agregar un H1 arriba. Similar en `/para-funerarias`.

### 3. **Título duplicado:** `/para-funerarias` → `"Nichos Virtuales para Funerarias — Historias Infinitas — Historias Infinitas"`

Probablemente `metadata.title` + `metadata.title.template` se están concatenando dos veces. Revisa [app/(verticals)/para-funerarias/page.tsx](app/(verticals)/para-funerarias/page.tsx) y el layout padre.

### 4. **`sameAs: []` está vacío** — mata la entity recognition en IAs

Para que ChatGPT/Perplexity reconozcan "Historias Infinitas" como entidad real, necesitan cross-references. Agregar al schema Organization:
```json
"sameAs": [
  "https://www.linkedin.com/company/historias-infinitas",
  "https://www.instagram.com/historiasinfinitas.mx",
  "https://www.facebook.com/historiasinfinitas",
  "https://www.tiktok.com/@historiasinfinitas",
  "https://www.youtube.com/@historiasinfinitas",
  "https://twitter.com/historiasinf"
]
```

Si aún no existen cuentas → crear al menos LinkedIn + Instagram + YouTube esta semana.

### 5. **Sitemap con solo 20 URLs, sin blog, sin contenido editorial**

Sin contenido editorial no hay chance de rankear en Google ni ser citado por IAs. Las IAs citan artículos que responden preguntas específicas ("¿qué es un memorial digital?", "¿cómo despedir a una mascota?", "¿cómo hacer duelo por un ser querido?").

---

## 🟡 Gaps importantes (próximos 30 días)

### 6. Schema.org incompleto

Faltan tipos que las IAs usan para entender productos y responder consultas:

| Schema | Por qué importa | Dónde aplicarlo |
|---|---|---|
| `Product` + `Offer` + `AggregateRating` | Rich results en Google + citación en IAs sobre precios | Cada plan (Digital, Artístico, Eterno) |
| `Service` | Google AIO cita "servicios" | Partners (Funerarias, Vets, Hospicios) |
| `FAQPage` | Citación directa en ChatGPT, Google AIO, Perplexity | Home y cada landing |
| `BreadcrumbList` | Navegación estructurada + rich snippets | Todas las páginas internas |
| `HowTo` | "Cómo crear un memorial digital" queries | `/empieza` o blog |
| `LocalBusiness` | Google Maps + queries locales | Si tienes oficina física |
| `Article` + `Author` | Blog posts citables | Cuando se cree el blog |

### 7. Falta `llms-full.txt` expandido

El `llms.txt` es resumen. Los LLMs también consumen `llms-full.txt` con el contenido completo en markdown. Puede incluir: definiciones, casos de uso, comparativas con alternativas, FAQ extendida, historias de clientes.

### 8. `foundingDate: "2026"` en Organization schema

Señal débil de autoridad. Si la empresa opera desde antes (aunque sea la versión actual), ajustar. Si es realmente 2026, compensar con otras señales de trust (testimonios con fecha, casos de uso con cliente).

### 9. `areaServed` solo dice "México"

Pero `llms.txt` dice "México + US + Canadá". Desincronización de señales. Actualizar:
```json
"areaServed": [
  {"@type":"Country","name":"México"},
  {"@type":"Country","name":"United States"},
  {"@type":"Country","name":"Canada"}
]
```

### 10. `priceRange` en MXN pero schema también acepta USD

Agregar `Offer` en USD para el mercado US/Canadá. O usar `PriceSpecification` con `priceCurrency` y rangos claros.

### 11. Meta `keywords` redundante

Google las ignora desde 2009, pero **los LLMs sí las leen**. Las que tienes están bien; puedes expandir con long-tail: "como crear memorial digital mascota", "nicho virtual QR", "despedida mascota después de fallecer", "memorial funeraria digital México".

### 12. Sin testimonios estructurados (`Review` / `Testimonial`)

Las IAs adoran testimonios con schema `Review`. Una sola página `/testimonios` con 5-10 reviews reales (con nombre + fecha + rating) con schema `AggregateRating` → saltas 15 puntos en citability.

---

## 🔵 Oportunidades estratégicas (30-90 días)

### 13. **Blog editorial — el motor principal de GEO**

Crear `/blog` (o `/recursos`, `/guias`) con 15-20 artículos de alta calidad en 60 días. Tópicos citables por IAs:

**Cluster 1: Duelo y memoria (alto volumen, baja competencia en español)**
- "Cómo superar el duelo por la pérdida de una mascota: guía completa"
- "Qué decir cuando alguien pierde a un ser querido: 20 frases que ayudan"
- "Cómo hablarles a los niños sobre la muerte de una mascota"
- "Rituales de despedida: tradiciones mexicanas para honrar a los que se fueron"

**Cluster 2: Memoriales digitales (define la categoría)**
- "Qué es un nicho virtual y cómo funciona"
- "Memorial digital vs lápida tradicional: comparativa 2026"
- "Historia de los memoriales digitales: de 2000 a 2026"
- "Código QR en lápidas: guía técnica y legal México"

**Cluster 3: Tecnología IA aplicada (altamente citable)**
- "Cómo la IA preserva la identidad en retratos: Flux Kontext Max explicado"
- "Realidad Aumentada para el duelo: casos de uso reales"

**Cluster 4: B2B**
- "Cómo una funeraria puede digitalizar sus servicios en 30 días"
- "El nuevo consumidor del duelo: qué esperan las familias millennials"

Cada artículo: 1500-2500 palabras, tablas comparativas, datos con fuente, TOC, FAQ al final (con schema `FAQPage`), autor firmado (con `Person` schema), fecha clara.

### 14. Crear presencia en plataformas que IAs citan más

Ranking de plataformas por citas en respuestas de IA (datos industria 2025-2026):
1. **Wikipedia** → pedir creación de entidad cuando haya suficiente coverage en prensa.
2. **Reddit** → crear hilos orgánicos en r/Mexico, r/Duelo, r/Pets, responder consultas.
3. **YouTube** → 1 video / semana. Los LLMs citan transcripciones.
4. **LinkedIn** → Founder posts + company page.
5. **Quora Spanish** → responder preguntas relacionadas con memoriales.
6. **GitHub** → publicar un proyecto open-source (ej. `llms.txt` spec implementation) para autoridad técnica.

### 15. Menciones de marca en medios

Pitch a: Forbes México, Expansión, El Economista, Merca 2.0, PetsWorld México, revistas de funerarias. Angle: "startup mexicana aplica IA generativa al duelo" — buena historia periodística.

### 16. Programa de link-building sectorial

Dirigido a: asociaciones de funerarias (AFUMEX), hospicios, clínicas veterinarias. Ofrecer guest posts y badges de partner.

### 17. Sistema de reseñas — Google, Trustpilot, Capterra

Pedir activamente a clientes satisfechos dejar review en:
- Google Business Profile (clave para Google AIO)
- Trustpilot (Perplexity lo cita)
- Capterra (para partners B2B — ChatGPT/Claude lo citan en comparativas de software)

### 18. Podcast apariciones del founder

Los LLMs transcriben podcasts. Apariciones en podcasts de mascotas, duelo, startups LATAM → autoridad de entidad.

---

## 📊 Comparativa Platform Readiness (hoy)

| Plataforma | Readiness | Bloqueadores |
|---|---|---|
| **Google AI Overviews** | 55% | Falta H1, falta FAQPage schema, falta contenido editorial |
| **ChatGPT (web browsing)** | 35% | GPTBot bloqueado en `/memorial/*`, sin blog, sin `sameAs` |
| **Perplexity** | 40% | Sin fuentes externas que citen la marca, sin Reddit presence |
| **Google Gemini** | 45% | Google-Extended bloqueado en memoriales, sin contenido editorial |
| **Bing Copilot** | 50% | Indexación básica OK, falta señales de autoridad externa |
| **Claude (con web search)** | 40% | ClaudeBot/anthropic-ai bloqueados en memoriales |

---

## 🎯 Plan de acción priorizado

### 🔥 Quick wins (esta semana — impact alto, esfuerzo bajo)

1. **Arreglar título duplicado** de `/para-funerarias` y verificar todas las verticales.
2. **Añadir H1 real** al home y a cada landing vertical.
3. **Actualizar `areaServed`** en schema Organization a MX + US + CA.
4. **Poblar `sameAs`** con las redes sociales existentes (o crear cuentas base esta semana).
5. **Agregar `FAQPage` schema** al home con 6-8 preguntas frecuentes ya respondidas en copy.
6. **Agregar `BreadcrumbList` schema** a todas las páginas internas.
7. **Crear `llms-full.txt`** expandido (15-20 KB) con contenido editorial.
8. **Revisar política de robots.txt** para memoriales públicos opt-in.

### 🏗️ Medium-term (próximos 30 días)

9. **Schema `Product` por plan** con `Offer`, `priceCurrency` MXN y USD, `priceValidUntil`, `availability`.
10. **Schema `Service`** para cada vertical (Funerarias, Veterinarias, Hospicios).
11. **Página `/testimonios`** con `Review` + `AggregateRating`.
12. **Página `/acerca-de`** con founder, equipo, credenciales (`Person` schema con `knowsAbout`, `alumniOf`).
13. **Lanzar blog** con primeros 5 artículos de los clusters sugeridos.
14. **Crear canal YouTube** + 2 videos iniciales.
15. **Google Business Profile** optimizado + primeras 10 reviews.

### 🚀 Strategic (próximos 60-90 días)

16. **Blog a 20 artículos** + calendario editorial semanal.
17. **Link-building campaign** con 10 menciones en medios + asociaciones sectoriales.
18. **Press release** sobre IA aplicada al duelo (angle Forbes MX / Expansión).
19. **Open-source contribution** (ej. biblioteca `next-llms-txt` en GitHub).
20. **Podcast tour** (5-8 apariciones del founder).
21. **Asset páginas comparativas** ("Historias Infinitas vs Forever Missed", "vs Gathering Us") — altamente citadas por IAs.

---

## 📈 Proyección

Si se ejecutan Quick Wins + Medium-term en 60 días:

| Métrica | Hoy | 60 días | 120 días |
|---|---|---|---|
| GEO Score | 47/100 | 68/100 | 82/100 |
| Páginas indexadas | ~20 | ~50 | ~120 |
| Schemas activos | 2 tipos | 8 tipos | 12 tipos |
| Citability media página | ~35 | ~65 | ~80 |
| Platform readiness promedio | 44% | 70% | 85% |

---

## Metodología

Auditoría basada en:
- **Crawl directo:** homepage HTML, robots.txt, sitemap.xml, llms.txt, headers.
- **Revisión de código:** estructura Next.js, rutas, schema inline.
- **Scoring GEO 2026:** weighted composite (AI Citability 25%, Brand Authority 20%, Content 20%, Technical 15%, Schema 10%, Platform 10%).
- **Estándares:** Schema.org, llms.txt spec, Google Search Quality Rater Guidelines 2025, AI Overviews source-selection patterns.

**Fuentes de datos de contexto:**
- Ahrefs Dec 2025 — brand mentions vs backlinks correlation para AI citation.
- SparkToro 2025 — +527% AI-referred sessions growth.
- Gartner 2024 — proyección -50% search traffic for 2028.

---

*Reporte generado con el skill GEO de Claude Code — `/geo audit`.*
