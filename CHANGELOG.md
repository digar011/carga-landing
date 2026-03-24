# Changelog

All notable changes to the CarGA project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Versioning strategy:**
- `0.x.x` — Pre-launch development
- `1.0.0` — Public beta launch (Buenos Aires + Córdoba)
- `1.x.x` — MVP improvements and bug fixes
- `2.0.0` — Android app launch (Phase 2)
- `3.0.0` — LATAM expansion (Phase 3)

---

## [Unreleased]

### Added
- Pre-launch landing page (`index.html`) with all 6 sections: hero, problem, how it works, market stats, waitlist signup, footer
- Waitlist signup form with client-side validation and localStorage persistence (base count: 47)
- Interactive 8-screen mobile app prototype (`prototype.html`) for investor demos
  - Splash/onboarding, login, load board, load detail, WhatsApp chat simulation, map view, publish load, profile/dashboard
  - Phone frame on desktop, full-screen on mobile, slide transitions
- Playwright E2E test suite: 42 tests covering landing page (20) and prototype (22)
- HTML linting configuration (htmlhint, 0 errors)
- Full project documentation: README.md, TODO.md, CHANGELOG.md, ONBOARDING.md, PRODUCT.md, CLAUDE.md
- SEO meta tags, Open Graph, Twitter Cards, JSON-LD structured data on landing page
- Responsive mobile-first design (navy #1A3C5E / gold #C9922A palette)
- Sticky navbar with backdrop blur on scroll
- GitHub repository created and pushed

---

## [0.2.0] — Foundation Complete (target: end of Week 2)

> Next.js 14 project scaffold, Supabase database with all tables and RLS, dual-role auth system, CI/CD pipeline, shared UI components.

### Added
- Next.js 14 App Router project initialization with TypeScript strict mode
- Supabase project with all 10 core tables + RLS policies
- Dual-role authentication (transportista / cargador / admin)
- Seed data with realistic Argentine freight scenarios
- CI/CD pipeline (GitHub Actions: lint, typecheck, test, build)
- Shared UI component library (Button, Input, Card, Badge, Modal, Select)
- Responsive layout shell (Header, Sidebar, mobile BottomNav)
- Sentry error monitoring + PostHog analytics integration
- Vercel deployment with preview environments

---

## [0.3.0] — Core Load Board Functional (target: end of Week 4)

> Shippers can post loads. Carriers can browse, filter, and apply. Real-time updates.

### Added
- Load posting form with address autocomplete, Zod validation, draft/publish workflow
- Real-time load board with Supabase Realtime subscriptions
- Load filtering (zone, truck type, weight, rate) and sorting (newest, closest, highest rate)
- Load detail page with full cargo info + shipper profile
- "Apply to load" flow with optional message
- Application management for shippers (view, accept, reject)
- Load status lifecycle (publicada → aplicada → asignada → en_camino → entregada → calificada)
- "My loads" and "My applications" dashboards

---

## [0.4.0] — Maps + WhatsApp Integrated (target: end of Week 6)

> Interactive map of available loads. WhatsApp notifications when matching loads are posted.

### Added
- Google Maps interactive load map with pins, clustering, and load summary cards
- Geocoding on load creation (city → coordinates)
- Distance Matrix display (km + estimated hours between origin/destination)
- "Loads near me" filter using browser geolocation
- WhatsApp Business API integration via Meta Cloud API
- Message templates: new_matching_load, application_accepted, application_rejected, load_status_update, welcome
- Matching engine: new load → find transportistas by truck type + zone → WhatsApp alert
- WhatsApp opt-in/opt-out management
- Firebase FCM fallback for push notifications

---

## [0.5.0] — Payments + CUIT Verification (target: end of Week 8)

> Paid subscription plans live. CUIT verified badges. Mutual ratings after trips.

### Added
- Mercado Pago subscription payments (Checkout Pro + Checkout API)
- Six subscription plans: Básico/Profesional/Flota (carriers) + Starter/Estándar/Premium (shippers)
- Free tier enforcement (3 searches/day for carriers, 3 posts/month for shippers)
- Payment history page
- AFIP CUIT validation with verified badge on profiles
- Mutual rating system (1-5 stars + comment after completed trips)
- Rating moderation in admin panel

---

## [0.6.0] — Admin Dashboard + Full QA (target: end of Week 13)

> Complete backoffice. Security hardened. Performance optimized. Test coverage 80%+.

### Added
- Admin dashboard: overview metrics, user management, load moderation
- CUIT verification queue (pending → approved/rejected)
- Ratings moderation panel
- Subscription overview + revenue reporting
- Admin action audit logs
- CSV data export

### Security
- RLS policy audit + penetration testing across roles
- Input sanitization on all forms
- Rate limiting on API routes
- CSRF protection, secure headers (HSTS, CSP)
- npm audit: zero critical/high vulnerabilities

### Fixed
- Performance: Lighthouse LCP < 2.5s, FID < 100ms, CLS < 0.1
- Database query optimization + indexes on filtered columns
- Bundle size optimization via lazy loading

---

## [1.0.0] — Public Beta Launch (target: Week 14)

> CarGA goes live in Buenos Aires and Córdoba. First 50 transportistas + 20 cargadores onboarded.

### Added
- Production deployment on Vercel + Supabase Cloud
- Buenos Aires + Córdoba market launch
- WhatsApp message templates approved by Meta
- Mercado Pago production credentials
- Privacy policy + terms of service pages
- Manual onboarding program for initial users

---

## [1.1.0] — Post-Launch Fixes

> Rapid iteration based on real user feedback from first 2 weeks of operation.

### Fixed
- Bug fixes identified during initial onboarding
- UX improvements from user feedback sessions
- Performance tuning under real load

---

## [2.0.0] — Android App + AI Pricing (Phase 2)

> Native Android app. Real-time chat. AI freight pricing powered by Claude. National expansion.

### Added
- Native Android app (React Native / Expo)
- Real-time in-app chat between transportista and cargador
- AI freight pricing suggestions (Claude API)
- Shipper analytics dashboard
- CNRT verification
- Referral program
- Public API for integrators
- Expansion to Santa Fe, Mendoza, Tucumán
- Monetization activated (paid plans live)

---

## [3.0.0] — iOS + LATAM Expansion (Phase 3)

> iOS app. Insurance marketplace. ERP integrations. Uruguay, Chile, Paraguay.

### Added
- Native iOS app
- Insurance marketplace (Argentine freight insurers)
- Electronic invoicing (factura electrónica via AFIP)
- ERP integrations (SAP, Oracle)
- LATAM expansion: Uruguay, Chile, Paraguay
- Predictive AI pricing engine (ML model on CarGA data)
- White-label solution for freight brokers
- Advanced financial dashboard for fleet operators

---

[Unreleased]: https://github.com/digar011/carga-landing/compare/v1.0.0...HEAD
[0.2.0]: https://github.com/digar011/carga-landing/releases/tag/v0.2.0
[0.3.0]: https://github.com/digar011/carga-landing/releases/tag/v0.3.0
[0.4.0]: https://github.com/digar011/carga-landing/releases/tag/v0.4.0
[0.5.0]: https://github.com/digar011/carga-landing/releases/tag/v0.5.0
[0.6.0]: https://github.com/digar011/carga-landing/releases/tag/v0.6.0
[1.0.0]: https://github.com/digar011/carga-landing/releases/tag/v1.0.0
[1.1.0]: https://github.com/digar011/carga-landing/releases/tag/v1.1.0
[2.0.0]: https://github.com/digar011/carga-landing/releases/tag/v2.0.0
[3.0.0]: https://github.com/digar011/carga-landing/releases/tag/v3.0.0
