import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, QrCode, Sparkles, CreditCard, Lock } from 'lucide-react';
import type { Memorial } from '@/types/database';
import { formatDate } from '@/lib/utils';

export default async function DashboardHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: memorials } = await supabase
    .from('memorials')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  const list = (memorials ?? []) as Memorial[];

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-2">Panel privado</p>
          <h1 className="font-serif text-4xl text-pizarra-800">Mis Memoriales</h1>
          <p className="text-pizarra-500 mt-2">
            Gestiona los santuarios digitales que has creado.
          </p>
        </div>
        <Button asChild variant="dorado" size="lg">
          <Link href="/dashboard/new">
            <PlusCircle className="h-4 w-4 mr-2" /> Nuevo memorial
          </Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-dorado-100 flex items-center justify-center mb-6">
            <Sparkles className="h-7 w-7 text-dorado-600" />
          </div>
          <h2 className="font-serif text-2xl text-pizarra-800 mb-2">
            Aún no tienes memoriales
          </h2>
          <p className="text-pizarra-500 mb-6 max-w-md mx-auto">
            Da vida a un recuerdo eterno. Crea tu primer memorial con fotografías, IA y AR.
          </p>
          <Button asChild variant="dorado">
            <Link href="/dashboard/new">Crear el primero</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((m) => {
            const paid = m.status === 'publicado';
            return (
              <Card key={m.id} className="overflow-hidden hover:shadow-dorado transition-shadow">
                <div
                  className="aspect-[4/3] bg-pizarra-100 bg-cover bg-center relative"
                  style={{ backgroundImage: m.cover_photo_url ? `url(${m.cover_photo_url})` : undefined }}
                >
                  {!paid && (
                    <div className="absolute inset-0 bg-pizarra-900/50 flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-marfil/95 rounded-full px-4 py-1.5 text-xs text-pizarra-700 shadow">
                        <Lock className="h-3.5 w-3.5 text-dorado-600" />
                        Borrador — no público
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-widest text-dorado-600">
                      {m.type === 'mascota' ? 'Mascota' : 'Ser querido'}
                    </span>
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                      paid ? 'bg-green-50 text-green-700' :
                      m.status === 'privado' ? 'bg-amber-50 text-amber-700' :
                      'bg-pizarra-100 text-pizarra-600'
                    }`}>
                      {paid ? 'activo' : 'borrador'}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-pizarra-800 mb-1">{m.name}</h3>
                  <p className="text-xs text-pizarra-500">
                    {formatDate(m.birth_date)} — {formatDate(m.passing_date)}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/dashboard/memorial/${m.id}`}>Editar</Link>
                    </Button>
                    {paid ? (
                      <>
                        <Button asChild size="icon" variant="ghost" title="Ver público">
                          <Link href={`/memorial/${m.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" title="QR">
                          <Link href={`/dashboard/memorial/${m.id}/qr`}>
                            <QrCode className="h-4 w-4" />
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button asChild size="sm" variant="dorado" title="Completar pago">
                        <Link href={`/dashboard/memorial/${m.id}/checkout`}>
                          <CreditCard className="h-4 w-4 mr-1.5" /> Pagar
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
