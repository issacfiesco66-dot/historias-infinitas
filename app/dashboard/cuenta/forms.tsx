'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2, Check, AlertCircle, UserCircle, KeyRound,
  MapPin, Trash2,
} from 'lucide-react';
import {
  updateProfile,
  changePassword,
  updateOrderShipping,
  deleteAccount,
} from './actions';

type Flash = { kind: 'ok' | 'err'; msg: string } | null;

function FlashBox({ flash }: { flash: Flash }) {
  if (!flash) return null;
  const base = 'flex items-start gap-2 text-sm rounded-md p-3 mt-3 border';
  return flash.kind === 'ok' ? (
    <p className={`${base} bg-green-50 border-green-200 text-green-800`}>
      <Check className="h-4 w-4 mt-0.5 shrink-0" /> {flash.msg}
    </p>
  ) : (
    <p className={`${base} bg-red-50 border-red-200 text-red-700`}>
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {flash.msg}
    </p>
  );
}

/* ============================================================================
 *  1. Perfil — nombre
 * ========================================================================== */
export function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState<Flash>(null);

  return (
    <SectionCard icon={UserCircle} title="Datos de perfil">
      <form
        action={(fd) => start(async () => {
          const r = await updateProfile(fd);
          setFlash(r.ok ? { kind: 'ok', msg: 'Nombre actualizado.' } : { kind: 'err', msg: r.error });
        })}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" value={email} disabled />
          <p className="text-[11px] text-pizarra-400">El correo no se puede cambiar aquí. Escríbenos si lo necesitas.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre completo</Label>
          <Input id="full_name" name="full_name" defaultValue={initialName} required />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="dorado" disabled={pending}>
            {pending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando</> : 'Guardar'}
          </Button>
        </div>
        <FlashBox flash={flash} />
      </form>
    </SectionCard>
  );
}

/* ============================================================================
 *  2. Contraseña
 * ========================================================================== */
export function PasswordForm() {
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState<Flash>(null);

  return (
    <SectionCard icon={KeyRound} title="Contraseña">
      <form
        action={(fd) => start(async () => {
          const r = await changePassword(fd);
          setFlash(r.ok ? { kind: 'ok', msg: 'Contraseña actualizada.' } : { kind: 'err', msg: r.error });
        })}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="current_password">Contraseña actual</Label>
          <Input id="current_password" name="current_password" type="password" required autoComplete="current-password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new_password">Nueva contraseña</Label>
          <Input id="new_password" name="new_password" type="password" required minLength={8} autoComplete="new-password" />
          <p className="text-[11px] text-pizarra-400">Mínimo 8 caracteres.</p>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="dorado" disabled={pending}>
            {pending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cambiando</> : 'Cambiar contraseña'}
          </Button>
        </div>
        <FlashBox flash={flash} />
      </form>
    </SectionCard>
  );
}

/* ============================================================================
 *  3. Editar dirección de una orden
 * ========================================================================== */
