# Logging and Log Aggregation

> **Project:** CarGA — Argentina's first digital load board
> **Last updated:** 2026-03-26

---

## Overview

CarGA uses a distributed logging approach across multiple services. Since the application runs on serverless infrastructure (Vercel + Supabase), there is no single centralized log server. Instead, logs are captured at each layer and aggregated through purpose-built tools.

---

## Logging Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Log Sources                               │
├──────────────┬──────────────┬───────────────┬───────────────────┤
│  Vercel       │  Sentry       │  Supabase      │  PostHog         │
│  Functions    │  Error        │  Database       │  Product         │
│  stdout/err   │  Tracking     │  Logs           │  Analytics       │
├──────────────┼──────────────┼───────────────┼───────────────────┤
│ API routes    │ Unhandled     │ Query logs     │ User events      │
│ SSR logs      │ exceptions    │ Auth logs      │ Feature usage    │
│ Middleware    │ Breadcrumbs   │ Realtime logs  │ Funnel tracking  │
│ Build logs    │ Performance   │ Migration logs │ Session replays  │
└──────────────┴──────────────┴───────────────┴───────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │     admin_logs         │
                        │   (PostgreSQL table)   │
                        │   Admin audit trail    │
                        └────────────────────────┘
```

---

## Log Sources

### 1. Vercel Serverless Function Logs

**What:** All `console.log`, `console.warn`, `console.error` output from Next.js API routes, server-side rendering, and middleware.

**Where:** Vercel Dashboard > Project > Logs (or `vercel logs` CLI)

**Retention:**
- Hobby plan: 1 hour
- Pro plan: 3 days
- Enterprise: 30 days

**Access:**

```bash
# Stream logs in real time
vercel logs --follow

# View recent logs
vercel logs

# Filter by status code
vercel logs --filter status=500
```

**What is logged:**
- API request/response metadata (method, path, status code, duration)
- Business logic events (`console.log`)
- Warnings for degraded functionality (`console.warn`)
- Errors and exceptions (`console.error`)

**Limitations:**
- Logs are ephemeral and not searchable beyond the retention window
- No structured log format by default (plain text stdout)
- Cold start times are not logged separately

---

### 2. Sentry (Error Tracking)

**What:** Unhandled exceptions, captured errors, performance transactions, and breadcrumbs (user actions leading to an error).

**Where:** [sentry.io](https://sentry.io) > CarGA project

**Retention:** 90 days

**Configuration:**

```ts
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,       // 10% of transactions for performance
  replaysSessionSampleRate: 0,  // No session replays in production
  replaysOnErrorSampleRate: 1,  // 100% replay on error
});
```

**What is captured:**
- Unhandled JavaScript exceptions (client + server)
- React Error Boundary catches
- API route errors (via `Sentry.captureException`)
- Performance data (page load times, API response times)
- Breadcrumbs: user clicks, navigation, console output, network requests

**Alerting:**
- Email alert on first occurrence of a new error
- Email alert when error frequency exceeds threshold (configurable in Sentry)
- Weekly error digest report

**Best practices:**
- Always add context when capturing errors:
  ```ts
  Sentry.captureException(error, {
    tags: { feature: 'load-board', action: 'create-load' },
    extra: { userId, loadData },
  });
  ```
- Never log PII (CUIT, phone numbers, emails) in Sentry context

---

### 3. Supabase Database Logs

**What:** PostgreSQL query logs, authentication events, realtime connection logs, and migration execution logs.

**Where:** Supabase Dashboard > Logs (or Supabase Log Explorer)

**Retention:** 7 days (Supabase-managed, varies by plan)

**Log categories:**

| Category | What it shows |
|----------|--------------|
| **API Logs** | All REST API and Realtime requests to Supabase |
| **Auth Logs** | Sign-ups, logins, password resets, token refreshes |
| **Database Logs** | PostgreSQL query logs, slow queries, errors |
| **Realtime Logs** | WebSocket connections, subscription events |
| **Storage Logs** | File upload/download events |

**Querying logs (Supabase Log Explorer):**

```sql
-- Find slow queries (> 1 second)
SELECT timestamp, event_message
FROM postgres_logs
WHERE event_message LIKE '%duration%'
  AND cast(regexp_replace(event_message, '.*duration: (\d+\.\d+).*', '\1') as float) > 1000
