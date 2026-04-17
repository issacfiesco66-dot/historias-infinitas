import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, QrCode } from 'lucide-react';
import { MemorialEditor } from './editor';
import type { Memorial, MemorialMedia } from '@/types/database';

export default async function EditMemorialPage({ params }: { params: { id: string } }) {
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

  const { data: media } = await supabase
    .from('memorial_media')
    .select('*')
    .eq('memorial_id', params.id)
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-sm text-pizarra-500 hover:text-pizarra-800">
            ← Volver
          </Link>
          <h1 className="font-serif text-4xl text-pizarra-800 mt-2">{memorial.name}</h1>
          <p className="text-sm text-pizarra-500">
            /{memorial.slug}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/memorial/${memorial.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" /> Ver público
            </Link>
          </Button>
          <Button asChild variant="dorado">
            <Link href={`/dashboard/memorial/${memorial.id}/qr`}>
              <QrCode className="h-4 w-4 mr-2" /> QR
            </Link>
          </Button>
        </div>
      </div>

      <MemorialEditor
        memorial={memorial as Memorial}
        initialMedia={(media ?? []) as MemorialMedia[]}
      />
    </div>
  );
}
