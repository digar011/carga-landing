# CLAUDE.md — CarGA

## Project Overview
CarGA is Argentina's first digital load board — a two-sided marketplace connecting truck operators (transportistas) with freight shippers (cargadores) in real time. Replaces phone calls and WhatsApp groups with a structured digital platform.

**Market:** 460,000+ active trucks, 93% of domestic freight by road, USD 35B market, zero digital load board dominance.

**Company:** Built by Codexium (codexium.ai) under a co-founder model. Pre-money valuation: USD 200,000.

## Current State
Pre-MVP. Repository contains:
- `index.html` — Production landing page with waitlist signup form
- `prototype.html` — 8-screen interactive mobile app prototype for investor demos

MVP will be a full Next.js 14 + Supabase application (see TODO.md for full roadmap).

## Tech Stack — Current
| Layer | Technology |
|-------|-----------|
| Landing/Prototype | Single HTML files, vanilla CSS + JS |
| Fonts | Google Fonts (Inter) |
| Testing | Playwright E2E (42 tests) |
| Linting | htmlhint |

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
# Serve static files (current)
npx serve . -l 3000

# Lint HTML
npx htmlhint index.html prototype.html

# Run E2E tests
npx playwright test

# Install Playwright browsers
npx playwright install chromium
```

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
