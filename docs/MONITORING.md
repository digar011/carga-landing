# Monitoring and Observability

> CarGA uses a multi-layered monitoring strategy: Sentry for errors, PostHog for analytics, Vercel for performance, and Supabase for database health.

## Architecture Overview

```
+------------------+     +------------------+     +------------------+
|   Sentry         |     |   PostHog        |     |   Vercel         |
|   Error tracking |     |   Product        |     |   Analytics      |
|   Server+Client  |     |   analytics      |     |   Core Web       |
|                  |     |   Feature flags  |     |   Vitals         |
+------------------+     +------------------+     +------------------+
        |                         |                        |
        +------------+------------+------------------------+
                     |
              +------v------+
              |  Next.js    |
              |  App        |
              +------+------+
                     |
              +------v------+
              |  Supabase   |
              |  Dashboard  |
              |  DB metrics |
              +-------------+
```

## Sentry — Error Monitoring

**Purpose:** Capture and alert on unhandled exceptions in both server-side and client-side code.

**Current status:** Scaffold in `lib/monitoring/sentry.ts`. Install `@sentry/nextjs` to enable full functionality.

### Setup

1. Create a Sentry project at [sentry.io](https://sentry.io)
2. Set the environment variable:

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/1234567
```

3. Install the SDK:

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

4. The scaffold at `lib/monitoring/sentry.ts` provides two functions:
   - `initSentry()` — Call during app initialization
   - `captureError(error, context)` — Call in catch blocks with contextual metadata

### What It Captures

| Category | Examples |
|----------|---------|
| Unhandled exceptions | Runtime errors, promise rejections |
| Breadcrumbs | User clicks, navigation, API calls leading up to an error |
| Performance | Page load times, API response times (when `tracesSampleRate` is set) |
| Context | User ID, role, current route, browser/device info |

### Recommended Alert Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| Error rate spike | > 10 errors/minute | Slack notification + PagerDuty |
| New unhandled exception | First occurrence of an error type | Slack notification |
| Performance degradation | P95 response time > 3s | Email notification |

### Integration with CarGA

```typescript
import { captureError } from '@/lib/monitoring/sentry';

try {
  await supabase.from('loads').insert(loadData);
} catch (error) {
  captureError(error as Error, {
    action: 'load_create',
    userId: user.id,
    loadData,
  });
  throw error;
}
```

## PostHog — Product Analytics

**Purpose:** Track user behavior, measure feature adoption, and enable gradual feature rollout via feature flags.

**Current status:** Scaffold in `lib/monitoring/posthog.ts` with standard event names defined.

### Setup

1. Create a PostHog project at [posthog.com](https://posthog.com)
2. Set environment variables:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

3. Install the SDK:

```bash
pnpm add posthog-js
```

### Tracked Events

The following standard events are defined in `lib/monitoring/posthog.ts`:

| Event Name | When Fired |
|------------|------------|
| `signup_completed` | User completes registration |
| `login` | User logs in |
| `load_posted` | Cargador publishes a new load |
| `load_viewed` | User opens load detail page |
| `load_applied` | Transportista applies to a load |
| `application_accepted` | Cargador accepts an application |
| `application_rejected` | Cargador rejects an application |
| `map_opened` | User opens the interactive load map |
| `search_executed` | User performs a search on the load board |
| `filter_applied` | User applies a filter on the load board |
| `plan_upgraded` | User upgrades their subscription plan |
| `whatsapp_notification_sent` | WhatsApp notification dispatched |
| `rating_submitted` | User submits a rating |

### Usage

```typescript
import { trackEvent, EVENTS } from '@/lib/monitoring/posthog';

// Track a load being posted
trackEvent(EVENTS.LOAD_POSTED, {
  cargadorId: user.id,
  origen: 'Buenos Aires',
  destino: 'Córdoba',
  tipoCarga: 'granel',
});
```

### Feature Flags

PostHog supports feature flags for gradual rollout. Once the SDK is initialized:

```typescript
import posthog from 'posthog-js';

// Check if a feature is enabled for the current user
if (posthog.isFeatureEnabled('new-load-map-v2')) {
  // Show new map
} else {
  // Show existing map
}
```

Flag keys should use `kebab-case` (e.g., `new-load-map-v2`, `whatsapp-notifications`).

## Vercel Analytics — Core Web Vitals

**Purpose:** Monitor real-user performance metrics that directly impact SEO and user experience.

### Target Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Time to render the largest visible element |
| FID (First Input Delay) | < 100ms | Time from first interaction to browser response |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability — how much the page shifts during load |

### Setup

Vercel Analytics is enabled automatically on Vercel-hosted projects. To add the client component:

```bash
pnpm add @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Dashboard

Access Vercel Analytics at:
- `https://vercel.com/<team>/<project>/analytics`

Review after every deployment and before every production launch.

## Supabase Dashboard — Database Metrics

**Purpose:** Monitor database health, API usage, and auth activity.

### What to Monitor

| Metric | Where | Why |
|--------|-------|-----|
| API requests/min | API section | Detect traffic spikes or abuse |
| Database size | Database section | Plan capacity upgrades |
| Slow queries | Query Performance | Identify missing indexes |
| Auth signups/logins | Auth section | Track user growth |
| Realtime connections | Realtime section | Monitor WebSocket usage for live load board |
| Edge function invocations | Functions section | Track serverless function usage |

### Access

- **Local:** `http://localhost:54323` (run `make db-studio`)
- **Production:** Supabase Dashboard at `https://supabase.com/dashboard`

## Uptime Monitoring

**Recommendation:** Use [BetterUptime](https://betterstack.com/better-uptime), [UptimeRobot](https://uptimerobot.com), or similar.

### Endpoints to Monitor

| Endpoint | Check Interval | Alert After |
|----------|---------------|-------------|
| `https://carga.com.ar` | 1 min | 2 failures |
| `https://carga.com.ar/api/health` | 1 min | 2 failures |
| Supabase API URL | 5 min | 3 failures |

### Status Page

Consider setting up a public status page (e.g., `status.carga.com.ar`) to communicate downtime transparently to users.

## Health Check Endpoint

**Status:** TODO — implement at `/api/health`.

### Planned Implementation

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const start = Date.now();

  try {
    // Check database connectivity
    const supabase = createClient();
    const { error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      return NextResponse.json(
        { status: 'degraded', timestamp: new Date().toISOString(), db: 'error' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - start}ms`,
      db: 'connected',
    });
  } catch {
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
```

### Expected Response

```json
{
  "status": "ok",
  "timestamp": "2025-03-26T14:30:00.000Z",
  "responseTime": "45ms",
  "db": "connected"
}
```

## Monitoring Checklist

Before every production deployment, verify:

- [ ] Sentry DSN configured and receiving test events
- [ ] PostHog key configured and tracking page views
- [ ] Vercel Analytics enabled on the project
- [ ] Uptime monitor configured for production URL
- [ ] Health check endpoint returning 200
- [ ] Supabase Dashboard accessible with proper permissions
- [ ] Alert channels (Slack/email) configured and tested
