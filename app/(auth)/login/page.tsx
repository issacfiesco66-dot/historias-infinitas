'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <div className="animate-fade-up">
      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">Bienvenido de vuelta</p>
      <h1 className="font-serif text-4xl text-pizarra-800 mb-2">Iniciar sesión</h1>
      <p className="text-sm text-pizarra-500 mb-10">
        Accede para continuar gestionando tus memoriales.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" placeholder="tu@correo.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

        <Button type="submit" variant="dorado" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-center text-pizarra-500">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-dorado-600 hover:underline">Crea una</Link>
      </p>
    </div>
  );
}
