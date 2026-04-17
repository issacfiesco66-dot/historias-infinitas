import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckoutForm } from './checkout-form';
import type { Memorial } from '@/types/database';

interface Props { params: { id: string } }

export const metadata = {
  title: 'Finalizar tributo — Historias Infinitas',
  robots: { index: false },
};

export default async function CheckoutPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: memorial } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single();

  if (!memorial) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/memorial/${memorial.id}`}
        className="text-sm text-pizarra-500 hover:text-pizarra-800"
      >
        ← Volver al memorial
      </Link>

      <div>
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-2">Último paso</p>
        <h1 className="font-serif text-4xl md:text-5xl text-pizarra-800 leading-tight">
          Elige cómo deseas <span className="text-gradient-dorado italic">preservar esta historia</span>
        </h1>
        <p className="text-pizarra-500 mt-3 max-w-2xl">
          Un único pago, sin suscripciones. El memorial y su QR quedan contigo para siempre.
        </p>
      </div>

      <CheckoutForm memorial={memorial as Memorial} />
    </div>
  );
}
