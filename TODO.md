# TODO — CarGA

> Single source of truth for all work across the CarGA development lifecycle.

## Legend

| Tag | Meaning |
|-----|---------|
| `[S]` | Small — a few hours |
| `[M]` | Medium — 1-2 days |
| `[L]` | Large — 3-5 days |
| `[XL]` | Extra large — 1 week+ |
| `[ ]` | Not started |
| `[x]` | Completed |
| `[~]` | In progress |
| `[!]` | Blocked |

---

## Completed — Pre-MVP

- [x] `[M]` Create pre-launch landing page (index.html) — 2025-03-24
- [x] `[L]` Build 8-screen interactive prototype (prototype.html) — 2025-03-24
- [x] `[M]` Write Playwright E2E tests (42/42 passing) — 2025-03-24
- [x] `[S]` Set up HTML linting (htmlhint, 0 errors) — 2025-03-24
- [x] `[M]` Create project documentation (README, TODO, CHANGELOG, ONBOARDING, PRODUCT, CLAUDE.md) — 2025-03-24
- [x] `[S]` Push to GitHub repository — 2025-03-24

---

## 🏗️ Phase 1 — MVP (Weeks 1-14)

### Week 1-2: Foundation

- [x] `[M]` Initialize Next.js 14 project with App Router + TypeScript strict mode — 2025-03-25
- [x] `[S]` Configure Tailwind CSS with CarGA design tokens (navy, gold, grays) — 2025-03-25
- [x] `[S]` Set up pnpm workspace + Makefile with standard targets — 2025-03-25
- [x] `[M]` Create Supabase migrations + configure local development — 2025-03-25
- [x] `[L]` Design and create all database tables with migrations — 2025-03-25
  - [x] `users` table with role enum + auto-creation trigger
  - [x] `profiles_transportista` with CUIT validation, ratings, plan
  - [x] `profiles_cargador` with empresa, CUIT, rating, plan
  - [x] `trucks` with tipo enum, patente uniqueness
  - [x] `loads` with origin/dest coords, cargo/truck types, status lifecycle
  - [x] `load_applications` with unique constraint per load/carrier
  - [x] `ratings` with score check 1-5, avg rating triggers
  - [x] `notifications` with tipo enum, JSONB metadata
  - [x] `subscriptions` with MP integration fields
  - [x] `admin_logs` with audit trail
- [x] `[M]` Write RLS policies for all tables (role-based access: transportista, cargador, admin) — 2025-03-25
- [x] `[L]` Implement dual-role auth system — 2025-03-25
  - [x] Supabase Auth configuration (email)
  - [x] Registration flow: role selection (transportista/cargador) with Suspense boundary
  - [x] Login flow with role-based redirect
  - [x] Protected route middleware per role group (t-/c-/a- prefixed routes)
  - [x] Session management via @supabase/ssr cookies
- [x] `[M]` Create seed.sql with realistic Argentine test data — 2025-03-25
- [x] `[S]` Set up Sentry error monitoring scaffold — 2025-03-25
- [x] `[S]` Set up PostHog analytics scaffold + event tracking plan — 2025-03-25
- [x] `[M]` Configure CI/CD pipeline (GitHub Actions: lint, typecheck, test, build) — 2025-03-25
- [ ] `[S]` Set up Vercel project + preview environments for PRs
- [x] `[M]` Create shared UI component library (Button, Input, Card, Badge, Modal, Select, Textarea, Spinner, Label) — 2025-03-25
- [x] `[M]` Build responsive layout shell (Header, Sidebar, BottomNav for mobile) — 2025-03-25
- [x] `[S]` Configure Resend email scaffold + welcome email template — 2025-03-25
- [x] `[M]` Create lib wrappers: WhatsApp, Mercado Pago, AFIP CUIT, Google Maps — 2025-03-25
- [x] `[M]` Create Zod validation schemas for all entities — 2025-03-25
- [x] `[M]` Create utility functions (format ARS, distances, relative time, constants) — 2025-03-25
- [x] `[S]` Security headers (HSTS, CSP, X-Frame-Options) in next.config.mjs — 2025-03-25

### Week 3-4: Core Features

- [x] `[L]` Build load posting system (cargador) — 2025-03-25
  - [x] Load creation form with all fields (origin/dest provinces, cargo/truck types, tarifa, dates, observaciones)
  - [x] Client-side Zod validation with inline error messages
  - [x] POST /api/loads endpoint with server-side validation
  - [x] "Mis Cargas" dashboard with status filter tabs (Todas/Activas/Completadas/Canceladas)
  - [x] Load detail page per carga (/c-mis-cargas/[id]) with applications view
