// Sentry error monitoring scaffold
// Configure with NEXT_PUBLIC_SENTRY_DSN environment variable

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry] No DSN configured — error monitoring disabled');
    }
    return;
  }

  // TODO: Initialize @sentry/nextjs when DSN is configured
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.1 });
}

export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) {
    console.error('[Error]', error.message, context);
    return;
  }

  // TODO: Sentry.captureException(error, { extra: context });
  console.error('[Sentry]', error.message, context);
}
