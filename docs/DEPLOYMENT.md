# Deployment Guide

> **Project:** CarGA — Argentina's first digital load board
> **Stack:** Next.js 14 + Supabase + Vercel
> **Last updated:** 2026-03-26

---

## Environments

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| **Local** | `http://localhost:3000` | Any | Development and testing |
| **Staging** | Vercel Preview URL (auto-generated) | PR branches | QA, stakeholder review |
| **Production** | `https://carga.com.ar` | `main` | Live platform |

---

## Prerequisites

- Node.js 18+ and pnpm installed
- Supabase CLI installed (`npm install -g supabase`)
- Vercel CLI installed (`npm install -g vercel`)
- GitHub repository access
- Supabase project created
- Vercel account linked to GitHub

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/carga-landing.git
cd carga-landing
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see Environment Variables section below).

### 3. Set up Supabase

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# Verify migration status
supabase migration list
```

### 4. Start development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

---

## Vercel Setup

### 1. Connect GitHub repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `carga-landing` repository from GitHub
3. Select the **Next.js** framework preset (auto-detected)
4. Set the root directory to `/` (default)
5. Click **Deploy**

### 2. Configure project settings

In the Vercel project dashboard:

- **Framework Preset:** Next.js
- **Build Command:** `pnpm build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `pnpm install`
- **Node.js Version:** 18.x
- **Function Region:** `gru1` (Sao Paulo) — closest to Argentine users

### 3. Set environment variables

Go to **Settings > Environment Variables** and add all variables listed in the Environment Variables section below. Set them for the appropriate environments (Production, Preview, Development).

### 4. Enable auto-deployments

- **Production:** Auto-deploys on push to `main`
- **Preview:** Auto-deploys on every PR (generates unique preview URL)
- **Skipped:** Pushes to branches without open PRs

---

## Supabase Setup

### 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project in the South America (Sao Paulo) region
3. Note the project URL and keys

### 2. Run migrations

```bash
supabase link --project-ref your-project-ref
supabase db push
```

This applies all 11 migration files in order (see `docs/DATABASE.md` for details).

### 3. Configure auth providers

In the Supabase dashboard under **Authentication > Providers**:

- **Email/Password:** Enabled (default)
- **Google OAuth:**
  1. Create OAuth 2.0 credentials in Google Cloud Console
  2. Set authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
  3. Enter Client ID and Client Secret in Supabase dashboard

### 4. Enable Realtime

Realtime is configured via migration `20250326000001_production_indexes_and_functions.sql`, which adds `loads`, `notifications`, and `load_applications` to the `supabase_realtime` publication. No manual setup required.

### 5. Configure webhooks (optional)

If using WhatsApp Business API webhooks or MercadoPago IPN:
- Set the webhook URL to `https://carga.com.ar/api/webhooks/whatsapp` (WhatsApp)
- Set the webhook URL to `https://carga.com.ar/api/webhooks/mercadopago` (MercadoPago)

---

## Environment Variables

### Required for all environments

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps JavaScript API key | Google Cloud Console > APIs & Services > Credentials |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `http://localhost:3000` (local), `https://carga.com.ar` (prod) |

### Authentication

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth 2.0 client ID | Google Cloud Console > APIs & Services > Credentials |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth 2.0 client secret | Google Cloud Console > APIs & Services > Credentials |

### Notifications

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Business API access token | Meta Business Suite > WhatsApp > API Setup |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | Meta Business Suite > WhatsApp > API Setup |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business Account ID | Meta Business Suite > WhatsApp > API Setup |
| `WHATSAPP_VERIFY_TOKEN` | Custom token for webhook verification | Self-generated string |
| `FIREBASE_SERVER_KEY` | Firebase Cloud Messaging server key | Firebase Console > Project Settings > Cloud Messaging |
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Firebase client config (JSON string) | Firebase Console > Project Settings > General |

### Payments

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago access token | MercadoPago Developers > Credentials |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | MercadoPago public key | MercadoPago Developers > Credentials |

### Email

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `RESEND_API_KEY` | Resend API key for transactional email | Resend Dashboard > API Keys |

### Monitoring

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | Sentry > Project Settings > Client Keys |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps | Sentry > Settings > Auth Tokens |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | PostHog > Project Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog instance URL | Default: `https://us.i.posthog.com` |

