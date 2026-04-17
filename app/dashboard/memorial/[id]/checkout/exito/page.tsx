import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, QrCode, Heart } from 'lucide-react';

interface Props {
  params: { id: string };
  searchParams: { session_id?: string };
}

export const metadata = {
  title: 'Gracias — Historias Infinitas',
  robots: { index: false },
};

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: memorial } = await supabase
    .from('memorials')
    .select('id, slug, name')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single();

  if (!memorial) notFound();

  return (
    <div className="max-w-2xl mx-auto text-center py-10">
      <div className="mx-auto w-16 h-16 rounded-full bg-dorado-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="h-8 w-8 text-dorado-600" />
      </div>

      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">Orden confirmada</p>
      <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 leading-tight">
        Gracias por este gesto,<br />
        <span className="text-gradient-dorado italic">{memorial.name}</span> lo merece.
      </h1>

      <p className="text-pizarra-500 mt-4">
        Hemos recibido tu orden y te enviamos el resumen a tu correo.
        En breve comenzaremos a preparar tu placa con QR.
      </p>

      <Card className="mt-10 text-left">
        <CardContent className="p-6 space-y-4">
          <p className="uppercase tracking-widest text-[11px] text-dorado-600">Lo que sigue</p>
          <ol className="space-y-3 text-sm text-pizarra-700">
            <li className="flex gap-3">
              <Heart className="h-4 w-4 text-dorado-500 mt-0.5 shrink-0" />
              Revisa tu memorial y completa los últimos detalles si lo deseas.
            </li>
            <li className="flex gap-3">
              <QrCode className="h-4 w-4 text-dorado-500 mt-0.5 shrink-0" />
              Imprimiremos la placa con QR único y te avisaremos por correo cuando salga hacia tu hogar.
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild variant="dorado">
          <Link href={`/dashboard/memorial/${memorial.id}`}>Volver al memorial</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/memorial/${memorial.slug}`} target="_blank">Ver memorial público</Link>
        </Button>
      </div>

      {searchParams.session_id && (
        <p className="mt-8 font-mono text-[10px] text-pizarra-300">
          ref: {searchParams.session_id}
        </p>
      )}
    </div>
  );
}
