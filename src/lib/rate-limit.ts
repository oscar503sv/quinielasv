import "server-only";

// Limitador de tasa simple, ventana fija en memoria. Sirve como guard básico
// contra fuerza bruta / abuso en rutas sensibles (login, mutaciones admin).
//
// CAVEAT: el contador vive en memoria del proceso. En serverless multi-instancia
// el límite es POR INSTANCIA, no global. Para una quiniela entre amigos alcanza;
// si se necesitara un límite estricto y distribuido haría falta un store
// compartido (p. ej. Upstash/Redis).

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  /** Segundos hasta que se libera el cupo (para el header Retry-After). */
  retryAfter: number;
}

/**
 * Cuenta un golpe contra `key`. Devuelve `ok: false` si se superó `limit`
 * dentro de la ventana de `windowMs`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** IP del cliente a partir de las cabeceras de proxy (best-effort). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Respuesta 429 estándar con Retry-After. */
export function tooMany(retryAfter: number): Response {
  return Response.json(
    { error: "Demasiadas solicitudes. Probá de nuevo en un momento." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
