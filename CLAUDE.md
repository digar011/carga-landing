# CLAUDE.md — CarGA

## Project Overview
CarGA is Argentina's first digital load board — a two-sided marketplace connecting truck operators (transportistas) with freight shippers (cargadores) in real time. Replaces phone calls and WhatsApp groups with a structured digital platform.

**Market:** 460,000+ active trucks, 93% of domestic freight by road, USD 35B market, zero digital load board dominance.

**Company:** Built by Codexium (codexium.ai) under a co-founder model. Pre-money valuation: USD 200,000.

## Current State
Phase 1 Weeks 1-13 complete. MVP feature-complete, pending Week 14 production launch.
- **40 routes**: 25 pages + 17 API endpoints (loads, applications, ratings, subscriptions, admin, webhooks, verify-cuit)
- **10 Supabase tables** with RLS policies, triggers, and enums
- **246 tests**: 121 unit (Vitest) + 125 E2E (Playwright) — all passing
- **Security**: rate limiting, input sanitization, CSP headers, secret exposure checks
- Full load board marketplace: post, browse, filter, apply, accept/reject, status lifecycle
- Google Maps interactive load map + WhatsApp Business API notifications
- Mercado Pago subscriptions (6 plans) + AFIP CUIT verification + mutual ratings
- Admin dashboard with user/load management, reports, CSV export

## Tech Stack — Active
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript strict, Tailwind CSS |
| Database | Supabase (PostgreSQL + Realtime + Auth) — 10 tables with RLS |
| Maps | Google Maps JS API (dynamic loading) |
| Notifications | WhatsApp Business API + in-app fallback |
| Payments | Mercado Pago (Checkout Pro + subscriptions) |
| Identity | AFIP CUIT validation |
| Email | Resend |
| Security | Rate limiting (in-memory), input sanitization, CSP headers |
| Testing | Vitest (121 unit) + Playwright (125 E2E) — 246 total |
| CI/CD | GitHub Actions (lint, typecheck, test, build) |

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
- **TypeScript strict mode** — zero `any` without explicit justification comment
- **RLS on every Supabase table** — never disable, not even for convenience
- **Conventional Commits** on all commits (feat, fix, docs, chore, refactor, test)
- **Never push directly to main or develop** — always use PRs
- **Route prefixes:** `/t-*` transportista, `/c-*` cargador, `/a-*` admin — enforced by middleware
- **Images:** Place in `public/images/` — use `next/image` for optimization

## Key Documentation
| File | Purpose |
|------|---------|
| `README.md` | Setup, stack, architecture, getting started |
| `TODO.md` | Full task queue with complexity tags — single source of truth |
| `CHANGELOG.md` | Follows keepachangelog.com + semver |
| `ONBOARDING.md` | New developer guide — zero to PR in 2 hours |
| `PRODUCT.md` | Features, specs, API docs, financial projections |
