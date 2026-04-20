'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, X, AlertCircle, ArrowLeft, Check, RotateCcw, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BIOGRAPHY_TONES, type BiographyTone } from '@/lib/biography-tones';

interface Props {
  memorialId: string;
  /** Nombre para personalizar el texto de ayuda. */
  subjectName: string;
  /** Tipo del memorial (mascota | ser_querido). */
  type: 'mascota' | 'ser_querido';
  /**
   * Callback cuando el usuario acepta el borrador. El editor puede optar por
   * reemplazar el contenido existente, concatenarlo, o preguntar.
   */
  onAccept: (text: string) => void;
  /** Si la biografía actual ya tiene contenido, avisamos antes de reemplazar. */
  hasExistingBiography?: boolean;
}

/**
 * Asistente de biografía — "El Hilo de la Vida".
 *
 * Abre un modal donde el dueño del memorial escribe viñetas/recuerdos
 * sueltos y un modelo los organiza en un texto cálido de 180-350 palabras.
 * La IA NUNCA publica directamente — el usuario revisa y edita antes de
 * aceptar. Si ya había biografía previa, pedimos confirmación para
 * reemplazar.
 */
export function BiographyAssistant({
  memorialId, subjectName, type, onAccept, hasExistingBiography,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-dorado-700 hover:text-dorado-800 underline decoration-dotted underline-offset-4 transition-colors"
      >
        <Wand2 className="h-3.5 w-3.5" />
        Ayúdame a escribir
      </button>

      <AnimatePresence>
        {open && (
          <AssistantModal
            memorialId={memorialId}
            subjectName={subjectName}
            type={type}
            onClose={() => setOpen(false)}
            onAccept={(text) => {
              onAccept(text);
              setOpen(false);
            }}
            hasExistingBiography={hasExistingBiography}
          />
        )}
      </AnimatePresence>
    </>
  );
}

type Stage = 'compose' | 'review';

