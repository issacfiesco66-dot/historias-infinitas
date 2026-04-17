'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  sessionId: string;
  email: string;
  businessName: string;
}

/**
 * Formulario inline que el partner ve INMEDIATAMENTE después de pagar.
 *
 * 1. POST /api/partners/activate-now con { session_id, password }
 *    → crea el usuario en auth con email confirmado (sin correo).
 * 2. supabase.auth.signInWithPassword → queda loggeado en el navegador.
 * 3. router.push('/dashboard/partner').
 */
export default function ActivateForm({ sessionId, email, businessName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirm  = String(form.get('confirm')  ?? '');

    if (password.length < 8) {
      setLoading(false);
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }
    if (password !== confirm) {
      setLoading(false);
      return setError('Las contraseñas no coinciden.');
    }

    try {
      const res = await fetch('/api/partners/activate-now', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setLoading(false);
        return setError(
          data?.error === 'cuenta_no_activa'
            ? 'Tu cuenta no está activa. Escríbenos a hola@historias-infinitas.com.'
            : data?.detail ?? data?.error ?? 'No pudimos crear tu acceso.',
        );
      }

      // 2. Iniciar sesión en el navegador con las cookies adecuadas
      const supabase = createClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email ?? email,
        password,
      });
      if (signInErr) {
        setLoading(false);
        return setError(
          'Tu acceso quedó creado, pero no pudimos iniciarte sesión automáticamente. Intenta desde /login.',
        );
      }

      router.push('/dashboard/partner');
      router.refresh();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? 'Error inesperado. Intenta de nuevo.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-left">
      <div className="space-y-2">
        <Label htmlFor="business">Tu organización</Label>
        <Input id="business" value={businessName} readOnly className="bg-marfil-50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo de acceso</Label>
        <Input id="email" type="email" value={email} readOnly className="bg-marfil-50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirma la contraseña</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          placeholder="Repítela"
          minLength={8}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      <Button type="submit" variant="dorado" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Creando tu acceso…' : 'Crear contraseña y entrar a mi panel'}
      </Button>

      <p className="text-xs text-pizarra-400 text-center">
        Al crear tu acceso aceptas nuestros{' '}
        <a href="/terminos" className="underline">Términos</a> y{' '}
        <a href="/privacidad" className="underline">Aviso de Privacidad</a>.
      </p>
    </form>
  );
}
