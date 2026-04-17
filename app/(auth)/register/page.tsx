import { Suspense } from 'react';
import RegisterForm from './register-form';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-fade-up">
          <div className="h-6 w-32 rounded-md bg-pizarra-100 mb-4" />
          <div className="h-10 w-64 rounded-md bg-pizarra-100" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