ORDER BY timestamp DESC
LIMIT 50;
```

---

### 4. Webhook Logs

**What:** Incoming webhook events from WhatsApp Business API and MercadoPago.

**Where:** Application logs (Vercel function logs) via `console.warn`.

**Current implementation:**

```ts
// WhatsApp webhook handler
console.warn('[WhatsApp Webhook]', {
  type: 'message_status',
  messageId: data.entry[0].changes[0].value.statuses[0].id,
  status: data.entry[0].changes[0].value.statuses[0].status,
  timestamp: new Date().toISOString(),
});

// MercadoPago webhook handler
console.warn('[MercadoPago Webhook]', {
  type: data.type,
  action: data.action,
  dataId: data.data.id,
  timestamp: new Date().toISOString(),
});
```

**Why `console.warn`:** Webhook events are logged at `warn` level to distinguish them from regular application logs and ensure they appear in production log output (which may filter `console.log` at lower log levels).

---

### 5. Admin Action Logs

**What:** All administrative actions performed through the admin dashboard.

**Where:** `admin_logs` table in PostgreSQL

**Retention:** 5 years (see `docs/DATA-RETENTION.md`)

**Schema:**

```sql
admin_logs (
  id UUID PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,        -- e.g., 'verify_user', 'delete_load', 'update_subscription'
  entity TEXT NOT NULL,        -- e.g., 'user', 'load', 'subscription'
  entity_id TEXT NOT NULL,     -- UUID of the affected entity
  details JSONB,               -- Additional context (old values, new values, reason)
  created_at TIMESTAMPTZ
)
```

**Access:** Only users with `role = 'admin'` can read admin logs (enforced via RLS).

**Querying:**

```sql
-- Recent admin actions
SELECT al.*, u.email as admin_email
FROM admin_logs al
JOIN users u ON u.id = al.admin_id
ORDER BY al.created_at DESC
LIMIT 50;

-- Actions on a specific entity
SELECT * FROM admin_logs
WHERE entity = 'user' AND entity_id = 'target-user-uuid'
ORDER BY created_at DESC;
```

---

### 6. PostHog (Product Analytics)

**What:** Product events, feature usage, user journeys, funnel analysis.

**Where:** [posthog.com](https://posthog.com) > CarGA project

**Retention:** 2 years

**Events tracked:**

| Event | When | Properties |
|-------|------|------------|
| `page_view` | Every page navigation | `path`, `referrer` |
| `load_created` | Shipper creates a load | `cargo_type`, `truck_type`, `province` |
| `load_viewed` | User views load details | `load_id` |
| `application_submitted` | Carrier applies to load | `load_id` |
| `application_accepted` | Shipper accepts application | `load_id`, `transportista_id` |
| `subscription_started` | User subscribes to a plan | `plan`, `amount` |
| `search_performed` | User searches/filters loads | `filters` |
| `cuit_verified` | User completes CUIT verification | `role` |

**Implementation:**

```ts
import posthog from 'posthog-js';

posthog.capture('load_created', {
  cargo_type: 'cereales',
  truck_type: 'semirremolque',
  origin_province: 'Buenos Aires',
  destination_province: 'Cordoba',
});
```

---

## Log Levels

| Level | When to use | Environments |
|-------|-------------|-------------|
| `ERROR` | Unrecoverable errors, failed operations, data integrity issues | All environments |
| `WARN` | Degraded functionality, webhook events, rate limit hits, fallback behavior | Production + Staging |
| `INFO` | Key business events (load created, user registered, payment processed) | Staging + Local |
| `DEBUG` | Detailed diagnostic information, variable dumps, query results | Local only |

### Current implementation

```ts
// Production — only ERROR and WARN
console.error('[LoadBoard] Failed to fetch loads:', error);
console.warn('[RateLimit] User exceeded request limit:', { userId, limit });

