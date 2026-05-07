'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Phase = 'checking' | 'ready' | 'no-session' | 'done';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tras pasar por /auth/callback el usuario tiene una sesión "recovery"
  // de Supabase. Sin esa sesión la página no debe permitir cambiar password.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setPhase(data.user ? 'ready' : 'no-session');
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));
    const confirm = String(form.get('confirm'));

    if (password !== confirm) {
      setLoading(false);
      return setError('Las contraseñas no coinciden.');
    }

    // Misma validación de fuerza + HIBP que en registro.
    try {
      const checkRes = await fetch('/api/auth/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const check = await checkRes.json();
      if (!check.ok) {
        setLoading(false);
        return setError(check.hint ?? 'Elige una contraseña más segura.');
      }
    } catch {
      // Failure-open: si falla nuestro endpoint, Supabase aplicará sus reglas.
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setPhase('done');
    setTimeout(() => router.replace('/dashboard'), 1500);
  }

  if (phase === 'checking') {
    return (
      <div className="animate-fade-up">
        <div className="h-6 w-32 rounded-md bg-pizarra-100 mb-4" />
        <div className="h-10 w-64 rounded-md bg-pizarra-100" />
      </div>
    );
  }

  if (phase === 'no-session') {
    return (
      <div className="animate-fade-up text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">Enlace inválido</p>
        <h1 className="font-serif text-3xl text-pizarra-800 mb-3">El enlace caducó</h1>
        <p className="text-pizarra-500 mb-8">
          El enlace de recuperación ya no es válido o expiró. Solicita uno nuevo.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center rounded-md bg-dorado-600 hover:bg-dorado-700 text-white text-sm px-5 py-3 transition"
        >
          Pedir nuevo enlace
        </Link>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="animate-fade-up text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">Listo</p>
        <h1 className="font-serif text-3xl text-pizarra-800 mb-3">Contraseña actualizada</h1>
        <p className="text-pizarra-500">Te llevamos a tu panel...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">Nuevo acceso</p>
      <h1 className="font-serif text-4xl text-pizarra-800 mb-2">Define una nueva contraseña</h1>
      <p className="text-sm text-pizarra-500 mb-10">
        Elige una contraseña que no uses en otros sitios.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="12+ caracteres con mayúscula, minúscula y número"
            minLength={12}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirma la contraseña</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="Repite la contraseña"
            minLength={12}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

        <Button type="submit" variant="dorado" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
        </Button>
      </form>
    </div>
  );
}
