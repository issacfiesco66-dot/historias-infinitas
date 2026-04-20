'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PawPrint, Users, ArrowRight, ArrowLeft, Heart, Loader2, Check, Mail,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { savePendingMemorial, type PendingMemorialType } from '@/lib/pending-memorial';

type Stage = 'elegir' | 'datos' | 'registro' | 'enviado';

const EPITAPH_MAX = 150;

export function EmpiezaWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const queryType = params.get('type') as PendingMemorialType | null;
  const presetEmail = params.get('email') ?? '';

  // Si llega con ?type=X, saltamos directamente a "datos".
  const initialStage: Stage = queryType === 'mascota' || queryType === 'ser_querido' ? 'datos' : 'elegir';

  const [stage, setStage] = useState<Stage>(initialStage);
  const [type, setType] = useState<PendingMemorialType>(queryType ?? 'ser_querido');
  const [form, setForm] = useState({
    name: '',
    birth_date: '',
    passing_date: '',
    epitaph: '',
  });

  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidDatos = form.name.trim().length >= 2;

  return (
    <div className="container-solemn py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <ProgressBar stage={stage} />

        <AnimatePresence mode="wait">
          {stage === 'elegir' && (
            <StageWrapper key="elegir">
              <TypeSelector
                value={type}
                onPick={(t) => {
                  setType(t);
                  setStage('datos');
                }}
              />
            </StageWrapper>
          )}

          {stage === 'datos' && (
            <StageWrapper key="datos">
              <DatosForm
                type={type}
                form={form}
                setForm={setForm}
                canGoBack={initialStage === 'elegir'}
                onBack={() => setStage('elegir')}
                onNext={() => {
                  savePendingMemorial({ ...form, type });
                  setStage('registro');
                }}
                isValid={isValidDatos}
              />
            </StageWrapper>
          )}

          {stage === 'registro' && (
            <StageWrapper key="registro">
              <RegistroStage
                type={type}
                form={form}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                fullName={fullName}
                setFullName={setFullName}
                submitting={submitting}
                error={error}
                onBack={() => { setStage('datos'); setError(null); }}
                onSubmit={async () => {
                  setError(null);
                  setSubmitting(true);
                  try {
                    // 1. Validar password con nuestro endpoint (reusa HIBP + reglas).
                    try {
                      const check = await fetch('/api/auth/check-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password }),
                      }).then((r) => r.json());
                      if (!check.ok) {
                        setSubmitting(false);
                        return setError(check.hint ?? 'Elige una contraseña más segura.');
                      }
                    } catch {
                      // Failure-open — Supabase aplicará sus propias reglas.
                    }

                    // 2. Registro. localStorage ya tiene los datos del memorial;
                    //    /dashboard los reclamará automáticamente tras confirmar email.
                    const supabase = createClient();
                    const { error: signUpErr } = await supabase.auth.signUp({
                      email,
                      password,
                      options: {
                        data: { full_name: fullName },
                        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent('/dashboard')}`,
                      },
                    });
                    setSubmitting(false);
                    if (signUpErr) {
                      return setError(signUpErr.message);
                    }
                    setStage('enviado');
                  } catch (err: any) {
                    setSubmitting(false);
                    setError(err?.message ?? 'No pudimos crear tu cuenta. Intenta de nuevo.');
                  }
                }}
              />
            </StageWrapper>
          )}

          {stage === 'enviado' && (
            <StageWrapper key="enviado">
              <EnviadoStage email={email} />
            </StageWrapper>
          )}
        </AnimatePresence>

        {/* "¿Ya tienes cuenta?" — siempre visible excepto en confirmación */}
        {stage !== 'enviado' && (
          <p className="mt-10 text-center text-sm text-pizarra-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              href={email ? `/login?email=${encodeURIComponent(email)}` : '/login'}
              className="text-dorado-600 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 *  Progress bar — 3 pasos visuales (elegir/datos se cuentan como 1)
 * ========================================================================== */

function ProgressBar({ stage }: { stage: Stage }) {
  const steps = [
    { id: 'elegir', label: 'Sobre quién' },
    { id: 'datos', label: 'Datos' },
    { id: 'registro', label: 'Guardar' },
  ];
  const currentIdx =
    stage === 'elegir' ? 0 :
    stage === 'datos' ? 1 :
    stage === 'registro' ? 2 :
    3;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((s, i) => {
          const reached = i <= currentIdx;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    reached
                      ? 'bg-dorado-500 text-pizarra-900'
                      : 'bg-pizarra-100 text-pizarra-400'
                  }`}
                >
                  {i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-pizarra-500 mt-2">
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 mb-5 transition-colors ${
                    i < currentIdx ? 'bg-dorado-400' : 'bg-pizarra-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -14, filter: 'blur(3px)' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================================
 *  Stage 1 — elegir tipo
 * ========================================================================== */

function TypeSelector({
  value, onPick,
}: { value: PendingMemorialType; onPick: (t: PendingMemorialType) => void }) {
  return (
    <div className="text-center">
      <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">Paso 1 de 3</p>
      <h1 className="font-serif text-3xl md:text-4xl text-pizarra-800 mb-3 leading-tight">
        ¿A quién quieres honrar?
      </h1>
      <p className="text-pizarra-500 max-w-md mx-auto mb-10">
        Elige para empezar. Puedes cambiar cualquier detalle después, a tu ritmo.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <TypeCard
          icon={<Users className="h-6 w-6" />}
          title="Un ser querido"
          hint="Familiar, amigo, alguien amado"
          active={value === 'ser_querido'}
          onClick={() => onPick('ser_querido')}
        />
        <TypeCard
          icon={<PawPrint className="h-6 w-6" />}
          title="Una mascota"
          hint="Un compañero fiel"
          active={value === 'mascota'}
          onClick={() => onPick('mascota')}
        />
      </div>

      <p className="text-[11px] text-pizarra-400 mt-8">
        Sin registro para empezar · en 2 minutos ves cómo se verá
      </p>
    </div>
  );
}

function TypeCard({
  icon, title, hint, active, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.3 }}
      className={`text-center rounded-2xl p-8 border transition-all bg-marfil ${
        active
          ? 'border-dorado-500 shadow-dorado'
          : 'border-pizarra-100 hover:border-dorado-300 shadow-solemn'
      }`}
    >
      <div className={`mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
        active ? 'bg-dorado-500 text-pizarra-900' : 'bg-dorado-100 text-dorado-700'
      }`}>
        {icon}
      </div>
      <p className="font-serif text-xl text-pizarra-800 mb-1">{title}</p>
      <p className="text-sm text-pizarra-500">{hint}</p>
    </motion.button>
  );
}

/* ============================================================================
 *  Stage 2 — datos básicos
 * ========================================================================== */

function DatosForm({
  type, form, setForm, onBack, onNext, canGoBack, isValid,
}: {
  type: PendingMemorialType;
  form: { name: string; birth_date: string; passing_date: string; epitaph: string };
  setForm: (f: typeof form) => void;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  isValid: boolean;
}) {
  const isPet = type === 'mascota';
  const namePlaceholder = isPet ? 'Ej. Luna' : 'Ej. Don Ignacio';
  const epitaphPlaceholder = isPet
    ? 'Una palabra, un gesto — lo que defina su alma.'
    : 'Una frase que capture su esencia.';

  return (
    <div>
      <div className="text-center mb-8">
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">Paso 2 de 3</p>
        <h1 className="font-serif text-3xl md:text-4xl text-pizarra-800 mb-2 leading-tight">
          Cuéntame lo esencial
        </h1>
        <p className="text-pizarra-500 max-w-md mx-auto">
          Solo unos datos para empezar. Biografía, fotos y retrato los añadirás después.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre {isPet ? 'de la mascota' : 'completo'}
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={namePlaceholder}
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_date">Nacimiento</Label>
              <Input
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passing_date">Partida</Label>
              <Input
                id="passing_date"
                type="date"
                value={form.passing_date}
                onChange={(e) => setForm({ ...form, passing_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="epitaph">Epitafio (opcional)</Label>
              <span className={`text-[11px] ${form.epitaph.length > EPITAPH_MAX ? 'text-red-600' : 'text-pizarra-400'}`}>
                {form.epitaph.length} / {EPITAPH_MAX}
              </span>
            </div>
            <Textarea
              id="epitaph"
              rows={2}
              value={form.epitaph}
              onChange={(e) => setForm({ ...form, epitaph: e.target.value.slice(0, EPITAPH_MAX + 10) })}
              placeholder={epitaphPlaceholder}
              className="font-serif text-base"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        {canGoBack ? (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
          </Button>
        ) : <div />}
        <Button variant="dorado" size="lg" onClick={onNext} disabled={!isValid}>
          Ver cómo se verá <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
 *  Stage 3 — preview + registro inline
 * ========================================================================== */

function RegistroStage({
  type, form, email, setEmail, password, setPassword, fullName, setFullName,
  submitting, error, onBack, onSubmit,
}: {
  type: PendingMemorialType;
  form: { name: string; birth_date: string; passing_date: string; epitaph: string };
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <p className="uppercase tracking-[0.3em] text-xs text-dorado-600 mb-3">Paso 3 de 3</p>
        <h1 className="font-serif text-3xl md:text-4xl text-pizarra-800 mb-2 leading-tight">
          Así se verá tu tributo
        </h1>
        <p className="text-pizarra-500 max-w-md mx-auto">
          Guarda tu progreso con tu correo. Podrás añadir fotos, biografía y retrato IA después.
        </p>
      </div>

      {/* Preview card */}
      <div className="mb-8 rounded-2xl overflow-hidden bg-pizarra-800 text-marfil shadow-solemn">
        <div className="aspect-[16/10] bg-gradient-to-b from-pizarra-700 to-pizarra-900 flex items-center justify-center relative">
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 60%, rgba(183,148,90,0.4), transparent 60%)',
            }}
          />
          <div className="relative text-center px-6">
            <p className="uppercase tracking-[0.35em] text-[10px] text-dorado-300 mb-3">
              {type === 'mascota' ? 'En memoria de un compañero fiel' : 'En memoria eterna'}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-marfil leading-tight">
              {form.name || 'Tu ser querido'}
            </h2>
            {(form.birth_date || form.passing_date) && (
              <p className="text-marfil/70 text-sm tracking-widest mt-3">
                {form.birth_date && formatShortDate(form.birth_date)}
                {form.birth_date && form.passing_date && <span className="mx-2">·</span>}
                {form.passing_date && formatShortDate(form.passing_date)}
              </p>
            )}
          </div>
        </div>
        {form.epitaph && (
          <div className="px-8 py-6 border-t border-marfil/10 text-center">
            <p className="font-serif italic text-lg text-marfil/90 leading-relaxed">
              &ldquo;{form.epitaph}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Registration form */}
      <Card>
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 text-dorado-600 mb-1">
            <Mail className="h-4 w-4" />
            <span className="uppercase tracking-widest text-[11px]">Guarda tu progreso</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Tu nombre</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="María García"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Tu correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 12 caracteres"
              minLength={12}
              required
              autoComplete="new-password"
            />
            <p className="text-[11px] text-pizarra-400">
              12+ caracteres, con mayúscula, minúscula y número.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
        </Button>
        <Button
          variant="dorado"
          size="lg"
          onClick={onSubmit}
          disabled={submitting || !email || !password || !fullName || password.length < 12}
        >
          {submitting
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creando…</>
            : <>Guardar y continuar <ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </div>

      <p className="mt-6 text-[11px] text-pizarra-400 text-center max-w-md mx-auto leading-relaxed">
        Al continuar aceptas los <Link href="/terminos" className="underline">Términos</Link> y
        el <Link href="/privacidad" className="underline">Aviso de Privacidad</Link>.
        Crear el nicho virtual es gratis; para publicarlo elegirás plan desde $299 MXN.
      </p>
    </div>
  );
}

/* ============================================================================
 *  Stage 4 — "revisa tu correo"
 * ========================================================================== */

function EnviadoStage({ email }: { email: string }) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto w-16 h-16 rounded-full bg-dorado-100 flex items-center justify-center mb-6">
        <Heart className="h-7 w-7 text-dorado-600" />
      </div>
      <h1 className="font-serif text-3xl md:text-4xl text-pizarra-800 mb-3 leading-tight">
        Revisa tu correo
      </h1>
      <p className="text-pizarra-600 max-w-md mx-auto mb-3 leading-relaxed">
        Enviamos un enlace a <strong className="text-pizarra-800">{email}</strong>.
        Ábrelo para confirmar tu cuenta — cuando regreses, tu tributo estará esperándote.
      </p>
      <p className="text-sm text-pizarra-400 max-w-md mx-auto mt-8">
        ¿No llegó en unos minutos? Revisa la carpeta de spam o{' '}
        <Link href="/contacto" className="text-dorado-600 underline">escríbenos</Link>.
      </p>
    </div>
  );
}

/* ============================================================================
 *  Helpers
 * ========================================================================== */

function formatShortDate(iso: string): string {
  // iso = 'YYYY-MM-DD' — lo parseamos manualmente para evitar timezone shifts.
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}
