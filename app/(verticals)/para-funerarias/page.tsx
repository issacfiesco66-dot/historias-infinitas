import type { Metadata } from 'next';
import { VerticalLanding } from '../vertical-landing';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Memoriales digitales para Funerarias — Historias Infinitas',
  description:
    'Ofrece a tus familias un memorial digital con QR, retrato IA y placa física grabada con el logo de tu funeraria. Planes desde $999 MXN. Factura CFDI. 30 días de garantía.',
  alternates: { canonical: '/para-funerarias' },
  keywords: [
    'memorial digital para funeraria',
    'software para funerarias México',
    'servicio funerario digital',
    'tributo digital funeraria',
    'QR memorial funeraria',
    'placa digital funeraria',
  ],
  openGraph: {
    title: 'Memoriales digitales con tu marca — para Funerarias',
    description:
      'Regala un memorial digital con QR y retrato IA a cada familia. Con el logo de tu funeraria. Desde $999 MXN.',
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
        eyebrow: 'Para Funerarias · Casas de Velación · Servicios Memoriales en México',
        h1: (
          <>
            El servicio que{' '}
            <span className="text-gradient-dorado italic">diferencia a tu funeraria</span>{' '}
            del resto.
          </>
        ),
        intro:
          'Regala a cada familia un memorial digital con retrato IA, QR imprimible y placa grabada — con el logo de tu funeraria. Las familias te recuerdan por años, te recomiendan, y upgradean (tú recibes 15 % de comisión).',
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
            title: 'Tu marca en cada memorial',
            text:
              'El logo de tu funeraria aparece al pie de cada memorial y en la placa física grabada. Atribución permanente sin pagar publicidad.',
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
            q: '¿Cómo se entrega el memorial a la familia?',
            a: 'Imprimes el QR en una tarjeta (te damos el PDF) o lo grabamos en una placa física de acero inoxidable. Durante el servicio, tu equipo lo entrega con un pequeño guion que te proporcionamos.',
          },
          {
            q: '¿Podemos ofrecerlo como parte de un paquete funerario existente?',
            a: 'Sí. La mayoría de nuestros socios lo añaden al paquete "servicio integral" con un costo absorbido o lo cobran como complemento premium. Te ayudamos a definir el posicionamiento.',
          },
          {
            q: '¿Qué pasa con los datos de los fallecidos y sus familias?',
            a: 'Somos responsables del tratamiento bajo LFPDPPP. Los memoriales solo son públicos tras el pago; los borradores quedan privados. Firmamos Acuerdo de Procesamiento de Datos (DPA) si lo solicitas.',
          },
          {
            q: '¿Qué incluye la placa física?',
            a: 'Acero inoxidable con grabado láser del QR y tu logo. En el Pack 30 incluimos 5 placas; placas adicionales a $399 MXN cada una. Envío nacional incluido.',
          },
        ],
        keywords: [],
      }}
    />
  );
}
