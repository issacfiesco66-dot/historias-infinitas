'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sendContactForm } from './actions';

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<{ ok: boolean; error?: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const res = await sendContactForm(data);
      setState(res);
      if (res.ok) form.reset();
    });
  }

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl text-pizarra-800 mb-2">
          Tu mensaje fue enviado
        </h3>
        <p className="text-pizarra-500 max-w-md">
          Te responderemos al correo que nos indicaste en un plazo de 24 a 48
          horas hábiles.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={() => setState(null)}
        >
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Honeypot (anti-spam): campo oculto que humanos no llenan */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={120}
            placeholder="p. ej. María López"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={240}
            placeholder="tú@correo.com"
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Asunto</Label>
        <Input
          id="subject"
          name="subject"
          maxLength={160}
          placeholder="¿Sobre qué quieres escribirnos?"
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea
          id="message"
          name="message"
          rows={7}
          required
          maxLength={3000}
          placeholder="Cuéntanos con calma. Leemos cada mensaje."
          disabled={pending}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-pizarra-600">
        <input
          type="checkbox"
          name="consent"
          required
          disabled={pending}
          className="mt-1 accent-dorado-500"
        />
        <span>
          He leído y acepto el{' '}
          <Link href="/privacidad" className="text-dorado-600 underline">
            Aviso de Privacidad
          </Link>
          {' '}y consiento el tratamiento de mis datos para responder esta
          solicitud.
        </span>
      </label>

      {state && !state.ok && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error ?? 'No pudimos enviar tu mensaje.'}</span>
        </div>
      )}

      <Button type="submit" variant="dorado" size="lg" disabled={pending}>
        {pending
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…</>
          : <><Send className="h-4 w-4 mr-2" /> Enviar mensaje</>}
      </Button>
    </form>
  );
}
