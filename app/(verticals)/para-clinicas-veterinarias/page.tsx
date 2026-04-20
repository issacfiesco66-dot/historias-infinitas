import type { Metadata } from 'next';
import { VerticalLanding } from '../vertical-landing';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nicho Virtual para Clínicas Veterinarias — Historias Infinitas',
  description:
    'Ofrece a las familias de tus pacientes un nicho virtual con retrato IA para honrar a su mascota. Con el logo de tu clínica. Desde $999 MXN. 30 días de garantía.',
  alternates: {
    canonical: '/para-clinicas-veterinarias',
    languages: {
      'es-MX': '/para-clinicas-veterinarias',
      'en-US': '/en/for-veterinary-clinics',
      'x-default': '/para-clinicas-veterinarias',
    },
  },
  keywords: [
    'nicho virtual para mascotas veterinaria',
    'servicio duelo mascota clínica',
    'homenaje digital mascota',
    'cremación mascota nicho virtual',
    'tributo perro gato',
    'clínica veterinaria servicios extra',
    'veterinaria CDMX',
    'veterinaria Guadalajara',
    'veterinaria Monterrey',
    'veterinaria Puebla',
    'veterinaria Querétaro',
    'eutanasia mascota México',
    'nicho virtual perro gato México',
  ],
  openGraph: {
    title: 'Un adiós digno a cada mascota — para Clínicas Veterinarias',
    description:
      'Regala un nicho virtual con retrato IA y QR a las familias que deben despedirse. Con el logo de tu clínica.',
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
          'Cuando una mascota se va, la familia busca cerrar con amor. Ofrécele un nicho virtual con retrato artístico por IA y QR — con el logo de tu clínica. Un gesto que convierte el duelo en recuerdo, y tu clínica en referencia.',
        pitch: 'El detalle que convierte el duelo en confianza',
        benefits: [
          {
            icon: Heart,
            title: 'Acompañamiento del duelo',
            text:
              'El momento de la despedida es el más sensible. Un nicho virtual tangible ayuda a las familias a procesar la pérdida y les queda algo hermoso que mostrar.',
          },
          {
            icon: HeartHandshake,
            title: 'Tu clínica como refugio',
            text:
              'Tu logo aparece en cada nicho virtual y en la placa grabada. Las familias asocian tu marca con el momento más humano de su historia.',
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
            a: 'Antes del pago la URL es privada (modo borrador). Después del pago queda activa para siempre con hosting eterno. Si tu cliente no paga el plan base ($299 MXN), el nicho virtual no se publica.',
          },
          {
            q: '¿Las placas físicas sirven para poner en urnas o jardines?',
            a: 'Sí. Son de acero inoxidable grabado con láser, resistentes a la intemperie. Tamaño estándar 6x6 cm, ideales para urnas, collares conmemorativos o lápidas en jardines.',
          },
        ],
        keywords: [],
        deepContent: {
          heading: 'Por qué las clínicas veterinarias de México necesitan un servicio de duelo real',
          paragraphs: [
            'En México se practican más de 1.5 millones de eutanasias veterinarias al año entre CDMX, Guadalajara, Monterrey, Puebla y las principales ciudades. La mayoría de las familias salen de la clínica con una urna o una caja de cartón — y con un vacío que nadie les ayuda a cerrar. Historias Infinitas convierte ese momento en uno de los más memorables del servicio veterinario: un nicho virtual con retrato artístico generado por inteligencia artificial, biografía de la mascota, galería de fotos y un código QR imprimible que la familia puede conservar para siempre.',
            'El flujo es simple para tu clínica: al cerrar la cremación o la eutanasia, tu equipo entrega a la familia una tarjeta con el QR (o una placa de acero inoxidable grabada con láser, en el plan Eterno). La familia escanea, registra los datos de su mascota — perro, gato, ave, conejo, reptil o cualquier especie — y en minutos tienen un nicho virtual vivo con el logo de tu veterinaria al pie. Nuestro modelo de IA (Flux Kontext Max) preserva la identidad del animal con alta fidelidad incluso en razas poco comunes, manchas específicas o rasgos particulares.',
            'Para ti es diferenciación real frente al resto de hospitales veterinarios en tu ciudad. Pocas clínicas en México ofrecen acompañamiento digital del duelo; tú serías referente en Ciudad de México, Guadalajara, Monterrey, Querétaro, Puebla, Mérida o donde estés. Además recibes 15% de comisión cada vez que una familia sube al plan artístico, al plan Eterno con placa o añade el Portal AR — ingreso pasivo que se acumula mes a mes sin que tengas que gestionar cobros, hosting ni soporte técnico.',
            'La infraestructura cumple con la Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP). Los nichos virtuales son privados hasta que la familia paga el plan base; los datos se alojan con TLS y row-level security. Firmamos Acuerdo de Procesamiento de Datos (DPA) si lo solicitas. Todas las facturas van con CFDI 4.0 a nombre de tu razón social, y el envío de placas físicas es nacional sin costo adicional en el Pack 30.',
          ],
        },
      }}
    />
  );
}
