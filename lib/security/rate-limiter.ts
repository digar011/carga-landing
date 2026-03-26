/**
 * Rate limiter en memoria para protección de endpoints.
 * En producción, reemplazar por Redis-backed para multi-instancia.
 */

interface TRateLimitEntry {
  count: number;
  resetAt: number;
}

interface TRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly store: Map<string, TRateLimitEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Limpiar entradas expiradas cada minuto
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60_000);

    // Evitar que el intervalo bloquee el cierre del proceso
    if (this.cleanupInterval && typeof this.cleanupInterval === 'object' && 'unref' in this.cleanupInterval) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Verifica si la clave tiene solicitudes disponibles.
   * Incrementa el contador si la solicitud es permitida.
   */
  check(key: string): TRateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    // Sin entrada previa o ventana expirada: crear nueva ventana
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetIn: this.windowMs,
      };
    }

    // Dentro de la ventana activa
    const resetIn = entry.resetAt - now;

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn,
      };
    }

    entry.count += 1;

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetIn,
    };
  }

  /**
   * Elimina entradas expiradas del store.
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.store.entries())) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destruye el limiter y limpia el intervalo.
   * Usar en tests o al cerrar la aplicación.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

/** 60 solicitudes por minuto por IP — endpoints generales de API */
export const apiRateLimiter = new RateLimiter(60, 60_000);

/** 5 intentos cada 15 minutos por IP — login y registro */
export const authRateLimiter = new RateLimiter(5, 15 * 60_000);

/** 100 solicitudes por minuto — webhooks entrantes */
export const webhookRateLimiter = new RateLimiter(100, 60_000);
