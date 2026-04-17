import type { Metadata } from 'next';
import { VerticalLanding } from '../vertical-landing';
import { Heart, TrendingUp, HeartHandshake, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Memoriales digitales para Hospicios y Cuidados Paliativos — Historias Infinitas',
  description:
    'Un regalo para las familias que acompañan a un ser querido en sus últimos días. Memorial digital con biografía, retrato IA y QR — con el logo de tu hospicio. Desde $999 MXN.',
  alternates: { canonical: '/para-hospicios' },
  keywords: [
    'hospicio memorial digital',
    'cuidados paliativos México',
    'legado digital hospicio',
    'preservar historia adulto mayor',
    'servicio duelo familia hospicio',
  ],
  openGraph: {
    title: 'Un legado digital — para Hospicios y Cuidados Paliativos',
    description:
      'Acompaña a cada familia con un memorial digital que preserva la historia, la voz y el retrato de su ser querido.',
    url: '/para-hospicios',
    type: 'article',
  },
};

export default function ParaHospiciosPage() {
  return (
    <VerticalLanding
      copy={{
        vertical: 'Hospicios y Cuidados Paliativos',
        keywordH1: 'hospicios',
        canonical: '/para-hospicios',
        eyebrow: 'Para Hospicios · Cuidados Paliativos · Geriátricos en México',
        h1: (
          <>
            Preservar la historia{' '}
            <span className="text-gradient-dorado italic">antes de que se vaya</span>.
          </>
        ),
        intro:
          'En los cuidados paliativos, cada día cuenta. Ofrece a las familias un memorial digital que puedan construir con su ser querido aún presente — biografía, fotos, voz y retrato artístico por IA. Un legado que queda para siempre, con el logo de tu hospicio.',
        pitch: 'Una forma humana de acompañar hasta el final',
        benefits: [
          {
            icon: Heart,
            title: 'Construir juntos en vida',
            text:
              'Invita a la familia a co-crear el memorial mientras el ser querido aún puede participar — compartir su voz, aprobar su retrato, elegir su epitafio. Terapéutico y sanador.',
          },
          {
            icon: HeartHandshake,
            title: 'Tu hospicio, parte del legado',
            text:
              'Tu logo aparece en cada memorial. Las familias asocian tu cuidado con el momento más trascendente. Diferenciación real frente a geriátricos genéricos.',
          },
          {
            icon: TrendingUp,
            title: 'Añade valor a tu cuota',
            text:
              'Ofrécelo como servicio complementario en tu paquete mensual. Ingreso adicional + 15 % de comisión cuando la familia sube al plan Eterno.',
          },
          {
            icon: ShieldCheck,
            title: 'Ética y discreta',
            text:
              'El memorial es privado hasta que la familia decide publicarlo. Cumplimos LFPDPPP y firmamos DPA si lo requieres. La dignidad del paciente es prioridad.',
          },
        ],
        testimonial: {
          quote:
            'Ver a una familia grabar la voz de su padre antes de partir — y luego escucharla meses después — cambia el duelo. Es la herramienta emocional más valiosa que hemos incorporado.',
          author: 'Hospicio en Monterrey · testimonial editable',
        },
        faqs: [
          {
            q: '¿Qué pasa si el ser querido fallece antes de terminar el memorial?',
            a: 'El memorial se puede completar en cualquier momento — la familia conserva el acceso. También se pueden añadir fotos y videos post-facto. No hay plazo para publicar.',
          },
          {
            q: '¿Hay apoyo psicológico o sólo herramienta técnica?',
            a: 'Nosotros somos la herramienta técnica. Recomendamos que el memorial se integre a tu programa de acompañamiento emocional. Te compartimos el guion de conversación que hemos probado con familias.',
          },
          {
            q: '¿Podemos pre-pagar por varios pacientes a la vez?',
            a: 'Sí, ese es exactamente el modelo de los planes partner. Con el Pack 30 ($4,999 MXN) obtienes 30 memoriales + 5 placas físicas con tu logo, válidos 12 meses.',
          },
          {
            q: '¿Funciona para enfermedades degenerativas (Alzheimer, etc.)?',
            a: 'Especialmente bien: los familiares pueden rescatar la historia mientras aún es posible. El retrato IA recupera la expresión vital del ser querido desde fotografías antiguas.',
          },
        ],
        keywords: [],
      }}
    />
  );
}