function AssistantModal({
  memorialId, subjectName, type, onClose, onAccept, hasExistingBiography,
}: {
  memorialId: string;
  subjectName: string;
  type: 'mascota' | 'ser_querido';
  onClose: () => void;
  onAccept: (text: string) => void;
  hasExistingBiography?: boolean;
}) {
  const [notes, setNotes] = useState('');
  const [tone, setTone] = useState<BiographyTone>('calido');
  const [stage, setStage] = useState<Stage>('compose');
  const [draft, setDraft] = useState('');
  const [generating, startGenerating] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const kindLabel = type === 'mascota' ? 'mascota' : 'ser querido';

  function onGenerate() {
    setError(null);
    startGenerating(async () => {
      try {
        const res = await fetch('/api/ai/biography', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memorialId, notes: notes.trim(), tone }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 429) {
            setError('Llegaste al límite de generaciones por hora. Vuelve a intentar más tarde.');
          } else {
            setError(data?.error ?? 'No pudimos generar el borrador. Intenta de nuevo.');
          }
          return;
        }
        setDraft(String(data.text ?? '').trim());
        setStage('review');
      } catch {
        setError('Sin conexión. Revisa tu internet e intenta de nuevo.');
      }
    });
  }

  function onUseThis() {
    if (hasExistingBiography && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }
    onAccept(draft);
  }

  return (
    <motion.div
      key="bio-overlay"
      className="fixed inset-0 z-[60] bg-pizarra-900/75 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !generating) onClose();
      }}
    >
      <motion.div
        key="bio-modal"
        initial={{ y: 18, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl bg-marfil rounded-2xl shadow-solemn overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          disabled={generating}
          className="absolute top-4 right-4 h-9 w-9 rounded-full hover:bg-pizarra-100 text-pizarra-500 flex items-center justify-center disabled:opacity-40 z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="px-7 pt-7 pb-4 border-b border-pizarra-100">
          <div className="flex items-center gap-2 text-dorado-600 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="uppercase tracking-[0.3em] text-[11px]">Asistente de biografía</span>
          </div>
          <h2 className="font-serif text-2xl text-pizarra-800">
            {stage === 'compose'
              ? <>El Hilo de la Vida de <span className="italic">{subjectName || kindLabel}</span></>
              : 'Revisa este borrador con calma'}
          </h2>
          <p className="text-sm text-pizarra-500 mt-1">
            {stage === 'compose'
              ? 'Tú me das los recuerdos en viñetas sueltas. Yo los organizo en un texto sereno que siempre podrás editar.'
              : 'Este texto fue escrito con ayuda de IA a partir de tus recuerdos. Léelo con calma: si algo no te suena, regenera o edítalo después en el editor.'}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {stage === 'compose' && (
            <ComposeStage
              notes={notes}
              setNotes={setNotes}
              tone={tone}
              setTone={setTone}
              type={type}
              disabled={generating}
            />
          )}

          {stage === 'review' && (
            <ReviewStage draft={draft} />
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {confirmReplace && (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-3 text-sm">
              <p className="font-medium mb-1">Ya tenías texto en la biografía.</p>
              <p className="text-amber-800">
                Si continúas, este borrador <strong>reemplazará</strong> tu texto actual. Puedes editarlo después.
                ¿Quieres reemplazarlo?
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmReplace(false)}
                >
                  No, volver
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAccept(draft)}
                  className="bg-amber-700 hover:bg-amber-800 text-white"
                >
                  Sí, reemplazar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-pizarra-100 bg-marfil-100 flex items-center justify-between gap-3">
          {stage === 'compose' ? (
            <>
              <p className="text-[11px] text-pizarra-400">
                5 generaciones por hora
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onClose} disabled={generating}>
                  Cancelar
                </Button>
                <Button
                  variant="dorado"
                  onClick={onGenerate}
                  disabled={generating || notes.trim().length < 20}
                >
                  {generating
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Escribiendo…</>
                    : <><Sparkles className="h-4 w-4 mr-2" /> Generar borrador</>}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => { setStage('compose'); setError(null); setConfirmReplace(false); }}
                disabled={generating}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Editar recuerdos
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onGenerate}
                  disabled={generating}
                >
                  {generating
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generando…</>
                    : <><RotateCcw className="h-4 w-4 mr-2" /> Regenerar</>}
                </Button>
                <Button
                  variant="dorado"
                  onClick={onUseThis}
                  disabled={generating || !draft}
                >
                  <Check className="h-4 w-4 mr-2" /> Usar este texto
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================================
 *  COMPOSE STAGE — textarea de viñetas + selector de tono
 * ========================================================================== */

function ComposeStage({
  notes, setNotes, tone, setTone, type, disabled,
}: {
  notes: string;
  setNotes: (v: string) => void;
  tone: BiographyTone;
  setTone: (t: BiographyTone) => void;
  type: 'mascota' | 'ser_querido';
  disabled: boolean;
}) {
  const placeholder = type === 'mascota'
    ? `Escribe lo que recuerdes, sin orden, sin presión. Por ejemplo:

- Adoptada en 2015, tenía 6 meses.
- Le gustaba dormir en el sillón aunque no la dejábamos.
- Cuando sonaba la puerta se escondía detrás de la cortina.
- Su comida favorita era el atún.
- Los domingos íbamos al parque juntos.`
    : `Escribe lo que recuerdes, sin orden, sin presión. Por ejemplo:

- Nació en Monterrey, creció en CDMX.
- Trabajó 30 años como maestro de primaria.
- Le encantaba escuchar a Javier Solís los domingos.
- Nunca se perdió una tamborazo.
- Enseñó a andar en bici a todos sus nietos.`;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio-notes">Recuerdos (viñetas sueltas)</Label>
          <span className={`text-[11px] ${notes.length > 4000 ? 'text-red-600' : 'text-pizarra-400'}`}>
            {notes.length} / 4000
          </span>
        </div>
        <Textarea
          id="bio-notes"
          rows={12}
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 4000))}
          placeholder={placeholder}
          disabled={disabled}
          className="font-serif text-base leading-relaxed"
        />
        <p className="text-[11px] text-pizarra-500 leading-relaxed">
          Mientras más específicos los recuerdos, más auténtico el texto. La IA <strong>no inventará nada</strong> que no esté aquí.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tono</Label>
        <div className="grid grid-cols-3 gap-2">
          {BIOGRAPHY_TONES.map((t) => {
            const active = t.id === tone;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                disabled={disabled}
                className={`text-left rounded-lg border px-3 py-2.5 transition-all ${
                  active
                    ? 'border-dorado-500 bg-dorado-50 shadow-sm'
                    : 'border-pizarra-200 bg-marfil hover:border-dorado-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <p className="font-serif text-sm text-pizarra-800">{t.label}</p>
                <p className="text-[11px] text-pizarra-500 mt-0.5 leading-tight">{t.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg bg-pizarra-50 border border-pizarra-100 p-4 text-sm text-pizarra-600 leading-relaxed">
        <p className="font-medium text-pizarra-700 mb-1">Cómo trabaja este asistente</p>
        <ul className="list-disc list-inside space-y-1 text-[13px] text-pizarra-500">
          <li>Usa <strong>solo los recuerdos que escribas</strong>, nunca inventa detalles.</li>
          <li>No menciona la causa del fallecimiento.</li>
          <li>No usa frases religiosas ni clichés del duelo.</li>
          <li>Siempre podrás editar el texto final antes de publicar.</li>
        </ul>
      </div>
    </div>
  );
}

/* ============================================================================
 *  REVIEW STAGE — preview del borrador con disclaimer
 * ========================================================================== */

function ReviewStage({ draft }: { draft: string }) {
  return (
    <div className="space-y-4">
      <article className="bg-white border border-pizarra-100 rounded-xl p-6 shadow-sm">
        <p className="font-serif text-base md:text-[17px] text-pizarra-700 leading-[1.75] whitespace-pre-line">
          {draft}
        </p>
      </article>

      <div className="rounded-lg bg-dorado-50 border border-dorado-200 p-4 text-sm text-pizarra-700 leading-relaxed">
        <p className="font-medium text-pizarra-800 mb-1">Antes de continuar</p>
        <p className="text-pizarra-600 text-[13px]">
          Este borrador se escribió con ayuda de IA a partir de tus recuerdos. Léelo con calma —
          si alguna palabra o detalle no te suena a quien estás recordando, puedes regenerarlo o
          ajustarlo tú mismo en el editor después de aceptarlo.
        </p>
      </div>
    </div>
  );
}
