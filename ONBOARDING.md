# Onboarding — CarGA

> Goal: Get you from zero to running the project locally and making your first contribution in under 2 hours.

---

## Welcome to CarGA

CarGA is Argentina's first digital load board — a two-sided marketplace connecting truck operators (transportistas) with freight shippers (cargadores) in real time. We're replacing the phone calls and WhatsApp groups that Argentine truckers rely on today with a structured, digital platform.

The Argentine trucking sector moves **93% of all domestic freight**, has **460,000+ active trucks**, and represents a **USD 35 billion market** with no dominant digital load board. CarGA is built to own that space.

For full project context, read the [README](README.md). For product specs, see [PRODUCT.md](PRODUCT.md).

---

## The Stack at a Glance

| Tool | Version | Purpose | Docs |
|------|---------|---------|------|
| Next.js | 14 (App Router) | Frontend + API routes | [nextjs.org/docs](https://nextjs.org/docs) |
| TypeScript | 5.x (strict) | Type safety | [typescriptlang.org](https://www.typescriptlang.org/docs/) |
| Supabase | Latest | Database, Auth, Realtime, Storage | [supabase.com/docs](https://supabase.com/docs) |
| Tailwind CSS | 3.x | Utility-first styling | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| Google Maps Platform | Latest | Maps, Geocoding, Distance Matrix | [developers.google.com/maps](https://developers.google.com/maps) |
| WhatsApp Business API | Cloud API v18+ | Push notifications to truckers | [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp) |
| Mercado Pago | Latest | Subscription payments in ARS | [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers) |
| Playwright | 1.49+ | E2E testing | [playwright.dev](https://playwright.dev) |
| PostHog | Latest | Product analytics | [posthog.com/docs](https://posthog.com/docs) |
| Sentry | Latest | Error monitoring | [docs.sentry.io](https://docs.sentry.io) |
| pnpm | 9+ | Package manager | [pnpm.io](https://pnpm.io) |

---

## Prerequisites

Before you begin, ensure you have these installed:

```bash
# Check Node.js (need 20+)
node --version

# Check pnpm (need 9+)
pnpm --version

# Check Git
git --version

# Install Supabase CLI
pnpm add -g supabase
supabase --version
```

| Requirement | Minimum | Install |
|------------|---------|---------|
| Node.js | 20.0.0 | [nodejs.org](https://nodejs.org) |
| pnpm | 9.0.0 | `npm install -g pnpm` |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |
| Supabase CLI | Latest | `pnpm add -g supabase` |

You'll also need accounts on:
- [Supabase](https://supabase.com) (free tier is fine for dev)
- [Vercel](https://vercel.com) (optional — for deployment previews)

---

## Getting the Code

```bash
# Clone the repo
git clone https://github.com/digar011/carga-landing.git
cd carga-landing

# Check out the develop branch (this is where all work happens)
git checkout develop

# Create your feature branch
git checkout -b feature/your-task-description
```

### Branch strategy
- `main` — Production. Always stable. Never commit directly.
- `develop` — Integration branch. All feature branches merge here.
- `feature/<name>` — Your work branch. Branch from `develop`.
- `fix/<name>` — Bug fix branches.
- `hotfix/<name>` — Urgent production fixes (branch from `main`).

---

## Environment Setup

```bash
# Copy the environment template
cp .env.example .env.local
```

Now fill in each variable. Here's where to get each one:

### Supabase (Required)
1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **Settings → API** in your project dashboard
3. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — service_role key (server-side only, never expose to client)

### Google Maps Platform (Required for map features)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Distance Matrix API
3. Create an API key → Restrict to these 3 APIs + your dev domain
4. Copy to `NEXT_PUBLIC_GOOGLE_MAPS_KEY`

### WhatsApp Business API (Required for notifications)
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create an app → Add WhatsApp product
3. Set up a test phone number (Meta provides one for free in dev mode)
4. Copy:
   - `WHATSAPP_ACCESS_TOKEN` — System user permanent token
   - `WHATSAPP_PHONE_NUMBER_ID` — Test phone number ID
   - `WHATSAPP_BUSINESS_ACCOUNT_ID` — Business account ID
   - `WHATSAPP_VERIFY_TOKEN` — Any string you choose (used for webhook verification)

### Mercado Pago (Required for payments)
1. Go to [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Create a test application
3. Go to **Credentials → Test credentials**
4. Copy:
   - `MERCADOPAGO_ACCESS_TOKEN` — Test access token (starts with `TEST-`)
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` — Test public key

### AFIP (No key needed)
The CUIT validation endpoint is public. No credentials required.

### Firebase FCM (Phase 1)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project → Enable Cloud Messaging
3. Copy server key + client config

### Resend (Phase 1)
1. Go to [resend.com](https://resend.com) → Create account
2. Generate API key → Copy to `RESEND_API_KEY`

### Sentry (Phase 1)
1. Go to [sentry.io](https://sentry.io) → Create project (Next.js)
2. Copy DSN to `NEXT_PUBLIC_SENTRY_DSN`

### PostHog (Phase 1)
1. Go to [posthog.com](https://posthog.com) → Create project
2. Copy project API key + host URL

---

## Database Setup

```bash
# Start local Supabase (runs PostgreSQL + Studio locally)
supabase start

# Run all migrations
supabase db push

# Load seed data (development test data)
supabase db seed

# Open Supabase Studio (local database GUI)
# Visit: http://localhost:54323
```

### Important: Row Level Security (RLS)
**Every table has RLS enabled.** This is non-negotiable. RLS policies ensure:
- Transportistas can only see/edit their own profile and applications
- Cargadores can only manage their own loads
- Admins can access everything
- Unauthenticated users see nothing

**Never** disable RLS "just to make something work." If your query returns empty results, check that your auth context is correct — not that RLS is in the way.

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Set up test users (requires Supabase connection)
make setup-users

# Start the development server
pnpm dev
```

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Transportista** | `testuser@carga.com.ar` | `Testpassword123!` |
| **Cargador** | `testcargador@carga.com.ar` | `Testpassword123!` |
| **Admin** | `testadmin@carga.com.ar` | `Testpassword123!` |

A primary super-admin account is also created with full access to all 3 roles via a toggle in the header. Configure `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in `.env.local` before running the setup script.

Open [http://localhost:3000](http://localhost:3000).

### What you'll see

The Next.js app is live with the full scaffold:
- **Home / Landing**: [http://localhost:3000](http://localhost:3000) — marketing page with hero + stats
- **Login**: [http://localhost:3000/iniciar-sesion](http://localhost:3000/iniciar-sesion)
- **Register**: [http://localhost:3000/registro](http://localhost:3000/registro) — role selection (transportista/cargador)
- **Static landing**: [http://localhost:3000/landing/index.html](http://localhost:3000/landing/index.html)
- **Investor prototype**: [http://localhost:3000/landing/prototype.html](http://localhost:3000/landing/prototype.html)

### Common first-run issues

| Problem | Solution |
|---------|----------|
| `ENOENT: .env.local not found` | Run `cp .env.example .env.local` and fill in values |
| Supabase connection refused | Run `supabase start` first, or check your project URL |
| Google Maps shows gray box | Check API key is valid + Maps JS API is enabled |
| WhatsApp webhook 403 | Verify `WHATSAPP_VERIFY_TOKEN` matches what you set in Meta dashboard |
| `pnpm: command not found` | Run `npm install -g pnpm` |
| Port 3000 already in use | Kill the process: `npx kill-port 3000` or use `pnpm dev -- -p 3001` |
| TypeScript strict errors | Fix them — strict mode is non-negotiable. No `any` without a comment explaining why. |
| RLS returning empty results | You're not authenticated, or your role doesn't match the policy. Check Supabase Studio → Auth |
| Playwright tests fail | Run `npx playwright install chromium` first |
| Node version mismatch | Use nvm: `nvm use 20` |

---

## Project Architecture

```
app/
├── (auth)/               ← Login (/iniciar-sesion), Register (/registro)
├── (transportista)/      ← Carrier routes: /t-panel, /t-cargas, /t-mapa, /t-perfil
├── (cargador)/           ← Shipper routes: /c-panel, /c-publicar, /c-mis-cargas, /c-perfil
├── (admin)/              ← Admin routes: /a-panel, /a-usuarios, /a-cargas, /a-reportes
├── api/                  ← Auth callback + webhook handlers
├── page.tsx              ← Landing / marketing page
components/
├── ui/                   ← 9 primitives: Button, Input, Label, Select, Card, Badge, Modal, Textarea, Spinner
├── shared/               ← Header, Sidebar, BottomNav (all role-aware)
lib/                      ← Supabase, WhatsApp, MercadoPago, AFIP, Google Maps, Resend, Sentry, PostHog
types/                    ← All TypeScript types (T-prefix: TUser, TLoad, TProfile)
utils/                    ← Zod validations, constants (provinces, labels), format helpers
supabase/migrations/      ← 10 SQL migration files (never edit existing ones)
```

### Why route prefixes?
Routes use `t-`, `c-`, `a-` prefixes (e.g., `/t-cargas`, `/c-publicar`, `/a-usuarios`) because Next.js App Router doesn't allow two route groups to resolve to the same path (e.g., both `(transportista)/panel` and `(cargador)/panel` would resolve to `/panel`). The prefix makes each route unique while the middleware enforces role-based access.

### Architecture principles
- **Route groups** `(transportista)`, `(cargador)`, `(admin)` — each role gets its own layout, nav, and middleware guards. No conditional rendering gymnastics.
- **Server components by default** — data fetching happens on the server. Client components only where interactivity is needed (maps, forms, real-time subscriptions).
- **lib/ wrappers** — every external service has a single wrapper. No direct API calls scattered across components.
- **types/ directory** — all types in one place. Convention: `TUser`, `TLoad`, `TProfile`. No inline type definitions in components.

### Key files every developer should know
| File | What it does |
|------|-------------|
| `middleware.ts` | Route protection — redirects based on auth status + role |
| `lib/supabase/client.ts` | Browser-side Supabase client (anon key) |
| `lib/supabase/server.ts` | Server-side Supabase client + service role client |
| `lib/supabase/middleware.ts` | Session refresh + role-based route guards |
| `types/database.ts` | All TypeScript types for database entities |
| `utils/validations.ts` | Zod schemas for all forms (loads, profiles, trucks, ratings) |
| `utils/constants.ts` | Argentine provinces, truck/cargo/status labels, plan prices |
| `utils/format.ts` | formatARS, formatDistance, formatRelativeTime helpers |
| `components/ui/index.ts` | Barrel export for all 9 UI primitives |
| `supabase/seed.sql` | Test data template for local development |

---

## Engineering Standards

These are Codexium standards. They're non-negotiable across all projects.

### Commits — Conventional Commits
```
feat(loads): add real-time filtering to load board
fix(auth): resolve session conflict on role switch
docs(readme): add environment variables table
chore(deps): upgrade supabase-js to 2.x
test(loads): add E2E test for load posting flow
refactor(lib): extract WhatsApp message builder
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`, `ci`

### Branches
```
feature/load-board-filters
fix/auth-session-conflict
hotfix/whatsapp-webhook-500
```

### Pull Requests
Every PR must include:
1. **Description** — What changed and why
2. **How to test** — Steps to verify the change works
3. **Screenshots** — If any UI changed (mobile + desktop)
4. Pass CI (lint + typecheck + tests)
5. At least one reviewer approval

### TypeScript
- `strict: true` — always
- No `any` without a `// @ts-expect-error: [reason]` or `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- [reason]` comment
- Types use PascalCase with T prefix: `TUser`, `TLoad`, `TRating`
- Files use kebab-case: `load-card.tsx`, `use-loads.ts`
- Components use PascalCase: `LoadCard`, `MapView`, `ProfileHeader`

### Supabase
- **RLS on every table** — no exceptions
- **Never use service role key client-side** — only in server components or API routes
- **All schema changes via migrations** — never edit production directly
- **Never store secrets in localStorage** — use httpOnly cookies via Supabase Auth

### API Routes
- Every route returns consistent JSON: `{ success: true, data }` or `{ success: false, error: { code, message } }`
- Every route has error handling — no unhandled promise rejections
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### CSS / UI
- **Mobile-first** — design at 375px, then scale up
- All user-facing strings in **Spanish (es-AR)** — use Argentine voseo ("vos" not "tú")
- Test at: 375px (iPhone SE), 390px (iPhone 14), 428px (iPhone 14 Pro Max), 768px (tablet), 1280px (desktop)

### Security
- Never hardcode secrets — environment variables only
- Validate all user input (Zod schemas)
- Sanitize outputs to prevent XSS
- `npm audit` before every release — zero critical/high vulnerabilities

---

## Your First Task

1. **Find a task** — Open [TODO.md](TODO.md) and pick a `[S]` (small) task that's unchecked
2. **Create a branch** — `git checkout -b feature/your-task-name`
3. **Make the change** — Follow the standards above
4. **Test it** — Run `pnpm test` and `pnpm lint`
5. **Commit** — `git commit -m "feat(scope): description of change"`
6. **Push** — `git push -u origin feature/your-task-name`
7. **Open a PR** — Target `develop`, include description + how to test
8. **Request review** — Tag the project lead

Your PR will be reviewed within 24 hours. Address any feedback, get approval, and it'll be squash-merged to `develop`.

---

## Key Contacts & Resources

| Resource | Link / Contact |
|----------|---------------|
| Project Lead | Diego — CEO, Codexium |
| Argentine Market Lead | Co-founder (TBD) |
| GitHub Repository | [github.com/digar011/carga-landing](https://github.com/digar011/carga-landing) |
| Supabase Dashboard | *(configured per environment)* |
| Vercel Project | *(configured after MVP setup)* |
| Design Files (Figma) | *(coming soon)* |
| Codexium Website | [codexium.ai](https://codexium.ai) |

---

## Useful Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript compiler check |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm test:coverage` | Tests with coverage report |
| `supabase start` | Start local Supabase |
| `supabase stop` | Stop local Supabase |
| `supabase db push` | Apply migrations |
| `supabase db seed` | Load seed data |
| `supabase gen types typescript` | Regenerate database types |
| `npx serve . -l 3000` | Serve static files (landing + prototype) |
| `npx playwright install` | Install Playwright browsers |

---

## Troubleshooting

### 1. "Module not found" after pulling latest
```bash
pnpm install
```

### 2. Supabase types out of date
```bash
supabase gen types typescript --local > types/database.ts
```

### 3. Playwright tests fail on first run
```bash
npx playwright install chromium
```

### 4. Port conflict
```bash
npx kill-port 3000
pnpm dev
```

### 5. Environment variable not loading
- Make sure it's in `.env.local` (not `.env`)
- Client-side vars **must** start with `NEXT_PUBLIC_`
- Restart `pnpm dev` after changing env vars

### 6. Supabase RLS blocks my query
- Check you're authenticated (inspect cookies/session)
- Check your user's role matches the RLS policy
- Use Supabase Studio → SQL Editor to test the query directly with `set role authenticated`

### 7. Google Maps quota exceeded
- Check [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Quotas
- Enable billing (free tier includes $200/month credit)

### 8. WhatsApp messages not sending
- Check Meta dashboard for error logs
- Verify phone number is registered and verified
- Message templates must be approved before use in production

### 9. TypeScript errors you can't fix
- Run `pnpm typecheck` to see the full error
- Check `types/database.ts` is up to date
- Never add `// @ts-ignore` — use `// @ts-expect-error: [reason]` if absolutely necessary

### 10. Git merge conflicts on migrations
- Never edit existing migration files
- Always create new migration files: `supabase migration new my_change`
- If conflicts arise, coordinate with the team — migration order matters

---

*Welcome aboard. Build something great.* 🚛
