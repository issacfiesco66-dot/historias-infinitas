import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard } from 'lucide-react';
import QRCode from 'qrcode';

export default async function MemorialQrPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: memorial } = await supabase
    .from('memorials')
    .select('id, slug, name, status')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single();

  if (!memorial) notFound();

  // El QR solo se genera para memoriales ya pagados (status = publicado).
  if (memorial.status !== 'publicado') {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <Link
          href={`/dashboard/memorial/${memorial.id}`}
          className="text-sm text-pizarra-500 hover:text-pizarra-800"
        >
          ← Volver al memorial
        </Link>
        <div className="mx-auto w-14 h-14 rounded-full bg-dorado-100 flex items-center justify-center my-6">
          <Lock className="h-6 w-6 text-dorado-600" />
        </div>
        <h1 className="font-serif text-3xl text-pizarra-800 mb-3">
          El QR se activa con el pago
        </h1>
        <p className="text-pizarra-500 mb-8">
          Para generar el QR único y el subdominio permanente de {memorial.name},
          necesitas completar el pago. Es un único cargo — sin suscripciones.
        </p>
        <Button asChild variant="dorado" size="lg">
          <Link href={`/dashboard/memorial/${memorial.id}/checkout`}>
            <CreditCard className="h-4 w-4 mr-2" /> Ver planes y pagar
          </Link>
        </Button>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const publicUrl = `${appUrl}/memorial/${memorial.slug}`;

  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 600,
    color: { dark: '#2E3440', light: '#FBF9F4' },
  });

  return (
    <div className="max-w-2xl mx-auto text-center">
      <Link href={`/dashboard/memorial/${memorial.id}`} className="text-sm text-pizarra-500 hover:text-pizarra-800">
        ← Volver al memorial
      </Link>

      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mt-6 mb-2">Código único</p>
      <h1 className="font-serif text-4xl text-pizarra-800 mb-2">QR de {memorial.name}</h1>
      <p className="text-pizarra-500 mb-10">
        Imprímelo en placas, álbumes o lápidas. Al escanearlo se abrirá el memorial y el Portal AR.
      </p>

      <Card className="p-8">
        <CardContent className="p-0">
          <div className="bg-marfil rounded-xl p-6 inline-block shadow-solemn">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR de ${memorial.name}`} className="w-[320px] h-[320px]" />
          </div>
          <p className="mt-6 font-mono text-xs text-pizarra-400 break-all">{publicUrl}</p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild variant="dorado">
              <a href={qrDataUrl} download={`qr-${memorial.slug}.png`}>
                Descargar PNG
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href={publicUrl} target="_blank">Ver memorial</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