// Staging — add INFO
console.log('[Auth] User registered:', { userId, role });

// Local — add DEBUG
console.debug('[Query] Load board query:', { filters, results: loads.length });
```

---

## Structured Logging (Recommended — TODO)

The current logging implementation uses plain `console.*` calls. For production at scale, the recommended approach is to adopt **Pino** for structured JSON logging.

### Target implementation

```ts
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Structured log output
logger.info({ userId, loadId, action: 'load_created' }, 'Shipper created a new load');
logger.error({ err, userId, endpoint: '/api/loads' }, 'Failed to create load');
```

### Benefits of Pino

- **JSON output** — machine-parseable, compatible with log aggregation tools
- **Performance** — fastest Node.js logger (async writes, minimal overhead)
- **Structured data** — consistent format with timestamps, log levels, and context
- **Child loggers** — create scoped loggers per request with automatic context
- **Redaction** — automatically redact sensitive fields (passwords, tokens)

### Migration plan

1. Install `pino` and `pino-pretty` (dev)
2. Create a `lib/logger.ts` module with pre-configured logger
3. Create helper functions: `logError()`, `logPerformance()`, `logWebhook()`
4. Replace `console.*` calls across the codebase
5. Configure Pino redaction paths for sensitive data

---

## Alerting

### Active Alerts

| Source | Trigger | Channel | Action |
|--------|---------|---------|--------|
| Sentry | New unhandled exception | Email | Investigate and fix |
| Sentry | Error rate spike (> 10 errors/min) | Email | Check deployment, consider rollback |
| Vercel | Deployment failure | Email | Check build logs, fix and redeploy |
| Vercel | Function execution error rate > 5% | Email (Pro plan) | Investigate failing API routes |
| Supabase | Database connection limit reached | Email | Check for connection leaks |

### Recommended Alerts (TODO)

| Source | Trigger | Channel |
|--------|---------|---------|
| UptimeRobot | `carga.com.ar` returns non-200 for > 2 min | Email + WhatsApp |
| Custom | No new loads posted in 24 hours | Email (could indicate auth or DB issue) |
| Custom | Webhook delivery failure rate > 10% | Email |
| PostHog | Daily active users drop > 50% | Email |

---

## Log Analysis Workflows

### Debugging a user-reported issue

1. Get the user's ID or email
2. Check Sentry for recent errors associated with the user (search by user context)
3. Check Supabase Auth logs for authentication issues
4. Check Supabase API logs for failed requests
5. Check admin_logs for any admin actions affecting the user
6. If needed, check Vercel function logs (limited retention)

### Investigating a performance issue

1. Check Sentry Performance > Transactions for slow endpoints
2. Check Supabase Logs > Database for slow queries
3. Check Vercel Analytics for response time trends
4. Check PostHog for user session recordings showing slow interactions

### Auditing admin actions

```sql
-- All actions by a specific admin in the last 7 days
SELECT action, entity, entity_id, details, created_at
FROM admin_logs
WHERE admin_id = 'admin-uuid'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- All user verification actions
SELECT al.*, u.email as admin_email
FROM admin_logs al
JOIN users u ON u.id = al.admin_id
WHERE al.action = 'verify_user'
ORDER BY al.created_at DESC;
```

---

## Security and Compliance

### What is never logged

- Passwords or password hashes
- Full CUIT numbers (log last 4 digits only if needed)
- API keys, tokens, or secrets
- Full phone numbers
- Session tokens or JWTs

### Log access control

| Log Source | Who can access |
|------------|---------------|
| Vercel function logs | Team members with Vercel access |
| Sentry | Team members with Sentry access |
| Supabase logs | Team members with Supabase access |
| admin_logs table | Users with `role = 'admin'` (RLS enforced) |
| PostHog | Team members with PostHog access |

### Retention compliance

All log retention periods are documented in `docs/DATA-RETENTION.md`. Key points:
- Admin logs: 5 years (audit compliance)
- Error logs (Sentry): 90 days
- Analytics (PostHog): 2 years
- Function logs (Vercel): 1 hour to 30 days depending on plan
