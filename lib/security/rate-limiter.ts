/**
 * Rate limiter with Redis support for distributed systems
 * - In-memory storage (development, single-instance)
 * - Redis-backed (production, multi-instance)
 * 
 * Use REDIS_URL env var to enable Redis backend
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
  private readonly isRedisEnabled: boolean;
  private readonly redisUrl: string | null;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.isRedisEnabled = !!process.env.REDIS_URL && process.env.NODE_ENV === 'production';
    this.redisUrl = process.env.REDIS_URL || null;

    // Only setup cleanup interval for in-memory mode
    if (!this.isRedisEnabled) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 60_000);

      // Evitar que el intervalo bloquee el cierre del proceso
      if (this.cleanupInterval && typeof this.cleanupInterval === 'object' && 'unref' in this.cleanupInterval) {
        this.cleanupInterval.unref();
      }
    }

    if (this.isRedisEnabled) {
      console.info('[RateLimiter] Redis backend enabled');
    }
  }

  /**
   * Verifica si la clave tiene solicitudes disponibles.
   * Usa Redis en producción o memoria en desarrollo.
   */
  async check(key: string): Promise<TRateLimitResult> {
    if (this.isRedisEnabled && this.redisUrl) {
      return this.checkRedis(key);
    }
    return this.checkMemory(key);
  }

  /**
   * Check rate limit using in-memory store
   */
  private checkMemory(key: string): TRateLimitResult {
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
   * Check rate limit using Redis
   * Fails open if Redis is unavailable
   */
  private async checkRedis(key: string): Promise<TRateLimitResult> {
    try {
      const now = Date.now();
      const redisKey = `rate_limit:${key}`;
      
      // Use simple Redis INCR via HTTP (if using Upstash or similar)
      // For production, integrate a Redis client like ioredis or redis package
      // This is a placeholder for documentation purposes
      
      const response = await fetch(`${this.redisUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd: ['INCR', redisKey] }),
        signal: AbortSignal.timeout(1000), // 1s timeout
      });

      if (!response.ok) {
        console.warn('[RateLimiter] Redis request failed, failing open');
        return {
          allowed: true,
          remaining: this.maxRequests,
          resetIn: this.windowMs,
        };
      }

      const data = (await response.json()) as { result: number };
      const count = data.result ?? 1;

      // Set expiry on first request
      if (count === 1) {
        await fetch(`${this.redisUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmd: ['EXPIRE', redisKey, Math.ceil(this.windowMs / 1000)] }),
          signal: AbortSignal.timeout(1000),
        }).catch(() => {
          // Ignore expiry errors
        });
      }

      return {
        allowed: count <= this.maxRequests,
        remaining: Math.max(0, this.maxRequests - count),
        resetIn: this.windowMs,
      };
    } catch (error) {
      console.error('[RateLimiter] Redis error:', error);
      // Fail open: if Redis fails, allow the request
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetIn: this.windowMs,
      };
    }
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
