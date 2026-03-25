// PostHog analytics scaffold
// Configure with NEXT_PUBLIC_POSTHOG_KEY environment variable

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export function initPostHog(): void {
  if (!POSTHOG_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PostHog] No API key configured — analytics disabled');
    }
    return;
  }

  // TODO: Initialize posthog-js when key is configured
  // import posthog from 'posthog-js';
  // posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST });
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!POSTHOG_KEY) return;

  // TODO: posthog.capture(event, properties);
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.info('[PostHog]', event, properties);
  }
}

// Standard event names for CarGA
export const EVENTS = {
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN: 'login',
  LOAD_POSTED: 'load_posted',
  LOAD_VIEWED: 'load_viewed',
  LOAD_APPLIED: 'load_applied',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  MAP_OPENED: 'map_opened',
  SEARCH_EXECUTED: 'search_executed',
  FILTER_APPLIED: 'filter_applied',
  PLAN_UPGRADED: 'plan_upgraded',
  WHATSAPP_NOTIFICATION_SENT: 'whatsapp_notification_sent',
  RATING_SUBMITTED: 'rating_submitted',
} as const;
