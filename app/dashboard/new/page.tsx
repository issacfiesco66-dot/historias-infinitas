'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, Users } from 'lucide-react';
import type { MemorialType } from '@/types/database';
import { createMemorial } from './actions';

export default function NewMemorialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as MemorialType) ?? 'ser_querido';

  const [type, setType] = useState<MemorialType>(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await createMemorial({
      name:         String(form.get('name')),
      type,
      birth_date:   String(form.get('birth_date') ?? '') || null,
      passing_date: String(form.get('passing_date') ?? '') || null,
      biography:    String(form.get('biography') ?? '') || null,
      epitaph:      String(form.get('epitaph') ?? '') || null,
    });

    setLoading(false);
    if (!res.ok || !res.id) return setError(res.error ?? 'No se pudo crear');
    router.push(`/dashboard/memorial/${res.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-2">Paso 1 de 3</p>
      <h1 className="font-serif text-4xl text-pizarra-800 mb-2">Crea el memorial</h1>
      <p className="text-pizarra-500 mb-10">Los datos esenciales. Podrás añadir fotos e IA después.</p>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* TIPO */}
        <div>
          <Label>Tipo de memorial</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <TypeCard
              active={type === 'mascota'}
              onClick={() => setType('mascota')}
              icon={<PawPrint className="h-5 w-5" />}
              title="Mascota"
              hint="Para un compañero fiel"
            />
            <TypeCard
              active={type === 'ser_querido'}
              onClick={() => setType('ser_querido')}
              icon={<Users className="h-5 w-5" />}
              title="Ser querido"
              hint="Familiar, amigo o persona amada"
            />
          </div>
        </div>

        {/* NOMBRE */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" placeholder="p. ej. Luna" required />
        </div>

        {/* FECHAS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de nacimiento</Label>
            <Input id="birth_date" name="birth_date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passing_date">Fecha de partida</Label>
            <Input id="passing_date" name="passing_date" type="date" />
          </div>
        </div>

        {/* BIOGRAFÍA */}
        <div className="space-y-2">
          <Label htmlFor="biography">Biografía</Label>
          <Textarea
            id="biography"
            name="biography"
            rows={6}
            placeholder="Cuenta su historia, sus momentos preferidos, su esencia..."
          />
        </div>

        {/* EPITAFIO */}
        <div className="space-y-2">
          <Label htmlFor="epitaph">Epitafio (frase breve)</Label>
          <Input id="epitaph" name="epitaph" placeholder="Siempre en nuestros corazones" />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" variant="dorado" disabled={loading}>
            {loading ? 'Creando...' : 'Continuar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function TypeCard({
  active, onClick, icon, title, hint,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border p-5 transition-all ${
        active
          ? 'border-dorado-500 bg-dorado-50 shadow-dorado'
          : 'border-pizarra-200 bg-marfil hover:border-dorado-300'
      }`}
    >
      <div className="flex items-center gap-2 text-dorado-600 mb-2">{icon}<span className="uppercase tracking-widest text-[10px]">{title}</span></div>
      <p className="font-serif text-lg text-pizarra-800">{title}</p>
      <p className="text-xs text-pizarra-500 mt-1">{hint}</p>
    </button>
  );
}
