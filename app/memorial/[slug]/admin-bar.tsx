'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff, Trash2, ShieldCheck, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  hideMemorial,
  unhideMemorial,
  adminDeleteMemorial,
} from './admin-actions';

interface Props {
  slug: string;
  status: 'borrador' | 'publicado' | 'privado';
  memorialName: string;
}

type ModalKind = 'hide' | 'delete' | null;

export function AdminBar({ slug, status, memorialName }: Props) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onUnhide() {
    setError(null);
    start(async () => {
      const r = await unhideMemorial(slug);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <>
      <div className="sticky top-0 z-50 bg-red-700 text-white text-sm shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="font-medium">Modo admin</span>
            <span className="text-red-100 text-[12px]">
              · estado: <strong className="uppercase">{status}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {status === 'publicado' ? (
              <Button
                size="sm"
                onClick={() => { setModal('hide'); setError(null); }}
                disabled={pending}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30"
              >
                <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Ocultar
              </Button>
            ) : status === 'privado' ? (
              <Button
                size="sm"
                onClick={onUnhide}
                disabled={pending}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30"
              >
                {pending
                  ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Publicando</>
                  : <><Eye className="h-3.5 w-3.5 mr-1.5" /> Re-publicar</>}
              </Button>
            ) : null}

            <Button
              size="sm"
              onClick={() => { setModal('delete'); setError(null); }}
              disabled={pending}
              className="bg-red-900 hover:bg-red-950 text-white border border-red-950"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Eliminar
            </Button>
          </div>
        </div>
        {error && (
          <div className="bg-red-900 text-red-50 text-xs px-4 py-1.5 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        )}
      </div>

      {modal && (
        <ReasonModal
          kind={modal}
          memorialName={memorialName}
          onClose={() => setModal(null)}
          onSubmit={(reason) => {
            setError(null);
            start(async () => {
              const r = modal === 'hide'
                ? await hideMemorial(slug, reason)
                : await adminDeleteMemorial(slug, reason);
              if (!r.ok) {
                setError(r.error);
                setModal(null);
              } else {
                setModal(null);
                // hide redirect es implícito (revalidatePath); delete hace redirect server-side
              }
            });
          }}
          pending={pending}
        />
      )}
    </>
  );
}

function ReasonModal({
  kind, memorialName, onClose, onSubmit, pending,
}: {
  kind: 'hide' | 'delete';
  memorialName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  pending: boolean;
}) {
  const [reason, setReason] = useState('');
  const isDelete = kind === 'delete';

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-pizarra-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDelete ? <Trash2 className="h-5 w-5 text-red-700" /> : <EyeOff className="h-5 w-5 text-pizarra-700" />}
            <h3 className="font-serif text-lg text-pizarra-900">
              {isDelete ? 'Eliminar nicho virtual' : 'Ocultar nicho virtual'}
            </h3>
          </div>
          <button onClick={onClose} className="text-pizarra-400 hover:text-pizarra-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-pizarra-700">
            {isDelete
              ? <>Vas a <strong>eliminar permanentemente</strong> el nicho virtual de <em className="text-red-700">{memorialName}</em>. Esto borra las fotos, las órdenes y no se puede deshacer.</>
              : <>Vas a ocultar el nicho virtual de <em className="text-pizarra-900">{memorialName}</em>. El dueño aún podrá verlo en su dashboard; el público verá 404.</>}
          </p>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-pizarra-500" htmlFor="reason">
              Razón (mínimo 5 caracteres)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ej. contenido ofensivo, reportado por tercero, spam..."
              rows={3}
              autoFocus
              className="w-full rounded-md border border-pizarra-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-dorado-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
            <Button
              onClick={() => onSubmit(reason.trim())}
              disabled={pending || reason.trim().length < 5}
              className={isDelete ? 'bg-red-700 hover:bg-red-800 text-white' : 'bg-pizarra-800 hover:bg-pizarra-900 text-white'}
            >
              {pending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Procesando</>
                : isDelete ? 'Eliminar permanentemente' : 'Ocultar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
