/**
 * HaveIBeenPwned (HIBP) range API — k-anonymity password check.
 *
 * Cómo funciona:
 *  1. Hash SHA-1 de la contraseña (no se envía al servidor).
 *  2. Se envían solo los primeros 5 hex chars del hash al endpoint público
 *     https://api.pwnedpasswords.com/range/<prefix>
 *  3. HIBP devuelve TODOS los hashes que empiezan con esos 5 chars (y el
 *     número de brechas en que aparecen). Comparamos localmente el resto.
 *
 * HIBP nunca recibe el password ni el hash completo — es k-anonymity.
 * Usamos `Add-Padding: true` para ocultar el tamaño de respuesta.
 */

/** Convierte un ArrayBuffer a hex uppercase. */
function bufToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out.toUpperCase();
}

/** SHA-1 via Web Crypto — disponible en Node 18+, edge runtime y browsers. */
async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return bufToHex(hash);
}

export interface PwnedResult {
  /** true si el password aparece en al menos una brecha conocida. */
  pwned: boolean;
  /** Número de brechas en que apareció (0 si no está filtrado). */
  count: number;
  /** true si no pudimos consultar HIBP (timeout / red). Failure-open: no bloqueamos. */
  unavailable?: boolean;
}

/**
 * Consulta HIBP con k-anonymity. Devuelve si el password aparece en
 * alguna brecha. En caso de fallo de red, devuelve `{ pwned: false,
 * unavailable: true }` (failure-open — no frenamos al usuario por un
 * servicio externo caído).
 */
export async function isPasswordPwned(password: string): Promise<PwnedResult> {
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 3500);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true', 'User-Agent': 'Historias-Infinitas' },
      signal: ac.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return { pwned: false, count: 0, unavailable: true };

    const body = await res.text();
    for (const rawLine of body.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;
      const [s, c] = line.split(':');
      if (s === suffix) {
        const count = Number(c ?? 0);
        // HIBP a veces devuelve entradas padding con count=0. Solo filtramos reales.
        if (count > 0) return { pwned: true, count };
      }
    }
    return { pwned: false, count: 0 };
  } catch {
    return { pwned: false, count: 0, unavailable: true };
  }
}
