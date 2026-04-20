/**
 * Pending memorial — estado de un memorial en construcción ANTES del registro.
 *
 * El flujo /empieza permite a un visitante:
 *   1. Elegir tipo (mascota / ser_querido)
 *   2. Escribir nombre + fechas + epitafio
 *   3. Ver un preview de cómo se verá su tributo
 *   4. SÓLO ENTONCES registrarse
 *
 * Los datos se guardan en localStorage hasta que el usuario confirma su
 * correo. Cuando entra a /dashboard por primera vez, un cliente detecta
 * el pending y crea el memorial automáticamente.
 *
 * Tradeoff: si el usuario abre el link de confirmación en otro dispositivo,
 * el pending se pierde. Afecta ~5% de usuarios (multi-device). Aceptable
 * para el MVP; migrar a Supabase table si el dato lo justifica.
 */

export type PendingMemorialType = 'mascota' | 'ser_querido';

export interface PendingMemorial {
  type: PendingMemorialType;
  name: string;
  birth_date: string;      // ISO YYYY-MM-DD o ''
  passing_date: string;    // ISO YYYY-MM-DD o ''
  epitaph: string;
  /** Timestamp en que se creó el pending — para expirar drafts viejos. */
  created_at: number;
}

const STORAGE_KEY = 'hi:pending_memorial';
/** Pendings expiran en 7 días — más que eso y el usuario probablemente abandonó. */
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function savePendingMemorial(data: Omit<PendingMemorial, 'created_at'>): void {
  if (!isClient()) return;
  try {
    const record: PendingMemorial = { ...data, created_at: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage lleno / bloqueado — ignorar silenciosamente */
  }
}

export function readPendingMemorial(): PendingMemorial | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingMemorial>;
    if (!parsed?.name || !parsed.type) return null;
    if (parsed.created_at && Date.now() - parsed.created_at > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Normaliza campos opcionales.
    return {
      type: parsed.type,
      name: parsed.name,
      birth_date: parsed.birth_date ?? '',
      passing_date: parsed.passing_date ?? '',
      epitaph: parsed.epitaph ?? '',
      created_at: parsed.created_at ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export function clearPendingMemorial(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function hasPendingMemorial(): boolean {
  return readPendingMemorial() !== null;
}
