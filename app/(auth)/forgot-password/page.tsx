import type { Metadata } from 'next';
import { Suspense } from 'react';
import ForgotPasswordForm from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Recuperar contraseña — Historias Infinitas',
  description: 'Te enviamos un enlace seguro para restablecer la contraseña de tu cuenta.',
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-fade-up">
          <div className="h-6 w-32 rounded-md bg-pizarra-100 mb-4" />
          <div className="h-10 w-64 rounded-md bg-pizarra-100" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
