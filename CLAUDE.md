# CLAUDE.md — CarGA

## Project Overview
CarGA is Argentina's first digital load board — a two-sided marketplace connecting truck operators (transportistas) with freight shippers (cargadores) in real time. Replaces phone calls and WhatsApp groups with a structured digital platform.

**Market:** 460,000+ active trucks, 93% of domestic freight by road, USD 35B market, zero digital load board dominance.

**Company:** Built by Codexium (codexium.ai) under a co-founder model. Pre-money valuation: USD 200,000.

## Current State
Phase 1 Week 1-2 Foundation complete. Next.js 14 app scaffold is built and compiles cleanly.
- `public/landing/index.html` — Pre-launch landing page
- `public/landing/prototype.html` — 8-screen interactive prototype for investor demos
- Full Next.js 14 app with App Router, TypeScript strict, Tailwind CSS
- 10 Supabase migration files with all tables + RLS policies
- Dual-role auth system (transportista/cargador/admin) with middleware
- 9 shared UI components, 3 layout components (Header, Sidebar, BottomNav)
- Lib wrappers for all integrations (Supabase, WhatsApp, MercadoPago, AFIP, Google Maps, Resend, Sentry, PostHog)
- CI/CD pipeline (GitHub Actions)

## Tech Stack — Active
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript strict, Tailwind CSS |
| Database | Supabase (PostgreSQL + Realtime + Auth) — 10 tables with RLS |
| Package Manager | pnpm 9 |
| Testing | Vitest (unit) + Playwright (E2E) |
| Linting | ESLint (next/core-web-vitals) |
| CI/CD | GitHub Actions |

## Tech Stack — MVP Target
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript strict, Tailwind CSS |
| Database | Supabase (PostgreSQL + Realtime + Auth) |
| Hosting | Vercel (frontend) + Supabase Cloud |
| Maps | Google Maps Platform (JS + Geocoding + Distance Matrix) |
| Notifications | WhatsApp Business API (Meta Cloud) + Firebase FCM |
| Payments | Mercado Pago (Checkout Pro + API) |
| Identity | AFIP API (CUIT validation) |
| Email | Resend |
| Monitoring | Sentry + PostHog |
| AI (Phase 2) | Claude API (Anthropic) |

## Design System
| Token | Value |
|-------|-------|
| Primary (Navy) | `#1A3C5E` |
| Accent (Gold) | `#C9922A` |
| Blue | `#2563A8` |
| Green | `#16A34A` |
| Background | `#FFFFFF` (landing), `#F5F7FA` (prototype cards) |
| Font | Inter 400/500/600/700/800 |

## Development Commands
```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm typecheck        # TypeScript strict check
pnpm test             # Vitest unit tests
pnpm test:e2e         # Playwright E2E tests
make ci               # Full CI pipeline: lint + typecheck + test + build
make help             # Show all Makefile targets
```

## Route Structure
Routes use prefixes to avoid Next.js route group conflicts:
- `/t-*` — Transportista routes (t-panel, t-cargas, t-mapa, t-perfil)
- `/c-*` — Cargador routes (c-panel, c-publicar, c-mis-cargas, c-perfil)
- `/a-*` — Admin routes (a-panel, a-usuarios, a-cargas, a-reportes)

## Two User Types
1. **Transportistas (Carriers)** — Browse loads, filter by zone/truck type/rate, get WhatsApp alerts, manage profile/ratings/CUIT
2. **Cargadores (Shippers)** — Post loads with origin/dest/weight/type/rate, view carriers, track status, manage history

## Key Rules
- **Language:** All user-facing content in Argentine Spanish (voseo: "vos", "publicá", "encontrá")
- **Mobile-first:** Design at 375px first, most truckers use Android phones
- **No external JS/CSS libraries** (for landing/prototype phase)
- **No build step required** for landing/prototype
- TypeScript strict mode when MVP begins — no `any` without justification
- RLS on every Supabase table — never disable
- Conventional Commits on all commits
- Never push directly to main or develop

## Key Documentation
| File | Purpose |
|------|---------|
| `README.md` | Setup, stack, architecture, getting started |
| `TODO.md` | Full task queue with complexity tags — single source of truth |
| `CHANGELOG.md` | Follows keepachangelog.com + semver |
| `ONBOARDING.md` | New developer guide — zero to PR in 2 hours |
| `PRODUCT.md` | Features, specs, API docs, financial projections |
