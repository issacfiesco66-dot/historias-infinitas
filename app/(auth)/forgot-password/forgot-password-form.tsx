'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordForm() {
  const params = useSearchParams();
  const presetEmail = params?.get('email') ?? '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email')).trim();

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    // Por privacidad mostramos el mismo mensaje exista o no la cuenta:
    // así no exponemos qué correos están registrados.
    if (error && error.status && error.status >= 500) {
      return setError('No pudimos enviar el correo. Intenta de nuevo en unos minutos.');
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">Revisa tu correo</p>
        <h1 className="font-serif text-3xl text-pizarra-800 mb-3">Enlace enviado</h1>
        <p className="text-pizarra-500 mb-8">
          Si esa cuenta existe, te llegará un enlace seguro para restablecer tu contraseña.
          Caduca en 1 hora.
        </p>
        <Link href="/login" className="text-dorado-600 hover:underline text-sm">
          ← Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-4">Recuperar acceso</p>
      <h1 className="font-serif text-4xl text-pizarra-800 mb-2">¿Olvidaste tu contraseña?</h1>
      <p className="text-sm text-pizarra-500 mb-10">
        Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            required
            defaultValue={presetEmail}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

        <Button type="submit" variant="dorado" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-center text-pizarra-500">
        ¿Recordaste tu contraseña?{' '}
        <Link href="/login" className="text-dorado-600 hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}
