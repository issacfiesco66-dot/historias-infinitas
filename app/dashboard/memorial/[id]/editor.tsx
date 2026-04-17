'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Upload, Sparkles, Loader2, CheckCircle2, Lock, Globe,
  Wand2, Film, Image as ImageIcon, Save, QrCode, Eye, AlertCircle,
  Palette, CreditCard, Trash2, ArrowRight, Share2,
} from 'lucide-react';
import { MemorialPreview } from './memorial-preview';
import { ShareButtons } from '@/components/share-buttons';
import { PORTRAIT_STYLES, type PortraitStyleId } from '@/lib/portrait-styles';
import type { Memorial, MemorialMedia, MemorialStatus } from '@/types/database';

interface Props {
  memorial: Memorial;
  initialMedia: MemorialMedia[];
}

/* ============================================================================
 *  Catálogo de estilos = el del backend (fuente única).
 *  La UI sólo muestra metadata; el prompt real lo compone /api/ai/portrait.
 * ========================================================================== */
const AI_STYLES = PORTRAIT_STYLES;
type AiStyleId = PortraitStyleId;

/* ============================================================================
 *  HOOK: auto-save con debounce de 5 s
 * ========================================================================== */
function useDebouncedAutoSave<T>(value: T, delay: number, onSave: (v: T) => Promise<void>, enabled = true) {
  const firstRender = useRef(true);
  const lastSaved = useRef<string>(JSON.stringify(value));

  useEffect(() => {
    if (!enabled) return;
    if (firstRender.current) { firstRender.current = false; return; }
    const serialized = JSON.stringify(value);
    if (serialized === lastSaved.current) return;

    const t = setTimeout(async () => {
      await onSave(value);
      lastSaved.current = serialized;
    }, delay);

    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value), delay, enabled]);
}

/* ============================================================================
 *  EDITOR
 * ========================================================================== */

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface FormState {
  name: string;
  birth_date: string;
  passing_date: string;
  epitaph: string;
  biography: string;
}

const EPITAPH_MAX = 150;

