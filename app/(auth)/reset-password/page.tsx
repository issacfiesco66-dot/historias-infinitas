import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordForm from './reset-password-form';

export const metadata: Metadata = {
  title: 'Nueva contraseña — Historias Infinitas',
  description: 'Define una nueva contraseña para tu cuenta.',
  robots: { index: false, follow: true },
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-fade-up">
          <div className="h-6 w-32 rounded-md bg-pizarra-100 mb-4" />
          <div className="h-10 w-64 rounded-md bg-pizarra-100" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
