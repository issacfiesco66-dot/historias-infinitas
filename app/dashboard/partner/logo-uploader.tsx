'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { savePartnerLogo } from './actions';

const MAX_BYTES = 2 * 1024 * 1024;

export function LogoUploader({
  partnerId, initialLogoUrl,
}: { partnerId: string; initialLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, startSaving] = useTransition();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMsg(null);

    if (file.size > MAX_BYTES) {
      setMsg({ type: 'err', text: 'El archivo supera los 2 MB.' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'err', text: 'Debe ser una imagen (PNG, JPG, SVG).' });
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
      const path = `partner-logos/${partnerId}-${Date.now()}.${ext}`;

      // Reutilizamos el bucket "memorials" por ahora — es público y ya existe.
      // En producción conviene crear un bucket "partner-assets" dedicado.
      const { error: upErr } = await supabase.storage
        .from('memorials')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('memorials').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      startSaving(async () => {
        const res = await savePartnerLogo(partnerId, publicUrl);
        if (res.ok) {
          setLogoUrl(publicUrl);
          setMsg({ type: 'ok', text: 'Logotipo actualizado' });
        } else {
          setMsg({ type: 'err', text: res.error ?? 'No se pudo guardar' });
        }
      });
    } catch (err: any) {
      setMsg({ type: 'err', text: err.message ?? 'Error al subir' });
    } finally {
      setUploading(false);
    }
  }

  function onRemove() {
    setMsg(null);
    startSaving(async () => {
      const res = await savePartnerLogo(partnerId, null);
      if (res.ok) {
        setLogoUrl(null);
        setMsg({ type: 'ok', text: 'Logotipo eliminado' });
      } else {
        setMsg({ type: 'err', text: res.error ?? 'No se pudo eliminar' });
      }
    });
  }

  const busy = uploading || saving;

  return (
    <div className="space-y-3">
      {logoUrl ? (
        <div className="flex items-center gap-4 bg-marfil-100 border border-pizarra-100 rounded-xl p-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden bg-marfil border border-pizarra-100 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Logo del socio"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-pizarra-700 truncate">Logotipo cargado</p>
            <p className="text-xs text-pizarra-400 font-mono break-all">{logoUrl.split('/').pop()}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={busy}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1.5" /> Quitar
          </Button>
        </div>
      ) : null}

      <label
        className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
          busy ? 'border-pizarra-200 opacity-60 cursor-wait' : 'border-dorado-300 bg-dorado-50/40 hover:bg-dorado-50'
        }`}
      >
        {busy
          ? <Loader2 className="h-5 w-5 animate-spin text-dorado-600" />
          : <Upload className="h-5 w-5 text-dorado-600" />}
        <span className="text-sm text-pizarra-600">
          {busy ? 'Guardando…' : (logoUrl ? 'Reemplazar logotipo' : 'Subir logotipo')}
        </span>
        <input
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={onFile}
          disabled={busy}
        />
      </label>

      {msg && (
        <div
          className={`flex items-start gap-2 text-sm rounded-md p-3 ${
            msg.type === 'ok'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {msg.type === 'ok'
            ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}
    </div>
  );
}