export function MemorialEditor({ memorial, initialMedia }: Props) {
  const supabase = createClient();

  // ---------------- estado local ----------------
  const [form, setForm] = useState<FormState>({
    name: memorial.name ?? '',
    birth_date: memorial.birth_date ?? '',
    passing_date: memorial.passing_date ?? '',
    epitaph: memorial.epitaph ?? '',
    biography: memorial.biography ?? '',
  });
  const [media, setMedia] = useState<MemorialMedia[]>(initialMedia);
  const [coverUrl, setCoverUrl] = useState(memorial.cover_photo_url);
  const [portraitUrl, setPortraitUrl] = useState(memorial.portrait_ai_url);
  const [arVideoUrl, setArVideoUrl] = useState(memorial.ar_video_url);
  const [status, setStatus] = useState<MemorialStatus>(memorial.status);
  const [style, setStyle] = useState<AiStyleId>('oleo');

  const [uploading, setUploading] = useState(false);
  const [arUploading, setArUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [publishing, setPublishing] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'recuerdos' | 'retrato' | 'ar' | 'preview'>('info');

  const locked = status === 'publicado';

  // ---------------- toast auto-hide ----------------
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ---------------- auto-save: campos de texto ----------------
  const persistForm = useCallback(async (payload: FormState) => {
    setSaveState('saving');
    const { error } = await supabase
      .from('memorials')
      .update({
        name: payload.name,
        birth_date: payload.birth_date || null,
        passing_date: payload.passing_date || null,
        epitaph: payload.epitaph || null,
        biography: payload.biography || null,
      })
      .eq('id', memorial.id);
    if (error) {
      setSaveState('error');
      setToast(`Error al guardar: ${error.message}`);
    } else {
      setSaveState('saved');
      setLastSavedAt(new Date());
    }
  }, [memorial.id, supabase]);

  useDebouncedAutoSave(form, 5000, persistForm, !locked);

  // Auto-save de la URL de AR también con 5s
  useDebouncedAutoSave(
    arVideoUrl,
    5000,
    useCallback(async (value: string | null) => {
      setSaveState('saving');
      const { error } = await supabase
        .from('memorials')
        .update({ ar_video_url: value || null })
        .eq('id', memorial.id);
      setSaveState(error ? 'error' : 'saved');
      if (!error) setLastSavedAt(new Date());
    }, [memorial.id, supabase]),
    !locked,
  );

  // ---------------- UPLOAD genérico ----------------
  async function uploadToStorage(file: File): Promise<string | null> {
    const path = `${memorial.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('memorials').upload(path, file);
    if (error) { setToast(error.message); return null; }
    return supabase.storage.from('memorials').getPublicUrl(path).data.publicUrl;
  }

  // ---------------- UPLOAD foto / video al álbum ----------------
  async function onMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (locked) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToStorage(file);
    if (!url) { setUploading(false); return; }

    const kind = file.type.startsWith('video') ? 'video' : 'foto';
    const { data: row, error } = await supabase
      .from('memorial_media')
      .insert({ memorial_id: memorial.id, kind, url, sort_order: media.length })
      .select('*')
      .single();

    if (error) { setToast(error.message); setUploading(false); return; }

    setMedia((prev) => [...prev, row as MemorialMedia]);

    if (!coverUrl && kind === 'foto') {
      await supabase.from('memorials').update({ cover_photo_url: url }).eq('id', memorial.id);
      setCoverUrl(url);
    }
    setUploading(false);
    setToast('Recuerdo añadido');
    e.target.value = '';
  }

  // ---------------- ELIMINAR foto / video ----------------
  async function onDeleteMedia(item: MemorialMedia) {
    if (locked) return;
    if (!confirm('¿Eliminar este recuerdo? Esta acción no se puede deshacer.')) return;

    const { error } = await supabase
      .from('memorial_media')
      .delete()
      .eq('id', item.id);

    if (error) { setToast(error.message); return; }

    // Best-effort: eliminar también el archivo en Storage
    try {
      const parsed = new URL(item.url);
      const marker = '/object/public/memorials/';
      const idx = parsed.pathname.indexOf(marker);
      if (idx !== -1) {
        const path = parsed.pathname.slice(idx + marker.length);
        if (path) await supabase.storage.from('memorials').remove([path]);
      }
    } catch { /* noop */ }

    setMedia((prev) => prev.filter((x) => x.id !== item.id));

    // Si era la foto de portada, limpiarla en la fila de memorials
    if (coverUrl === item.url) {
      await supabase.from('memorials').update({ cover_photo_url: null }).eq('id', memorial.id);
      setCoverUrl(null);
    }

    setToast('Recuerdo eliminado');
  }

  // ---------------- UPLOAD video AR (máx 15 MB) ----------------
  async function onArVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (locked) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video')) { setToast('Debe ser un archivo de video'); return; }
    if (file.size > 15 * 1024 * 1024) {
      setToast('El video supera los 15 MB. Comprímelo o acórtalo.');
      return;
    }
    setArUploading(true);
    const url = await uploadToStorage(file);
    if (url) {
      setArVideoUrl(url); // auto-save se encargará de persistir
      setToast('Video de AR listo');
    }
    setArUploading(false);
    e.target.value = '';
  }

  // ---------------- GENERAR retrato con IA ----------------
  async function onGeneratePortrait(sourceUrl: string) {
    if (locked) return;
    setGenerating(true);
    setGenerationSource(sourceUrl);
    setToast(null);
    try {
      const res = await fetch('/api/ai/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialId: memorial.id,
          imageUrl: sourceUrl,
          style,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar');
      setPortraitUrl(data.output_url);
      setToast('Retrato IA generado');
    } catch (err: any) {
      setToast(err.message);
    } finally {
      setGenerating(false);
      setGenerationSource(null);
    }
  }

  // ---------------- VALIDACIÓN para ir a pago ----------------
  function validateForCheckout(): string | null {
    if (!form.name.trim()) return 'Añade al menos el nombre.';
    if (media.length === 0 && !coverUrl) return 'Sube al menos una fotografía.';
    if (form.epitaph.length > EPITAPH_MAX) return `El epitafio supera los ${EPITAPH_MAX} caracteres.`;
    return null;
  }

  async function onContinueToCheckout() {
    const err = validateForCheckout();
    if (err) { setPublishError(err); return; }
    setPublishError(null);

    setPublishing(async () => {
      await persistForm(form);
      // El memorial se publica SOLO tras el webhook de Stripe. Aquí solo validamos
      // y navegamos al checkout.
      window.location.href = `/dashboard/memorial/${memorial.id}/checkout`;
    });
  }

  // ---------------- data para preview ----------------
  const previewData = useMemo(() => ({
    type: memorial.type,
    name: form.name,
    birth_date: form.birth_date || null,
    passing_date: form.passing_date || null,
    epitaph: form.epitaph || null,
    biography: form.biography || null,
    cover_photo_url: coverUrl,
    portrait_ai_url: portraitUrl,
    media,
  }), [form, coverUrl, portraitUrl, media, memorial.type]);

  /* ============================ RENDER ============================ */

  return (
    <div className="space-y-6">
      {/* ========== BARRA SUPERIOR: estado + guardar + CTA ========== */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-marfil/80 backdrop-blur border border-pizarra-100 rounded-xl px-5 py-3 shadow-solemn">
        <div className="flex items-center gap-4">
          <SaveIndicator state={saveState} at={lastSavedAt} />
          <span className="hidden md:inline h-5 w-px bg-pizarra-100" />
          <span className="text-xs uppercase tracking-widest text-pizarra-500 flex items-center gap-1">
            {locked ? <Globe className="h-3.5 w-3.5 text-green-600" /> : <Lock className="h-3.5 w-3.5" />}
            {locked ? 'Activo y público' : 'Borrador privado · se activa al pagar'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {locked ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/memorial/${memorial.id}/qr`}>
                  <QrCode className="h-4 w-4 mr-2" /> Ver QR
                </Link>
              </Button>
              <Button asChild variant="dorado" size="sm">
                <Link href={`/memorial/${memorial.slug}`} target="_blank">
                  <Share2 className="h-4 w-4 mr-2" /> Compartir
                </Link>
              </Button>
            </>
          ) : (
            <Button onClick={onContinueToCheckout} variant="dorado" disabled={publishing}>
              {publishing
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cargando</>
                : <><CreditCard className="h-4 w-4 mr-2" /> Continuar a pago <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          )}
        </div>
      </div>

      {publishError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{publishError}</span>
        </div>
      )}

      {/* ========== COMPARTIR — solo cuando el memorial está activo/pagado ========== */}
      {locked && (
        <ShareButtons
          url={typeof window !== 'undefined'
            ? `${window.location.origin}/memorial/${memorial.slug}`
            : `/memorial/${memorial.slug}`}
          name={form.name}
          epitaph={form.epitaph}
        />
      )}

      {/* ========== FORM + PREVIEW ========== */}
      {/* En el tab "preview" usamos una sola columna a ancho completo; en el
          resto mostramos el form a la izquierda y la preview sticky a la
          derecha. */}
      <div
        className={
          activeTab === 'preview'
            ? 'grid grid-cols-1 gap-8 items-start'
            : 'grid lg:grid-cols-[minmax(0,1fr),minmax(0,1.1fr)] gap-8 items-start'
        }
      >
        {/* ======================================== */}
        {/* COLUMNA IZQUIERDA — Formulario           */}
        {/* ======================================== */}
        <div className={locked ? 'pointer-events-none opacity-75' : ''}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="info" className="text-xs md:text-sm px-2.5 md:px-4">
                <span className="md:hidden">1. Info</span>
                <span className="hidden md:inline">1 · Información</span>
              </TabsTrigger>
              <TabsTrigger value="recuerdos" className="text-xs md:text-sm px-2.5 md:px-4">
                <span className="md:hidden">2. Fotos</span>
                <span className="hidden md:inline">2 · Recuerdos</span>
              </TabsTrigger>
              <TabsTrigger value="retrato" className="text-xs md:text-sm px-2.5 md:px-4">
                <span className="md:hidden">3. Retrato</span>
                <span className="hidden md:inline">3 · Retrato IA</span>
              </TabsTrigger>
              <TabsTrigger value="ar" className="text-xs md:text-sm px-2.5 md:px-4">
                <span className="md:hidden">4. AR</span>
                <span className="hidden md:inline">4 · Portal AR</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs md:text-sm px-2.5 md:px-4">
                <span className="md:hidden">5. Previa</span>
                <span className="hidden md:inline">5 · Vista previa</span>
              </TabsTrigger>
            </TabsList>

            {/* ---------------- TAB: INFORMACIÓN ---------------- */}
            <TabsContent value="info">
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={memorial.type === 'mascota' ? 'p. ej. Luna' : 'p. ej. Don Ignacio'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Nacimiento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={form.birth_date ?? ''}
                        onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passing_date">Trascendencia</Label>
                      <Input
                        id="passing_date"
                        type="date"
                        value={form.passing_date ?? ''}
                        onChange={(e) => setForm({ ...form, passing_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <Label htmlFor="epitaph">Epitafio</Label>
                      <span
                        className={`text-[11px] ${
                          form.epitaph.length > EPITAPH_MAX ? 'text-red-600' : 'text-pizarra-400'
                        }`}
                      >
                        {form.epitaph.length} / {EPITAPH_MAX}
                      </span>
                    </div>
                    <Input
                      id="epitaph"
                      value={form.epitaph}
                      onChange={(e) => setForm({ ...form, epitaph: e.target.value.slice(0, EPITAPH_MAX + 10) })}
                      placeholder="Una frase que capture su esencia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biography">Biografía</Label>
                    <p className="text-[11px] text-pizarra-400 -mt-1">
                      Usa saltos de línea para dar ritmo. La primera letra se convertirá en capital decorativa.
                    </p>
                    <Textarea
                      id="biography"
                      rows={8}
                      value={form.biography}
                      onChange={(e) => setForm({ ...form, biography: e.target.value })}
                      placeholder="Su historia, sus momentos preferidos, su esencia..."
                      className="font-serif text-base leading-relaxed"
                    />
                  </div>

                  <StepNav
                    onNext={() => setActiveTab('recuerdos')}
                    nextLabel="Siguiente: Recuerdos"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------- TAB: RETRATO IA ---------------- */}
            <TabsContent value="retrato">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Selector de estilo */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-dorado-600">
                      <Palette className="h-4 w-4" />
                      <span className="uppercase tracking-widest text-xs">Estilo artístico</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {AI_STYLES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStyle(s.id)}
                          className={`relative rounded-xl overflow-hidden text-left transition-all ${
                            style === s.id
                              ? 'ring-2 ring-dorado-500 shadow-dorado'
                              : 'ring-1 ring-pizarra-100 hover:ring-dorado-300'
                          }`}
                        >
                          <div className={`h-16 bg-gradient-to-br ${s.gradient}`} />
                          <div className="p-3 bg-marfil">
                            <p className="font-serif text-sm text-pizarra-800">{s.label}</p>
                            <p className="text-[10px] text-pizarra-500 mt-0.5">{s.hint}</p>
                          </div>
                          {style === s.id && (
                            <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-dorado-500 bg-marfil rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fuente + resultado */}
                  <div>
                    <p className="text-sm text-pizarra-500 mb-3">
                      Selecciona una fotografía subida para generar el retrato con el estilo elegido.
                    </p>
                    {media.filter((m) => m.kind === 'foto').length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-pizarra-200 p-8 text-center">
                        <ImageIcon className="h-6 w-6 text-pizarra-300 mx-auto mb-2" />
                        <p className="text-sm text-pizarra-400">
                          Primero sube una fotografía en la pestaña "Recuerdos".
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {media.filter((m) => m.kind === 'foto').map((m) => {
                          const isActive = generating && generationSource === m.url;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              disabled={generating}
                              onClick={() => onGeneratePortrait(m.url)}
                              className="group relative aspect-square rounded-lg overflow-hidden bg-pizarra-100 ring-1 ring-pizarra-100 hover:ring-dorado-400 transition"
                            >
                              <img src={m.url} alt="" className="w-full h-full object-cover" />
                              <div className={`absolute inset-0 flex items-center justify-center text-marfil text-xs gap-1 transition ${
                                isActive ? 'bg-pizarra-900/80 opacity-100' : 'bg-pizarra-900/70 opacity-0 group-hover:opacity-100'
                              }`}>
                                {isActive ? <Loader2 className="h-4 w-4 animate-spin text-dorado-300" /> : <Wand2 className="h-4 w-4" />}
                                <span>{isActive ? 'Creando' : 'Generar'}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Resultado */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-pizarra-400 mb-3">Resultado</p>
                    {generating ? (
                      <div className="aspect-[3/4] max-w-xs rounded-xl overflow-hidden shadow-dorado bg-pizarra-800 relative">
                        <Skeleton className="absolute inset-0 !bg-pizarra-700" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-marfil gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-dorado-400" />
                          <p className="text-sm">Pintando el retrato...</p>
                          <p className="text-[11px] text-marfil/60">Esto toma unos 20–40 s</p>
                        </div>
                      </div>
                    ) : portraitUrl ? (
                      <div className="relative aspect-[3/4] max-w-xs rounded-xl overflow-hidden shadow-dorado">
                        <img src={portraitUrl} alt="Retrato IA" className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-pizarra-900/80 text-marfil text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">
                          Retrato IA · {AI_STYLES.find((s) => s.id === style)?.label}
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] max-w-xs rounded-xl border-2 border-dashed border-pizarra-200 flex items-center justify-center text-sm text-pizarra-400 text-center px-6">
                        El retrato aparecerá aquí
                      </div>
                    )}
                  </div>

                  <StepNav
                    onPrev={() => setActiveTab('recuerdos')}
                    onNext={() => setActiveTab('ar')}
                    prevLabel="Recuerdos"
                    nextLabel="Siguiente: Portal AR"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------- TAB: RECUERDOS ---------------- */}
            <TabsContent value="recuerdos">
              <Card>
                <CardContent className="p-6 space-y-5">
                  <label className="flex items-center justify-center gap-3 border-2 border-dashed border-dorado-300 bg-dorado-50/40 rounded-xl p-10 cursor-pointer hover:bg-dorado-50 transition">
                    <Upload className="h-5 w-5 text-dorado-600" />
                    <span className="text-sm text-pizarra-600">
                      {uploading ? 'Subiendo...' : 'Arrastra una foto o video aquí — o haz clic'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={onMediaUpload}
                      disabled={uploading || locked}
                    />
                  </label>

                  {media.length === 0 ? (
                    <p className="text-sm text-pizarra-400 text-center">
                      Aún no hay recuerdos. Cada imagen es una semilla de memoria.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {media.map((m) => (
                        <div
                          key={m.id}
                          className="group relative aspect-square rounded-lg overflow-hidden bg-pizarra-100 ring-1 ring-pizarra-100"
                        >
                          {m.kind === 'foto'
                            ? <img src={m.url} alt="" className="w-full h-full object-cover" />
                            : <video src={m.url} className="w-full h-full object-cover" muted />}

                          {coverUrl === m.url && (
                            <span className="absolute top-1.5 left-1.5 bg-dorado-500 text-pizarra-900 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full font-medium">
                              Portada
                            </span>
                          )}

                          {!locked && (
                            <button
                              type="button"
                              onClick={() => onDeleteMedia(m)}
                              aria-label="Eliminar recuerdo"
                              className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-pizarra-900/80 text-marfil opacity-0 group-hover:opacity-100 hover:bg-red-600 flex items-center justify-center transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <StepNav
                    onPrev={() => setActiveTab('info')}
                    onNext={() => setActiveTab('retrato')}
                    prevLabel="Información"
                    nextLabel="Siguiente: Retrato IA"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------- TAB: PORTAL AR ---------------- */}
            <TabsContent value="ar">
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-dorado-600">
                      <Film className="h-4 w-4" />
                      <span className="uppercase tracking-widest text-xs">Video del Portal AR</span>
                    </div>
                    <p className="text-sm text-pizarra-500">
                      Sube un video corto (máximo <strong>15 MB</strong>) que aparecerá flotando al escanear el QR.
                    </p>
                  </div>

                  <label className="flex items-center justify-center gap-3 border-2 border-dashed border-pizarra-200 rounded-xl p-8 cursor-pointer hover:bg-pizarra-50 transition">
                    <Upload className="h-5 w-5 text-pizarra-600" />
                    <span className="text-sm text-pizarra-600">
                      {arUploading ? 'Subiendo...' : 'Arrastra el video o haz clic'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={onArVideoUpload}
                      disabled={arUploading || locked}
                    />
                  </label>

                  {/* Alternativa URL manual */}
                  <div className="space-y-2">
                    <Label htmlFor="ar_video">O pega una URL</Label>
                    <Input
                      id="ar_video"
                      value={arVideoUrl ?? ''}
                      onChange={(e) => setArVideoUrl(e.target.value)}
                      placeholder="https://.../recuerdo.mp4"
                    />
                  </div>

                  {arVideoUrl && (
                    <div className="rounded-xl overflow-hidden bg-pizarra-900">
                      <video src={arVideoUrl} controls className="w-full aspect-video object-cover" />
                    </div>
                  )}

                  <StepNav
                    onPrev={() => setActiveTab('retrato')}
                    onNext={() => setActiveTab('preview')}
                    prevLabel="Retrato IA"
                    nextLabel="Siguiente: Vista previa"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------- TAB: VISTA PREVIA + PAGO ---------------- */}
            <TabsContent value="preview">
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start gap-3 bg-dorado-50 border border-dorado-200 rounded-xl p-4">
                    <Eye className="h-5 w-5 text-dorado-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-pizarra-700">
                      <p className="font-medium text-pizarra-800">Así se verá tu memorial.</p>
                      <p className="text-pizarra-600 mt-1">
                        La vista previa es privada. Para que tu memorial sea público,
                        con su URL única, QR y botones de compartir,{' '}
                        <strong>necesitas completar el pago</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-pizarra-100">
                    <MemorialPreview data={previewData} />
                  </div>

                  {/* Checklist para pagar */}
                  <div className="bg-marfil-100 rounded-xl p-5 border border-pizarra-100">
                    <p className="uppercase tracking-widest text-[11px] text-pizarra-500 mb-3">
                      Antes de pagar, revisa:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <CheckRow done={Boolean(form.name.trim())} label="Nombre añadido" />
                      <CheckRow done={Boolean(coverUrl || media.length)} label="Al menos una fotografía" />
                      <CheckRow done={Boolean(form.epitaph.trim())} label="Epitafio (opcional pero recomendado)" optional />
                      <CheckRow done={Boolean(form.biography.trim())} label="Biografía (opcional pero recomendado)" optional />
                    </ul>
                  </div>

                  <StepNav
                    onPrev={() => setActiveTab('ar')}
                    prevLabel="Portal AR"
                    customNext={
                      <Button onClick={onContinueToCheckout} variant="dorado" disabled={publishing}>
                        {publishing
                          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cargando</>
                          : <><CreditCard className="h-4 w-4 mr-2" /> Continuar a pago <ArrowRight className="h-4 w-4 ml-2" /></>}
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ======================================== */}
        {/* COLUMNA DERECHA — Preview en vivo        */}
        {/* (oculta cuando el tab activo YA es "preview")*/}
        {/* ======================================== */}
        <div className={`${activeTab === 'preview' ? 'hidden' : 'hidden lg:block lg:sticky lg:top-24'} space-y-3`}>
          <div className="flex items-center justify-between px-1">
            <p className="uppercase tracking-widest text-[11px] text-dorado-600 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Vista previa {locked ? 'en vivo' : 'privada'}
            </p>
            {locked && (
              <Link
                href={`/memorial/${memorial.slug}`}
                target="_blank"
                className="text-[11px] text-pizarra-500 hover:text-pizarra-800"
              >
                Abrir en nueva pestaña →
              </Link>
            )}
          </div>
          <MemorialPreview data={previewData} />
          {!locked && (
            <p className="text-[11px] text-pizarra-400 px-1 text-center">
              El memorial se activa en su URL pública tras el pago.
            </p>
          )}
        </div>
      </div>

      {/* ========== TOAST ========== */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-pizarra-800 text-marfil text-sm px-5 py-3 rounded-full shadow-solemn animate-fade-up z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 *  INDICADOR DE AUTO-SAVE
 * ========================================================================== */
function SaveIndicator({ state, at }: { state: SaveState; at: Date | null }) {
  const rel = at ? relativeTime(at) : null;
  return (
    <div className="flex items-center gap-2 text-xs text-pizarra-500">
      {state === 'saving' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-dorado-500" />
          <span>Guardando…</span>
        </>
      )}
      {state === 'saved' && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          <span>Guardado {rel && `· ${rel}`}</span>
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-red-600" />
          <span>Error al guardar</span>
        </>
      )}
      {state === 'idle' && (
        <>
          <Save className="h-3.5 w-3.5 text-pizarra-400" />
          <span>Auto-guardado activo</span>
        </>
      )}
    </div>
  );
}

function relativeTime(date: Date) {
  const sec = Math.round((Date.now() - date.getTime()) / 1000);
  if (sec < 10) return 'ahora';
  if (sec < 60) return `hace ${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `hace ${min} min`;
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

/* ============================================================================
 *  Navegación entre pasos del wizard
 * ========================================================================== */
function StepNav({
  onPrev, onNext, prevLabel, nextLabel, customNext,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  customNext?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-pizarra-100">
      {onPrev ? (
        <Button type="button" variant="ghost" size="sm" onClick={onPrev}>
          ← {prevLabel}
        </Button>
      ) : <span />}
      {customNext
        ? customNext
        : onNext && (
          <Button type="button" variant="outline" size="sm" onClick={onNext}>
            {nextLabel} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
    </div>
  );
}

function CheckRow({ done, label, optional }: { done: boolean; label: string; optional?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-pizarra-700">
      <CheckCircle2
        className={`h-4 w-4 mt-0.5 shrink-0 ${done ? 'text-green-600' : 'text-pizarra-300'}`}
      />
      <span className={done ? '' : 'text-pizarra-500'}>
        {label}
        {optional && <span className="text-pizarra-400 text-[11px]"> · opcional</span>}
      </span>
    </li>
  );
}