- [x] `[XL]` Build real-time load board (transportista) — 2025-03-25
  - [x] Load feed with Supabase Realtime hook (useRealtimeLoads)
  - [x] Filter by: province, truck type, cargo type + search
  - [x] Sort by: newest, highest rate, lowest weight
  - [x] LoadCard component with route, cargo, price, time, status badge, "NUEVO" indicator
  - [x] LoadFilters component with collapsible mobile panel
  - [x] Load detail page (/t-cargas/[id]) with full info + shipper profile
  - [x] "Aplicar a esta carga" flow with ApplyModal (optional message)
  - [x] Search by origin/destination city
- [x] `[M]` Build application management (cargador view) — 2025-03-25
  - [x] ApplicationCard component with transportista profile + trucks + message
  - [x] Accept/reject buttons with status update
  - [x] PATCH /api/applications/[id] endpoint (accept rejects all others, assigns transportista)
  - [x] Notification creation on accept/reject
- [x] `[M]` Build load status lifecycle — 2025-03-25
  - [x] PATCH /api/loads/[id]/status endpoint with transition validation
  - [x] Valid transitions: publicada→cancelada, aplicada→asignada, asignada→en_camino, en_camino→entregada
  - [x] Status update creates notification for affected party
  - [x] StatusBadge component with Spanish labels + colors
- [x] `[M]` Build API routes for loads CRUD — 2025-03-25
  - [x] GET /api/loads (list with filters, pagination, sorting)
  - [x] POST /api/loads (create with Zod validation + auth)
  - [x] GET /api/loads/[id] (single load with cargador profile)
  - [x] PATCH /api/loads/[id] (update, owner only)
  - [x] DELETE /api/loads/[id] (soft cancel, owner only)
  - [x] GET/POST /api/loads/[id]/applications
  - [x] PATCH /api/applications/[id] (accept/reject)
- [x] `[M]` Build custom hooks — 2025-03-25
  - [x] useLoads (fetch with filters)
  - [x] useRealtimeLoads (Supabase Realtime subscriptions)
  - [x] useLoadStatusUpdate
  - [x] useApplyToLoad
  - [x] useManageApplication
- [x] `[M]` Build Supabase query helpers — 2025-03-25
  - [x] getLoads, getLoadById, getLoadsByUser, createLoad, updateLoadStatus
  - [x] getApplicationsForLoad, createApplication, updateApplicationStatus
  - [x] createNotification helper

### Week 5-6: Integrations (Maps + WhatsApp)

- [ ] `[L]` Google Maps integration
  - [ ] Interactive map view showing all active loads as pins
  - [ ] Pin clustering for zoomed-out views
  - [ ] Click pin → load summary card → "Ver detalle" link
  - [ ] Geocoding: convert city names to lat/lng on load creation
  - [ ] Distance Matrix: calculate and display distance + estimated time between origin/dest
  - [ ] Mobile-optimized map controls
  - [ ] Current location detection + "loads near me" filter