interface EditableOrder {
  id: string;
  memorialName: string;
  planId: string;
  status: string;
  shippingAddress: {
    name?: string | null;
    phone?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
}

export function ShippingEditor({ orders }: { orders: EditableOrder[] }) {
  if (orders.length === 0) return null;

  return (
    <SectionCard icon={MapPin} title="Direcciones de envío">
      <p className="text-sm text-pizarra-500 mb-5">
        Puedes editar la dirección de envío mientras la orden no se haya enviado.
        Una vez marcada como enviada, ya no se puede cambiar.
      </p>
      <div className="space-y-4">
        {orders.map((o) => <OrderShippingRow key={o.id} order={o} />)}
      </div>
    </SectionCard>
  );
}

function OrderShippingRow({ order }: { order: EditableOrder }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState<Flash>(null);
  const addr = order.shippingAddress;

  return (
    <div className="rounded-lg border border-pizarra-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-pizarra-800">{order.memorialName}</p>
          <p className="text-[11px] uppercase tracking-widest text-pizarra-500 mt-0.5">
            Plan {order.planId} · HI-{order.id.slice(0, 8).toUpperCase()}
          </p>
          {!editing && (
            <div className="mt-3 text-sm text-pizarra-600 leading-snug">
              {addr?.line1 ? (
                <>
                  <p>{addr.name}</p>
                  <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p>{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}</p>
                  <p className="uppercase text-[11px] text-pizarra-500">{addr.country}</p>
                  {addr.phone && <p className="font-mono text-[12px] mt-1">☎ {addr.phone}</p>}
                </>
              ) : (
                <p className="text-amber-700 text-[13px]">
                  ⚠ Sin dirección registrada — edítala para que podamos enviarte la placa.
                </p>
              )}
            </div>
          )}
        </div>
        {!editing && (
          <Button size="sm" variant="outline" onClick={() => { setEditing(true); setFlash(null); }}>
            Editar
          </Button>
        )}
      </div>

      {editing && (
        <form
          action={(fd) => {
            fd.append('order_id', order.id);
            start(async () => {
              const r = await updateOrderShipping(fd);
              if (r.ok) {
                setFlash({ kind: 'ok', msg: 'Dirección actualizada.' });
                setEditing(false);
              } else {
                setFlash({ kind: 'err', msg: r.error });
              }
            });
          }}
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <Field name="name"        label="Nombre completo" required defaultValue={addr?.name ?? ''} />
          <Field name="phone"       label="Teléfono" defaultValue={addr?.phone ?? ''} />
          <Field name="line1"       label="Calle y número" required defaultValue={addr?.line1 ?? ''} className="sm:col-span-2" />
          <Field name="line2"       label="Interior / colonia" defaultValue={addr?.line2 ?? ''} className="sm:col-span-2" />
          <Field name="city"        label="Ciudad" required defaultValue={addr?.city ?? ''} />
          <Field name="state"       label="Estado" defaultValue={addr?.state ?? ''} />
          <Field name="postal_code" label="Código postal" required defaultValue={addr?.postal_code ?? ''} />
          <Field name="country"     label="País (ISO, ej. MX)" required defaultValue={addr?.country ?? 'MX'} />

          <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
            <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" variant="dorado" disabled={pending}>
              {pending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando</> : 'Guardar dirección'}
            </Button>
          </div>
        </form>
      )}
      <FlashBox flash={flash} />
    </div>
  );
}

function Field({
  name, label, required, defaultValue, className,
}: { name: string; label: string; required?: boolean; defaultValue?: string; className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={name}>{label}{required && ' *'}</Label>
      <Input id={name} name={name} required={required} defaultValue={defaultValue} />
    </div>
  );
}

/* ============================================================================
 *  4. Eliminar cuenta (GDPR / LFPDPPP)
 * ========================================================================== */
export function DeleteAccountForm({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState<Flash>(null);

  return (
    <SectionCard icon={Trash2} title="Eliminar cuenta" tone="danger">
      <p className="text-sm text-pizarra-600 mb-3">
        Al eliminar tu cuenta borraremos <strong>permanentemente</strong> tus
        nichos virtuales, fotos, historial de compras y datos personales. Esta
        acción es irreversible y no se puede deshacer — es tu derecho bajo la
        LFPDPPP (México) y el GDPR.
      </p>
      {!open ? (
        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => setOpen(true)}>
          Quiero eliminar mi cuenta
        </Button>
      ) : (
        <form
          action={(fd) => start(async () => {
            const r = await deleteAccount(fd);
            if (!r.ok) setFlash({ kind: 'err', msg: r.error });
            // Si ok, la server action redirige — no llega aquí.
            else router.push('/?deleted=1');
          })}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label htmlFor="confirm_email">
              Escribe tu correo <span className="font-mono">{email}</span> para confirmar
            </Label>
            <Input id="confirm_email" name="confirm_email" type="email" required autoComplete="off" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={pending}>
              {pending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Eliminando…</>
                : <><Trash2 className="h-4 w-4 mr-2" /> Eliminar permanentemente</>}
            </Button>
          </div>
          <FlashBox flash={flash} />
        </form>
      )}
    </SectionCard>
  );
}

/* ============================================================================
 *  Layout helper
 * ========================================================================== */
function SectionCard({
  icon: Icon, title, tone, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone?: 'danger';
  children: React.ReactNode;
}) {
  const border = tone === 'danger' ? 'border-red-200' : 'border-pizarra-100';
  const iconColor = tone === 'danger' ? 'text-red-600' : 'text-dorado-600';
  return (
    <Card className={`border ${border}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <h2 className="font-serif text-xl text-pizarra-800">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
