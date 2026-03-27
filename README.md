<p align="center">
  <span style="font-size: 64px">🚛</span>
</p>

<h1 align="center">CarGA</h1>
<p align="center"><strong>La bolsa de cargas digital de Argentina</strong></p>
<p align="center">Argentina's first digital load board — connecting truck operators with freight shippers in real time.</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.6.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js 14">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E" alt="Supabase">
  <img src="https://img.shields.io/badge/tests-246%20passing-brightgreen" alt="246 tests passing">
  <img src="https://img.shields.io/badge/status-MVP--ready-brightgreen" alt="Status">
</p>

---

**CarGA** is a two-sided marketplace that replaces the phone calls and WhatsApp groups Argentine truckers rely on today with a structured, real-time digital load board. Shippers post loads. Carriers find them instantly. Matching loads trigger WhatsApp notifications — meeting truckers where they already live.

**CarGA** es un marketplace de dos lados que reemplaza las llamadas telefónicas y los grupos de WhatsApp que los transportistas argentinos usan hoy, con una bolsa de cargas digital en tiempo real. Los cargadores publican cargas. Los transportistas las encuentran al instante. Las cargas que coinciden disparan notificaciones por WhatsApp — encontrando a los camioneros donde ya están.

---

## Table of Contents

- [The Opportunity](#the-opportunity)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Monetization](#monetization)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Built By](#built-by)

---

## The Opportunity

| Metric | Value |
|--------|-------|
| Active trucks in Argentina | **460,000+** |
| Domestic freight moved by road | **93%** |
| Market size (annual) | **USD 35 billion** |
| Dominant digital load board | **None** |
| How truckers find loads today | Phone calls + WhatsApp groups |

Argentina's trucking sector is massive, essential, and completely undigitized. No platform dominates the digital load board space. CarGA is built to own it.

---

## Features

### MVP (Phase 1 — Weeks 1-14)

| Feature | Description |
|---------|-------------|
| **Dual-role auth** | Separate flows for transportistas (carriers) and cargadores (shippers) |
| **Real-time load board** | Live feed of available loads with filtering by zone, truck type, weight, and rate |
| **Interactive load map** | Google Maps integration showing available loads geographically |
| **Load posting** | Shippers publish loads with origin, destination, weight, cargo type, and rate |
| **WhatsApp notifications** | Instant alerts via WhatsApp Business API when a matching load is posted |
| **Ratings & reputation** | Mutual rating system after completed trips — builds trust in the marketplace |
| **Mercado Pago payments** | Subscription billing in ARS via Checkout Pro + Checkout API |
| **CUIT verification** | AFIP API integration to validate carrier and shipper tax IDs |
| **Admin dashboard** | Backoffice for user management, load moderation, and platform analytics |
| **Mobile-first design** | Optimized for 375px — most truckers access from Android phones |

### Phase 2 — Growth (Months 4-9)
- Native Android app
- Real-time in-app chat
- AI freight pricing suggestions (Claude API)
- Shipper analytics dashboard
- CNRT verification
- Referral program
- Public API for integrators

### Phase 3 — Scale (Months 10-18)
- Native iOS app
- Insurance marketplace
- Electronic invoicing (factura electrónica)
- ERP integrations (SAP, etc.)
- Regional LATAM expansion (Uruguay, Chile, Paraguay)
- Predictive AI pricing engine
- White-label solution for freight brokers

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 (App Router) | Server components, file-based routing, Vercel-native deployment |
| **Database** | Supabase (PostgreSQL) | Real-time subscriptions, built-in auth, RLS, free tier for MVP |
| **Auth** | Supabase Auth | Dual-role (transportista/cargador), email + phone, session management |
| **Hosting** | Vercel | Zero-config Next.js deployment, edge functions, preview environments |
| **Maps** | Google Maps Platform | Maps JS API + Geocoding + Distance Matrix — best coverage in Argentina |
| **Notifications** | WhatsApp Business API (Meta Cloud) | Primary channel — truckers live on WhatsApp, not email |
| **Push notifications** | Firebase FCM | Web + Android push for secondary alerts |
| **Payments** | Mercado Pago | Dominant payment processor in Argentina, handles ARS natively |
| **Identity** | AFIP API | CUIT/CUIL validation — Argentine tax authority public endpoint |
| **Email** | Resend | Transactional emails (welcome, receipts, password reset) |
| **Error monitoring** | Sentry | Real-time error tracking for Next.js server + client |
| **Analytics** | PostHog | Product analytics, funnels, feature flags — self-hostable |
| **AI (Phase 2)** | Claude API (Anthropic) | Freight pricing suggestion engine based on historical data |
| **Styling** | Tailwind CSS | Utility-first, mobile-first responsive design |
| **Language** | TypeScript (strict) | Full type safety across frontend and backend |

---

## Project Structure

```
carga/
├── app/
│   ├── (auth)/
│   │   ├── iniciar-sesion/         # Login page
│   │   ├── registro/               # Registration with role selection
│   │   └── layout.tsx
│   ├── (transportista)/            # Carrier routes (prefixed /t-*)
│   │   ├── t-panel/                # Dashboard
│   │   ├── t-cargas/               # Load board (browse/filter)
│   │   ├── t-mapa/                 # Map view of loads
│   │   ├── t-perfil/               # Profile
│   │   └── layout.tsx
│   ├── (cargador)/                 # Shipper routes (prefixed /c-*)
│   │   ├── c-panel/                # Dashboard
│   │   ├── c-publicar/             # Post a load
│   │   ├── c-mis-cargas/           # My posted loads
│   │   ├── c-perfil/               # Profile
│   │   └── layout.tsx
│   ├── (admin)/                    # Admin routes (prefixed /a-*)
│   │   ├── a-panel/                # Admin dashboard
│   │   ├── a-usuarios/             # User management
│   │   ├── a-cargas/               # Load moderation
│   │   ├── a-reportes/             # Reports
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/callback/          # Supabase auth callback
│   │   └── webhooks/               # WhatsApp + Mercado Pago webhooks
│   ├── globals.css
│   ├── layout.tsx                  # Root layout (Inter font, metadata)
│   └── page.tsx                    # Landing / marketing page
├── components/
│   ├── ui/                         # 9 reusable primitives (Button, Input, Card, etc.)
│   ├── shared/                     # Header, Sidebar, BottomNav (role-aware)
│   ├── transportista/              # Role-specific components
│   └── cargador/
├── lib/
│   ├── supabase/                   # Client, server, middleware instances
│   ├── whatsapp/                   # WhatsApp Business API wrapper
│   ├── mercadopago/                # Mercado Pago API wrapper
│   ├── google-maps/                # Maps JS + Geocoding + Distance Matrix
│   ├── afip/                       # CUIT validation
│   ├── email/                      # Resend email wrapper + templates
│   └── monitoring/                 # Sentry + PostHog scaffolds
├── types/                          # All TypeScript types (T-prefix convention)
├── hooks/                          # Custom React hooks
├── utils/                          # Validations (Zod), constants, format helpers
├── public/
│   ├── images/                     # App images and assets
│   └── landing/                    # Static landing page + prototype
├── supabase/
│   ├── migrations/                 # 10 SQL migration files
│   └── seed.sql                    # Development seed data
├── tests/
│   ├── e2e/                        # Playwright E2E tests
│   └── unit/                       # Vitest unit tests
├── .github/workflows/ci.yml       # GitHub Actions CI pipeline
├── .env.example
├── middleware.ts                    # Auth + role-based route protection
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
├── vitest.config.ts
├── package.json
├── Makefile
├── CLAUDE.md
├── README.md
├── TODO.md
├── CHANGELOG.md
├── ONBOARDING.md
└── PRODUCT.md
```

> **Note on route prefixes:** Routes use `t-`, `c-`, `a-` prefixes to avoid Next.js App Router conflicts between route groups sharing the same path names. The middleware enforces role-based access to each prefix.

---

## Getting Started

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | 9+ | `npm install -g pnpm` |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |
| Supabase CLI | Latest | `pnpm add -g supabase` |

### Installation

```bash
# Clone the repository
git clone https://github.com/digar011/carga-landing.git
cd carga-landing

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in all required values — see Environment Variables section below

# Run database migrations (when Supabase is configured)
supabase db push

# Load seed data (development only)
supabase db seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Set Up Test Users

After configuring Supabase, create the initial users:

```bash
make setup-users
```

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Transportista** | `testuser@carga.com.ar` | `Testpassword123!` |
| **Cargador** | `testcargador@carga.com.ar` | `Testpassword123!` |
| **Admin** | `testadmin@carga.com.ar` | `Testpassword123!` |

> **Note:** A primary super-admin account is also created by the setup script with full access to all roles (admin + transportista + cargador) via a role switcher toggle. Configure `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in `.env.local` before running `make setup-users`.

### What's Running Now

The full Next.js 14 app is scaffolded and builds cleanly. Run `pnpm dev` and visit:

- **Home / Landing**: [http://localhost:3000](http://localhost:3000)
- **Login**: [http://localhost:3000/iniciar-sesion](http://localhost:3000/iniciar-sesion)
- **Register**: [http://localhost:3000/registro](http://localhost:3000/registro)
- **Static landing page**: [http://localhost:3000/landing/index.html](http://localhost:3000/landing/index.html)
- **Investor prototype**: [http://localhost:3000/landing/prototype.html](http://localhost:3000/landing/prototype.html)

---

## Environment Variables

All environment variables are documented in `.env.example`. **Never commit `.env.local`.**

| Variable | Required | Service | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase | Project URL from Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase | Public anon key for client-side queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase | Server-side only — full database access |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Yes | Google | Maps JS + Geocoding + Distance Matrix APIs |
| `WHATSAPP_ACCESS_TOKEN` | Yes | Meta | WhatsApp Business API permanent token |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes | Meta | Business phone number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Yes | Meta | Business account ID for webhook verification |
| `WHATSAPP_VERIFY_TOKEN` | Yes | Meta | Webhook verification token (you define this) |
| `MERCADOPAGO_ACCESS_TOKEN` | Yes | Mercado Pago | Server-side access token |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Yes | Mercado Pago | Client-side public key |
| `FIREBASE_SERVER_KEY` | Phase 1 | Firebase | FCM push notification server key |
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Phase 1 | Firebase | Client-side Firebase config (JSON) |
| `RESEND_API_KEY` | Phase 1 | Resend | Transactional email API key |
| `NEXT_PUBLIC_SENTRY_DSN` | Phase 1 | Sentry | Error monitoring DSN |
| `SENTRY_AUTH_TOKEN` | Phase 1 | Sentry | Source map upload token |
| `NEXT_PUBLIC_POSTHOG_KEY` | Phase 1 | PostHog | Analytics project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Phase 1 | PostHog | PostHog instance URL |
| `ANTHROPIC_API_KEY` | Phase 2 | Anthropic | Claude API for AI pricing suggestions |

---

## Development Workflow

### Branch Strategy

```
main              ← production, always stable
develop           ← integration branch
feature/<name>    ← new features
fix/<name>        ← bug fixes
hotfix/<name>     ← urgent production fixes
```

### Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(loads): add real-time load board filtering
fix(auth): resolve dual-role session conflict
docs(readme): add environment variables table
chore(deps): upgrade Supabase client to 2.x
```

### Pull Request Process

1. Create a branch from `develop`
2. Make changes, commit with conventional commits
3. Open a PR with: description, how to test, screenshots (if UI)
4. Pass all CI checks (lint, typecheck, tests)
5. Get approval from at least one reviewer
6. Squash merge to `develop`

**Never push directly to `main` or `develop`.**

---

## Architecture Overview

CarGA follows a **server-first architecture** leveraging Next.js 14 App Router:

- **Server Components** handle data fetching — Supabase queries run on the server, never exposing service keys
- **Client Components** handle interactivity — maps, forms, real-time subscriptions
- **Route Groups** separate user roles — `(transportista)`, `(cargador)`, `(admin)` each have their own layouts and middleware guards
- **Supabase RLS** enforces data access at the database level — every table has row-level security policies
- **Webhook routes** receive callbacks from WhatsApp (message status), Mercado Pago (payment events), and Supabase (real-time triggers)
- **Real-time subscriptions** power the live load board — new loads appear instantly for all connected users

For deeper architecture documentation, see `docs/ARCHITECTURE.md` (coming in Phase 1).

### Database Schema (Core Tables)

| Table | Purpose |
|-------|---------|
| `users` | Auth users with role (transportista/cargador/admin) |
| `profiles_transportista` | Carrier profiles — CUIT, rating, truck details, plan |
| `profiles_cargador` | Shipper profiles — empresa, CUIT, rating, plan |
| `trucks` | Registered trucks — tipo, patente, capacidad, marca |
| `loads` | Posted loads — origin/dest coords, cargo type, rate, status |
| `load_applications` | Carrier applications to loads |
| `ratings` | Mutual ratings after completed trips |
| `notifications` | In-app notification queue |
| `subscriptions` | Mercado Pago subscription tracking |
| `admin_logs` | Admin action audit trail |

---

## Monetization

### Transportistas (Carriers)

| Plan | Price | Includes |
|------|-------|----------|
| **Básico** | Free | 3 searches/day |
| **Profesional** | USD 10/mo (ARS 13,500) | Unlimited searches + WhatsApp alerts + verified badge |
| **Flota** | USD 25/mo (ARS 33,750) | Up to 10 units + fleet dashboard |

### Cargadores (Shippers)

| Plan | Price | Includes |
|------|-------|----------|
| **Starter** | Free | 3 posts/month |
| **Estándar** | USD 15/mo (ARS 20,250) | 20 posts + analytics |
| **Premium** | USD 35/mo (ARS 47,250) | Unlimited + featured listings + priority support |
| **Enterprise** | Custom | API access + ERP integration + account manager |

---

## Roadmap

| Phase | Timeline | Milestone |
|-------|----------|-----------|
| **Phase 1 — MVP** | Weeks 1-14 | Full load board + maps + WhatsApp + payments → Buenos Aires + Córdoba launch |
| **Phase 2 — Growth** | Months 4-9 | Android app + real-time chat + AI pricing + national expansion |
| **Phase 3 — Scale** | Months 10-18 | iOS app + insurance + invoicing + ERP + LATAM expansion |

### Launch Strategy
1. **Buenos Aires + Córdoba** — manual onboarding of 50 transportistas + 20 cargadores
2. Free during validation phase — monetize in Phase 2
3. WhatsApp group outreach to existing informal trucking communities
4. Expand to Santa Fe, Mendoza, Tucumán in Phase 2

---

## Contributing

We welcome contributions. Please read `ONBOARDING.md` for setup instructions and engineering standards.

1. Fork the repository
2. Create a feature branch (`feature/my-feature`)
3. Follow Conventional Commits for all commit messages
4. Ensure all tests pass (`pnpm test`)
5. Ensure linting passes (`pnpm lint`)
6. Open a Pull Request against `develop`

See `CLAUDE.md` for AI-assisted development guidelines.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Built By

<p align="center">
  <strong>Codexium</strong> · AI-augmented engineering<br>
  <a href="https://codexium.ai">codexium.ai</a>
</p>

CarGA is built under a co-founder model: Codexium contributes full MVP development as equity. An Argentine co-founder contributes market knowledge, capital, and ground operations.

---

*This README reflects the project as of v0.6.0 (MVP feature-complete — load board, maps, WhatsApp, payments, ratings, CUIT verification, admin dashboard, 246 tests passing). Last updated: 2025-03-26.*
