import type { Metadata } from 'next';
import { VerticalLanding } from '../vertical-landing';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nichos Virtuales para Funerarias — Historias Infinitas',
  description:
    'Ofrece a tus familias un nicho virtual con QR, retrato IA y placa física grabada con el logo de tu funeraria. Planes desde $999 MXN. Factura CFDI. 30 días de garantía.',
  alternates: {
    canonical: '/para-funerarias',
    languages: {
      'es-MX': '/para-funerarias',
      'en-US': '/en/for-funeral-homes',
      'x-default': '/para-funerarias',
    },
  },
  keywords: [
    'nicho virtual para funeraria',
    'software para funerarias México',
    'servicio funerario digital',
    'tributo digital funeraria',
    'QR nicho virtual funeraria',
    'placa digital funeraria',
    'funeraria CDMX',
    'funeraria Guadalajara',
    'funeraria Monterrey',
    'funeraria Puebla',
    'funeraria Mérida',
    'servicios funerarios México',
    'cremación CDMX',
    'casa de velación',
  ],
  openGraph: {
    title: 'Nichos Virtuales con tu marca — para Funerarias',
    description:
      'Regala un nicho virtual con QR y retrato IA a cada familia. Con el logo de tu funeraria. Desde $999 MXN.',
    url: '/para-funerarias',
    type: 'article',
  },
};

export default function ParaFunerariasPage() {
  return (
    <VerticalLanding
      copy={{
        vertical: 'Funerarias',
        keywordH1: 'funerarias',
        canonical: '/para-funerarias',
        eyebrow: 'Para Funerarias · Casas de Velación · Servicios Funerarios en México',
        h1: (
          <>
            El servicio que{' '}
            <span className="text-gradient-dorado italic">diferencia a tu funeraria</span>{' '}
            del resto.
          </>
        ),
        intro:
          'Regala a cada familia un nicho virtual con retrato IA, QR imprimible y placa grabada — con el logo de tu funeraria. Las familias te recuerdan por años, te recomiendan, y upgradean (tú recibes 15 % de comisión).',
        pitch: 'Un cierre emocional que te convierte en referencia',
        benefits: [
          {
            icon: Heart,
            title: 'Cierre emocional real',
            text:
              'Las familias salen del servicio con algo digital que preserva a su ser querido — no sólo con el acta. Lo recuerdan años después y te recomiendan.',
          },
          {
            icon: HeartHandshake,
            title: 'Tu marca en cada nicho virtual',
            text:
              'El logo de tu funeraria aparece al pie de cada nicho virtual y en la placa física grabada. Atribución permanente sin pagar publicidad.',
          },
          {
            icon: TrendingUp,
            title: 'Ingreso residual del 15 %',
            text:
              'Cuando una familia sube a plan Eterno o compra el Portal AR, tú recibes 15 % de comisión. Ingreso recurrente sin esfuerzo adicional.',
          },
          {
            icon: ShieldCheck,
            title: 'Cumplimiento legal integrado',
            text:
              'Cumplimos LFPDPPP (Art. 15-17). Firmamos DPA si lo requieres. Los datos de las familias están en infraestructura con TLS y RLS.',
          },
        ],
        testimonial: {
          quote:
            'Empezamos con el Pack 30 y a la tercera semana las familias ya nos mencionaban por esto. Es el cierre emocional que le faltaba a nuestro servicio.',
          author: 'Funeraria en CDMX · testimonial editable',
        },
        faqs: [
          {
            q: '¿Cómo se entrega el nicho virtual a la familia?',
            a: 'Imprimes el QR en una tarjeta (te damos el PDF) o lo grabamos en una placa física de acero inoxidable. Durante el servicio, tu equipo lo entrega con un pequeño guion que te proporcionamos.',
          },
          {
            q: '¿Podemos ofrecerlo como parte de un paquete funerario existente?',
            a: 'Sí. La mayoría de nuestros socios lo añaden al paquete "servicio integral" con un costo absorbido o lo cobran como complemento premium. Te ayudamos a definir el posicionamiento.',
          },
          {
            q: '¿Qué pasa con los datos de los fallecidos y sus familias?',
            a: 'Somos responsables del tratamiento bajo LFPDPPP. Los nichos virtuales solo son públicos tras el pago; los borradores quedan privados. Firmamos Acuerdo de Procesamiento de Datos (DPA) si lo solicitas.',
          },
          {
            q: '¿Qué incluye la placa física?',
            a: 'Acero inoxidable con grabado láser del QR y tu logo. En el Pack 30 incluimos 5 placas; placas adicionales a $399 MXN cada una. Envío nacional incluido.',
          },
        ],
        keywords: [],
        deepContent: {
          heading: 'El servicio digital que las funerarias modernas de México están añadiendo a su paquete',
          paragraphs: [
            'El sector funerario mexicano está transformándose rápidamente. Las familias que pierden a un ser querido en CDMX, Guadalajara, Monterrey, Puebla, Mérida o cualquier otra ciudad ya no se conforman con el acta de defunción, el acta de cremación y los servicios tradicionales de velación. Buscan un cierre emocional tangible — algo que les quede para recordar, compartir en familia y mostrar en aniversarios. Historias Infinitas es ese cierre emocional: un nicho virtual con QR, retrato artístico generado por IA, biografía del ser querido y una placa física de acero inoxidable grabada con láser, todo con el logo de tu funeraria o casa de velación.',
            'Tu equipo entrega el nicho virtual como parte del servicio — sin fricción operativa. Nosotros te damos el PDF del QR listo para imprimir en tarjetas, el guion para presentarlo con respeto durante la ceremonia, y producimos y enviamos las placas físicas a nivel nacional. Las familias acceden al nicho virtual en minutos, suben fotos, escriben la biografía y reciben su URL permanente. Tu marca aparece al pie de cada página pública para siempre — atribución real sin pagar publicidad.',
            'En términos de ingreso, los socios funerarios promedio facturan entre $7,000 y $15,000 MXN adicionales al mes en comisiones sobre upgrades de las familias (15% del plan Eterno o del Portal AR cada vez que alguien sube de plan). El Pack 30 incluye 30 nichos virtuales, 5 placas físicas y onboarding completo por $4,999 MXN, y el plan Anual Pro ofrece volumen para grupos funerarios con múltiples sucursales.',
            'La infraestructura técnica cumple con LFPDPPP y buenas prácticas de la industria funeraria mexicana. Los datos de los fallecidos y sus familias se alojan bajo Row-Level Security y TLS estricto; firmamos Acuerdo de Procesamiento de Datos (DPA) si tu funeraria lo requiere para auditoría interna o para atender solicitudes de titulares. Facturamos con CFDI 4.0 a la razón social que nos indiques, y los pagos se procesan vía Stripe con métodos locales (tarjeta, OXXO, SPEI).',
          ],
        },
      }}
    />
  );
}
