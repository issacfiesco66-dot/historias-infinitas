import type { Metadata } from 'next';
import { VerticalLanding } from '../vertical-landing';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Memorial digital para Clínicas Veterinarias — Historias Infinitas',
  description:
    'Ofrece a las familias de tus pacientes un memorial digital con retrato IA para honrar a su mascota. Con el logo de tu clínica. Desde $999 MXN. 30 días de garantía.',
  alternates: { canonical: '/para-clinicas-veterinarias' },
  keywords: [
    'memorial para mascotas veterinaria',
    'servicio duelo mascota clínica',
    'homenaje digital mascota',
    'cremación mascota memorial',
    'tributo perro gato',
    'clínica veterinaria servicios extra',
  ],
  openGraph: {
    title: 'Un adiós digno a cada mascota — para Clínicas Veterinarias',
    description:
      'Regala un memorial digital con retrato IA y QR a las familias que deben despedirse. Con el logo de tu clínica.',
    url: '/para-clinicas-veterinarias',
    type: 'article',
  },
};

export default function ParaClinicasVeterinariasPage() {
  return (
    <VerticalLanding
      copy={{
        vertical: 'Clínicas Veterinarias',
        keywordH1: 'clínicas veterinarias',
        canonical: '/para-clinicas-veterinarias',
        eyebrow: 'Para Clínicas Veterinarias · Hospitales · Servicios de Cremación en México',
        h1: (
          <>
            El adiós digno que{' '}
            <span className="text-gradient-dorado italic">tus familias recordarán siempre</span>.
          </>
        ),
        intro:
          'Cuando una mascota se va, la familia busca cerrar con amor. Ofrécele un memorial digital con retrato artístico por IA y QR — con el logo de tu clínica. Un gesto que convierte el duelo en recuerdo, y tu clínica en referencia.',
        pitch: 'El detalle que convierte el duelo en confianza',
        benefits: [
          {
            icon: Heart,
            title: 'Acompañamiento del duelo',
            text:
              'El momento de la despedida es el más sensible. Un memorial tangible ayuda a las familias a procesar la pérdida y les queda algo hermoso que mostrar.',
          },
          {
            icon: HeartHandshake,
            title: 'Tu clínica como refugio',
            text:
              'Tu logo aparece en cada memorial y en la placa grabada. Las familias asocian tu marca con el momento más humano de su historia.',
          },
          {
            icon: TrendingUp,
            title: 'Diferenciación + ingreso',
            text:
              'Pocos servicios veterinarios ofrecen esto en México. Además del efecto de fidelización, ganas 15 % de comisión en upgrades.',
          },
          {
            icon: ShieldCheck,
            title: 'Funciona con cualquier especie',
            text:
              'Perros, gatos, aves, conejos, reptiles. Nuestro modelo de IA preserva identidad de mascotas con la misma fidelidad que de humanos.',
          },
        ],
        testimonial: {
          quote:
            'Es el servicio que nuestras familias no sabían que necesitaban. Cuando vuelven con otra mascota, vuelven a nosotros.',
          author: 'Hospital Veterinario · testimonial editable',
        },
        faqs: [
          {
            q: '¿Cómo lo integramos al servicio de eutanasia o cremación?',
            a: 'Lo ofrecemos como parte del paquete de despedida. Nuestro equipo te capacita en cómo presentarlo de forma respetuosa en el momento adecuado (típicamente al entregar las cenizas o como regalo posterior).',
          },
          {
            q: '¿La IA preserva bien los rasgos de mi mascota?',
            a: 'Usamos Flux Kontext Max, el modelo más reciente para edición preservando identidad. Funciona muy bien con razas, colores de pelaje y manchas específicas. Si la primera generación no captura la esencia, regeneramos sin costo.',
          },
          {
            q: '¿El QR lleva a un sitio que podamos ver sin pagar?',
            a: 'Antes del pago la URL es privada (modo borrador). Después del pago queda activa para siempre con hosting eterno. Si tu cliente no paga el plan base ($299 MXN), el memorial no se publica.',
          },
          {
            q: '¿Las placas físicas sirven para poner en urnas o jardines?',
            a: 'Sí. Son de acero inoxidable grabado con láser, resistentes a la intemperie. Tamaño estándar 6x6 cm, ideales para urnas, collares conmemorativos o lápidas en jardines.',
          },
        ],
        keywords: [],
      }}
    />
  );
}