- [ ] `[XL]` WhatsApp Business API integration
  - [ ] Meta Cloud API setup + business account verification
  - [ ] Webhook endpoint for incoming messages + status updates
  - [ ] Message templates (requires Meta approval):
    - [ ] `new_matching_load` — "Nueva carga disponible: {origen} → {destino}, {tarifa} ARS"
    - [ ] `application_accepted` — "Tu solicitud fue aceptada para {ruta}"
    - [ ] `application_rejected` — "Tu solicitud para {ruta} no fue aceptada"
    - [ ] `load_status_update` — "La carga {ruta} cambió a estado: {estado}"
    - [ ] `welcome_message` — "Bienvenido a CarGA! Tu cuenta fue verificada."
  - [ ] Matching engine: when new load posted → find transportistas with matching truck type + zone preferences → send WhatsApp
  - [ ] Opt-in/opt-out management for WhatsApp notifications
  - [ ] Rate limiting (respect Meta's per-user message limits)
  - [ ] Fallback to Firebase FCM if WhatsApp delivery fails

### Week 7-8: Payments + Verification

- [ ] `[L]` Mercado Pago integration
  - [ ] Checkout Pro for subscription payments
  - [ ] Subscription plans for both user types (Básico/Profesional/Flota + Starter/Estándar/Premium)
  - [ ] Webhook endpoint for payment events (approved, pending, rejected, cancelled)
  - [ ] Plan enforcement: free tier limits (3 searches/day, 3 posts/month)
  - [ ] Upgrade/downgrade flow
  - [ ] Payment history page
  - [ ] Handle ARS pricing with USD reference rates
  - [ ] Test mode with Mercado Pago sandbox credentials
- [ ] `[M]` Ratings and reputation system
  - [ ] Post-trip mutual rating (1-5 stars + optional comment)
  - [ ] Rating prompt after load status → "entregada"
  - [ ] Average rating calculation + display on profiles
  - [ ] Rating moderation (admin can remove abusive ratings)
  - [ ] Minimum ratings threshold before score is public
- [ ] `[M]` AFIP CUIT verification
  - [ ] CUIT validation endpoint integration
  - [ ] Verify CUIT format + check against AFIP registry
  - [ ] Display verified badge on profiles
  - [ ] Block load posting/applying without verified CUIT
  - [ ] Handle AFIP API downtime gracefully (queue for retry)

### Week 9: Admin Dashboard

- [ ] `[L]` Admin backoffice
  - [ ] Dashboard overview: active loads, registered users, revenue, new signups
  - [ ] User management: list, search, view detail, suspend/activate, change role
  - [ ] Load management: list, search, view detail, moderate (hide/remove)
  - [ ] CUIT verification queue: pending verifications, approve/reject
  - [ ] Ratings moderation: flagged ratings, remove inappropriate content
  - [ ] Subscription overview: active plans, revenue by plan, churn
  - [ ] Activity logs: all admin actions logged to `admin_logs` table
  - [ ] Export data (CSV) for key metrics

### Week 10-13: QA + Security + Performance

- [ ] `[L]` Comprehensive testing
  - [ ] Unit tests for all lib/ wrappers (Supabase, WhatsApp, Maps, MercadoPago, AFIP)
  - [ ] Integration tests for API routes
  - [ ] Playwright E2E tests for critical flows:
    - [ ] Registration + login (both roles)
    - [ ] Post a load (cargador)
    - [ ] Browse + apply to load (transportista)
    - [ ] Accept application + complete trip
    - [ ] Rate counterparty
    - [ ] Subscribe to paid plan
  - [ ] Mobile viewport testing (375px, 390px, 428px)
  - [ ] Target: 80%+ code coverage
- [ ] `[M]` Security hardening
  - [ ] Audit all RLS policies — penetration test with different roles
  - [ ] Input sanitization on all forms (XSS prevention)
  - [ ] Rate limiting on API routes (prevent scraping)
  - [ ] CSRF protection on mutations
  - [ ] Secure headers (HSTS, CSP, X-Frame-Options)
  - [ ] `npm audit` — resolve all critical/high vulnerabilities
  - [ ] Verify no secrets in git history
  - [ ] Review Supabase Auth security settings
- [ ] `[M]` Performance optimization
  - [ ] Lighthouse audit: LCP < 2.5s, FID < 100ms, CLS < 0.1
  - [ ] Image optimization (next/image, WebP)
  - [ ] Lazy load map components
  - [ ] Database query optimization + add indexes on filtered columns
  - [ ] Implement pagination on all list endpoints
  - [ ] Bundle analysis — ensure no unnecessary client-side JS

### Week 14: Launch

- [ ] `[M]` Pre-launch checklist
  - [ ] All tests passing in CI
  - [ ] Staging environment smoke tested
  - [ ] WhatsApp message templates approved by Meta
  - [ ] Mercado Pago production credentials configured
  - [ ] Sentry + PostHog confirmed working in production
  - [ ] DNS + domain configured
  - [ ] SSL certificate active
  - [ ] Privacy policy + terms of service pages published
  - [ ] CHANGELOG updated for v1.0.0
- [ ] `[M]` Production deployment
  - [ ] Deploy to Vercel production
  - [ ] Run Supabase migrations on production
  - [ ] Verify all webhooks (WhatsApp, Mercado Pago) receiving correctly
  - [ ] Smoke test: register → post load → apply → accept → complete → rate
  - [ ] Monitor error rates for first 24 hours
- [ ] `[L]` Manual onboarding
  - [ ] Onboard first 50 transportistas (Buenos Aires + Córdoba)
  - [ ] Onboard first 20 cargadores
  - [ ] WhatsApp group outreach to informal trucking communities
  - [ ] Gather initial feedback → prioritize quick fixes

---

## 📱 Phase 2 — Growth (Months 4-9)

- [ ] `[XL]` Build native Android app (React Native or Expo)
- [ ] `[L]` Real-time in-app chat between transportista and cargador
- [ ] `[L]` AI freight pricing suggestions (Claude API integration)
  - [ ] Collect historical rate data
  - [ ] Build pricing suggestion prompt engineering
  - [ ] Display "suggested price" on load posting form
- [ ] `[M]` Advanced notification preferences (frequency, types, quiet hours)
- [ ] `[L]` Shipper analytics dashboard (loads posted, fill rate, average time-to-fill)
- [ ] `[M]` CNRT verification (national trucking registry)
- [ ] `[M]` Referral program (invite code → first month free for both parties)
- [ ] `[L]` Public API for integrators + API documentation
- [ ] `[L]` Expand to Santa Fe, Mendoza, Tucumán
- [ ] `[M]` Begin monetization — activate paid plans

---

## 🌎 Phase 3 — Scale (Months 10-18)

- [ ] `[XL]` Build native iOS app
- [ ] `[L]` Insurance marketplace (partner with Argentine freight insurers)
- [ ] `[L]` Electronic invoicing — factura electrónica integration (AFIP)
- [ ] `[XL]` ERP integrations (SAP, Oracle, etc.) for enterprise shippers
- [ ] `[XL]` Regional LATAM expansion — Uruguay, Chile, Paraguay
  - [ ] Localize for each market (currency, tax IDs, regulations)
  - [ ] Local payment processors per country
- [ ] `[L]` Predictive AI pricing engine (ML model trained on CarGA data)
- [ ] `[M]` Advanced financial dashboard for fleet operators
- [ ] `[L]` White-label solution for freight brokers

---

## 🔧 Infrastructure & DevOps (Ongoing)

- [ ] `[M]` Set up staging environment (separate Supabase + Vercel project)
- [ ] `[S]` Automated database backups (Supabase handles, verify schedule)
- [ ] `[S]` Uptime monitoring (Vercel + external like BetterUptime)
- [ ] `[M]` Load testing — simulate 500 concurrent users on load board
- [ ] `[S]` Set up log aggregation (Vercel logs + Supabase logs → single dashboard)
- [ ] `[M]` Disaster recovery plan + documented restore procedure
- [ ] `[S]` Dependency update schedule (weekly audit during active dev)

---

## 📊 Analytics & Monitoring (Ongoing)

- [ ] `[M]` PostHog event tracking plan
  - [ ] `load_posted`, `load_viewed`, `load_applied`, `application_accepted`
  - [ ] `signup_completed`, `plan_upgraded`, `whatsapp_notification_sent`
  - [ ] `map_opened`, `search_executed`, `filter_applied`
- [ ] `[S]` Sentry alert rules (error rate spike, new unhandled exceptions)
- [ ] `[M]` Weekly metrics dashboard (signups, loads posted, fill rate, revenue)
- [ ] `[S]` PostHog feature flags for gradual rollout of new features

---

## 🎨 Design & UX (Ongoing)

- [ ] `[L]` Create Figma design system (components, tokens, pages)
- [ ] `[M]` Design onboarding flow for both user types
- [ ] `[M]` Design empty states for all list views
- [ ] `[S]` Design error states and offline handling
- [ ] `[M]` Usability testing with 5 real Argentine truckers
- [ ] `[S]` Accessibility audit (WCAG 2.1 AA minimum)

---

## 📝 Content & Copy (Ongoing)

- [ ] `[M]` Write all UI copy in Argentine Spanish (es-AR)
- [ ] `[M]` Create WhatsApp message templates (requires Meta approval process)
- [ ] `[M]` Write transactional email templates (welcome, receipt, password reset)
- [ ] `[S]` Write terms of service (Términos y Condiciones)
- [ ] `[S]` Write privacy policy (Política de Privacidad)
- [ ] `[S]` Create FAQ page
- [ ] `[M]` SEO content for landing page (meta tags, structured data, sitemap)

---

## 💼 Business & Legal (Non-Technical)

- [ ] `[M]` Register CarGA trademark in Argentina (INPI)
- [ ] `[S]` Secure domain: carga.com.ar
- [ ] `[M]` WhatsApp Business Account verification (Meta business verification process)
- [ ] `[M]` Mercado Pago merchant account setup + KYC
- [ ] `[S]` Google Maps Platform billing account + API key restrictions
- [ ] `[M]` Legal review of terms of service + privacy policy
- [ ] `[L]` Co-founder agreement finalization (equity, vesting, roles)
- [ ] `[M]` Investor pitch deck final version
- [ ] `[L]` Seed round fundraising (target: USD 20,000-41,640)
- [ ] `[S]` Set up company social media (LinkedIn, Instagram, Twitter/X)

---

*Last updated: 2025-03-24*
