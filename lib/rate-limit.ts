import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimitKind = 'ai' | 'checkout';

/**
 * Límites por tipo de endpoint. Si Upstash no está configurado (dev local o
 * misconfig en prod), los límites se desactivan silenciosamente — el endpoint
 * sigue funcionando sin throttling.
 */
const LIMITS: Record<LimitKind, { tokens: number; windowSec: number }> = {
  ai:       { tokens: 5,  windowSec: 60 * 60 },   // 5 generaciones IA / hora / usuario
  checkout: { tokens: 10, windowSec: 60 },        // 10 sesiones de checkout / min / usuario
};

let redis: Redis | null = null;
const cache = new Map<LimitKind, Ratelimit>();

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function getLimiter(kind: LimitKind): Ratelimit | null {
  if (cache.has(kind)) return cache.get(kind)!;
  const r = getRedis();
  if (!r) return null;
  const cfg = LIMITS[kind];
  const limiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(cfg.tokens, `${cfg.windowSec} s`),
    analytics: true,
    prefix: `rl:${kind}`,
  });
  cache.set(kind, limiter);
  return limiter;
}

export interface RateCheckResult {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Chequea el rate-limit para la combinación `kind + identifier`.
 * Si Upstash no está configurado, devuelve `ok: true` (fail-open).
 *
 * @param kind       Tipo de endpoint ('ai' | 'checkout')
 * @param identifier Identificador único (típicamente user.id)
 */
export async function checkRateLimit(
  kind: LimitKind,
  identifier: string,
): Promise<RateCheckResult> {
  const limiter = getLimiter(kind);
  if (!limiter) {
    return { ok: true, limit: 0, remaining: 0, reset: 0 };
  }
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  return { ok: success, limit, remaining, reset };
}
