import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { breadcrumbJsonLd } from '@/lib/seo/breadcrumbs';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://historias-infinitas.com'
).trim().replace(/\/+$/, '');

// Datos del founder vía env vars — permite actualizar sin redeploy y evita
// hardcodear información personal en el repo.
const FOUNDER_NAME = process.env.NEXT_PUBLIC_FOUNDER_NAME ?? '';
const FOUNDER_ROLE = process.env.NEXT_PUBLIC_FOUNDER_ROLE ?? 'Fundador';
const FOUNDER_BIO = process.env.NEXT_PUBLIC_FOUNDER_BIO ?? '';
const FOUNDER_LINKEDIN = process.env.NEXT_PUBLIC_FOUNDER_LINKEDIN ?? '';
const FOUNDER_IMAGE = process.env.NEXT_PUBLIC_FOUNDER_IMAGE ?? '/images/team/founder.jpg';
const FOUNDER_EDUCATION = process.env.NEXT_PUBLIC_FOUNDER_EDUCATION ?? '';
const FOUNDER_EXPERTISE =
  process.env.NEXT_PUBLIC_FOUNDER_EXPERTISE ??
  'Tecnología aplicada al duelo,IA generativa,Diseño de producto emocional';

export const metadata: Metadata = {
  title: 'Acerca de · Historias Infinitas',
  description:
    'Historias Infinitas es una plataforma mexicana de memoriales digitales que une Inteligencia Artificial, Realidad Aumentada y placas físicas de acero para preservar la memoria de quienes amas. Fundada en 2026.',
  alternates: {
    canonical: '/acerca',
    languages: {
      'es-MX': '/acerca',
      'en-US': '/en/about',
      'x-default': '/acerca',
    },
  },
  openGraph: {
    title: 'Acerca de · Historias Infinitas',
    description:
      'Quiénes somos, qué construimos y por qué. La historia detrás de la plataforma de memoriales digitales mexicana.',
    url: '/acerca',
    type: 'article',
  },
};

const bcLd = breadcrumbJsonLd([
  { name: 'Inicio', path: '/' },
  { name: 'Acerca de', path: '/acerca' },
]);

// Schema AboutPage — Google y los LLMs lo usan como "ficha" editorial del sitio.
const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/acerca`,
  name: 'Acerca de Historias Infinitas',
  url: `${SITE_URL}/acerca`,
  inLanguage: 'es-MX',
  mainEntity: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Acerca de', item: `${SITE_URL}/acerca` },
    ],
  },
};

// Schema Person del founder — solo se emite si hay datos reales configurados.
// Los LLMs lo usan como señal E-E-A-T clave (Experiencia, Experticia,
// Autoridad, Trust) para decidir citar o no contenido de la marca.
const personJsonLd = FOUNDER_NAME
  ? {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${SITE_URL}/acerca#founder`,
      name: FOUNDER_NAME,
      jobTitle: FOUNDER_ROLE,
      ...(FOUNDER_BIO ? { description: FOUNDER_BIO } : {}),
      ...(FOUNDER_IMAGE ? { image: `${SITE_URL}${FOUNDER_IMAGE}` } : {}),
      ...(FOUNDER_LINKEDIN ? { sameAs: [FOUNDER_LINKEDIN] } : {}),
      ...(FOUNDER_EDUCATION
        ? {
            alumniOf: {
              '@type': 'EducationalOrganization',
              name: FOUNDER_EDUCATION,
            },
          }
        : {}),
      knowsAbout: FOUNDER_EXPERTISE.split(',').map((s) => s.trim()).filter(Boolean),
      worksFor: { '@id': `${SITE_URL}/#organization` },
    }
  : null;

