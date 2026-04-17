import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

export default async function MemorialQrPage({ params }: { params: { id: string } }) {
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