### Admin

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `SUPER_ADMIN_EMAIL` | Super admin email for setup script | Your admin email |
| `SUPER_ADMIN_PASSWORD` | Super admin password for setup script | Your secure password |
| `SUPER_ADMIN_NAME` | Super admin first name | Your name |
| `SUPER_ADMIN_LASTNAME` | Super admin last name | Your last name |
| `SUPER_ADMIN_EMPRESA` | Super admin company name | Your company name |
| `NEXT_PUBLIC_SUPER_ADMIN_EMAILS` | Comma-separated admin emails | Admin email addresses |

### Phase 2 (not yet required)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `ANTHROPIC_API_KEY` | Claude API key for AI pricing | Anthropic Console |

---

## Pre-Deployment Checklist

Before deploying to production, verify all items:

- [ ] All tests pass: `pnpm test` (121 unit tests)
- [ ] E2E tests pass: `pnpm test:e2e` (125 Playwright tests)
- [ ] TypeScript compiles: `pnpm typecheck`
- [ ] Linter passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Full CI pipeline passes: `make ci`
- [ ] All environment variables set in Vercel dashboard
- [ ] Database migrations applied: `supabase migration list`
- [ ] No secrets exposed in code: check `.env.example` only has placeholders
- [ ] CHANGELOG.md updated with release notes
- [ ] Sentry release configured (source maps uploaded)

---

## Deployment

### Automatic (recommended)

Push to `main` triggers an automatic production deployment on Vercel:

```bash
git checkout main
git merge develop
git push origin main
# Vercel auto-deploys within ~60 seconds
```

### Manual

```bash
# Deploy to production manually
vercel --prod

# Deploy a preview (staging)
vercel
```

### GitHub Actions CI/CD

The CI pipeline runs on every push and PR:

1. **Lint** — ESLint
2. **Typecheck** — TypeScript strict mode
3. **Test** — Vitest unit tests
4. **Build** — Next.js production build

If all checks pass and the push is to `main`, Vercel deploys automatically.

---

## Post-Deployment

After every production deployment:

### 1. Verify webhooks

- **WhatsApp:** Send a test message to the WhatsApp Business number and verify delivery
- **MercadoPago:** Create a test subscription and verify the IPN webhook fires

### 2. Smoke test

Run through these critical paths manually:

- [ ] Landing page loads correctly
- [ ] Registration flow works (transportista + cargador)
- [ ] Login with email/password works
- [ ] Login with Google OAuth works
- [ ] Load board displays published loads
- [ ] Load creation form submits successfully
- [ ] Map view renders with markers
- [ ] Subscription page loads with pricing

### 3. Monitor errors

- Open Sentry dashboard and watch for new errors for 30 minutes
- Check Vercel function logs for any 500 errors
- Verify PostHog is receiving events

### 4. Verify performance

- Run Lighthouse on the landing page (target: 90+ on all metrics)
- Check Core Web Vitals in Vercel Analytics

---

## Rollback

### Instant rollback via Vercel

1. Go to the Vercel project dashboard
2. Navigate to **Deployments**
3. Find the previous working deployment
4. Click the three-dot menu and select **Promote to Production**

This takes effect within seconds. No rebuild required.

### Database rollback

If a migration caused issues:

```bash
# Connect to the database
supabase db remote connect

# Manually revert the problematic migration
# (Supabase does not have automatic rollback — write a reverse migration)
```

**Important:** Always test migrations on staging (Supabase branch or separate project) before applying to production.

---

## Domain Setup

### DNS Configuration for `carga.com.ar`

1. In Vercel project settings, go to **Settings > Domains**
2. Add `carga.com.ar` and `www.carga.com.ar`
3. Configure DNS records at your registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` (Vercel) |
| CNAME | www | `cname.vercel-dns.com` |

4. Vercel will automatically provision and renew SSL certificates via Let's Encrypt

### Supabase custom domain (optional)

For a branded API URL (e.g., `api.carga.com.ar`):
1. In Supabase dashboard, go to **Settings > Custom Domains**
2. Add `api.carga.com.ar`
3. Add the required CNAME record at your registrar
4. Update `NEXT_PUBLIC_SUPABASE_URL` in Vercel environment variables

---

## Monitoring and Alerts

| Service | What it monitors | Alert channel |
|---------|-----------------|---------------|
| Sentry | Unhandled exceptions, error spikes | Email + Slack |
| Vercel | Deployment failures, function errors | Email |
| PostHog | Product metrics, funnel drops | Dashboard |
| Supabase | Database health, connection limits | Email |
| UptimeRobot (recommended) | Endpoint availability | Email + WhatsApp |
