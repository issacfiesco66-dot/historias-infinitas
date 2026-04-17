'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get('type'); // mascota | ser_querido
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: String(form.get('email')),
      password: String(form.get('password')),
      options: {
        data: { full_name: String(form.get('full_name')) },
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(`/dashboard${type ? `?type=${type}` : ''}`)}`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <h1 className="font-serif text-3xl text-pizarra-800 mb-3">Revisa tu correo</h1>
        <p className="text-pizarra-500">
          Te hemos enviado un enlace para confirmar tu cuenta y comenzar el memorial.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">Comienza aquí</p>
      <h1 className="font-serif text-4xl text-pizarra-800 mb-2">Crear una cuenta</h1>
      <p className="text-sm text-pizarra-500 mb-10">
        Tu santuario digital comienza con un paso sencillo.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="full_name">Tu nombre</Label>
          <Input id="full_name" name="full_name" placeholder="María García" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" placeholder="tu@correo.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" placeholder="mínimo 8 caracteres" minLength={8} required />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

        <Button type="submit" variant="dorado" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creando...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-center text-pizarra-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-dorado-600 hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}