export default function AcercaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bcLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      {personJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      )}

      <SiteHeader />

      <main className="container-solemn py-16 md:py-24">
        <article className="max-w-3xl mx-auto">
          <header className="text-center mb-16">
            <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
              Acerca de
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 mb-5">
              La memoria merece mejores herramientas
            </h1>
            <p className="text-lg text-pizarra-600 leading-relaxed">
              Historias Infinitas nació en México con una idea simple: quienes amamos
              no deberían desaparecer bajo el algoritmo de una red social ni
              depender de un mármol que se erosiona. Merecen un lugar propio,
              permanente, dignificado.
            </p>
          </header>

          <section className="prose-blog mb-16">
            <h2>Qué construimos</h2>
            <p>
              Historias Infinitas es una plataforma de <a href="/blog/que-es-un-nicho-virtual">nichos virtuales</a> — páginas web
              permanentes en memoria de un ser querido o una mascota. Cada
              nicho virtual reúne biografía, galería de fotos y videos, un
              retrato artístico generado por <a href="/blog/ia-preserva-identidad-retratos-flux-kontext-max">Inteligencia Artificial que preserva la identidad real</a>, un código QR
              imprimible y una placa física de acero inoxidable grabada con
              láser. Un Portal de Realidad Aumentada opcional hace que, al
              escanear el QR, aparezca en el hogar del visitante una escena o
              modelo 3D del ser querido — sin instalar apps.
            </p>

            <h2>Por qué lo construimos</h2>
            <p>
              Las familias mexicanas y latinas tenemos una relación profunda
              con la memoria — lo demuestra Día de Muertos, los novenarios,
              los 40 días, el cabo de año. Pero las herramientas digitales
              que habíamos heredado no estaban a la altura: obituarios en
              PDF, dedicatorias en Facebook que el algoritmo entierra,
              páginas memoriales con cuotas mensuales que desaparecen si
              dejas de pagar. En 2024, cuando los modelos de IA generativa
              alcanzaron la fidelidad necesaria para respetar la identidad
              real de una persona en un retrato artístico, vimos la
              oportunidad de construir una plataforma que sí estuviera a la
              altura.
            </p>

            <h2>Nuestros principios</h2>
            <ul>
              <li>
                <strong>Permanencia real, no marketing</strong>: pago único,
                hosting eterno, y compromiso público en los <a href="/terminos">Términos</a> de
                entregar el archivo completo del memorial a los titulares si
                la empresa dejara de operar.
              </li>
              <li>
                <strong>Respeto por la identidad</strong>: los modelos de IA
                que usamos (Flux Kontext Max de Black Forest Labs) preservan
                los rasgos reales de la persona — no deforman, no inventan,
                no reemplazan.
              </li>
              <li>
                <strong>Dignidad en el diseño</strong>: cero anuncios, cero
                distracciones, tipografía seria, tono cuidado. Un memorial
                digital no es una red social.
              </li>
              <li>
                <strong>Cumplimiento legal desde el día uno</strong>: LFPDPPP
                en México, GDPR-equivalente para visitantes europeos,
                CCPA/CPRA para el mercado de California. Firmamos DPAs con
                funerarias que lo requieran.
              </li>
              <li>
                <strong>Raíz mexicana, alcance bilingüe</strong>: nacimos en
                Ciudad de México pero atendemos México, Estados Unidos y
                Canadá. La comunidad mexicana diaspórica es audiencia clave.
              </li>
            </ul>

            <h2>Cómo operamos</h2>
            <p>
              Somos una empresa pequeña, operada con herramientas modernas
              que nos permiten hacer mucho con poco equipo:
            </p>
            <ul>
              <li>Hosting y SSR en Vercel (Next.js 14 App Router).</li>
              <li>Base de datos y storage en Supabase (Postgres + RLS).</li>
              <li>Modelo de IA Flux Kontext Max ejecutado en Replicate.</li>
              <li>Pagos con Stripe (MXN y USD).</li>
              <li>Correo transaccional con Resend.</li>
            </ul>
            <p>
              Compartimos estos detalles técnicos públicamente porque creemos
              en la transparencia: las familias que nos confían la memoria
              de quienes aman merecen saber exactamente en qué
              infraestructura viven esos datos.
            </p>

            <h2>Cobertura geográfica</h2>
            <p>
              Operamos en México (precios en MXN, factura CFDI 4.0) y en
              Estados Unidos y Canadá (precios en USD, envíos de placas
              físicas al domicilio). Contamos con una versión en inglés del
              sitio en <a href="/en">historias-infinitas.com/en</a> para el mercado anglófono.
            </p>
          </section>

          {FOUNDER_NAME && (
            <section aria-labelledby="team-heading" className="mb-16">
              <div className="bg-marfil rounded-2xl border border-pizarra-100 p-8 md:p-12">
                <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">
                  Quién está detrás
                </p>
                <h2 id="team-heading" className="font-serif text-3xl text-pizarra-800 mb-6">
                  {FOUNDER_NAME}
                </h2>
                <p className="text-sm uppercase tracking-widest text-pizarra-400 mb-6">
                  {FOUNDER_ROLE}
                </p>
                {FOUNDER_BIO && (
                  <p className="text-pizarra-700 leading-relaxed mb-6">
                    {FOUNDER_BIO}
                  </p>
                )}
                {FOUNDER_LINKEDIN && (
                  <Link
                    href={FOUNDER_LINKEDIN}
                    className="text-dorado-600 underline hover:text-dorado-700 text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Conectar en LinkedIn →
                  </Link>
                )}
              </div>
            </section>
          )}

          <section className="mb-16">
            <h2 className="font-serif text-3xl text-pizarra-800 mb-6">
              ¿Quieres saber más?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-xl bg-dorado-500 text-pizarra-900 px-6 py-3 font-medium hover:bg-dorado-600 transition"
              >
                Leer el blog
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center rounded-xl border border-pizarra-300 text-pizarra-700 px-6 py-3 font-medium hover:bg-pizarra-50 transition"
              >
                Contactarnos
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center justify-center rounded-xl border border-pizarra-300 text-pizarra-700 px-6 py-3 font-medium hover:bg-pizarra-50 transition"
              >
                Programa de socios
              </Link>
            </div>
          </section>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
