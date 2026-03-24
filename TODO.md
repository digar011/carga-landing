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

- [ ] `[M]` Initialize Next.js 14 project with App Router + TypeScript strict mode
- [ ] `[S]` Configure Tailwind CSS with CarGA design tokens (navy, gold, grays)
- [ ] `[S]` Set up pnpm workspace + Makefile with standard targets
- [ ] `[M]` Create Supabase project + configure local development with Supabase CLI
- [ ] `[L]` Design and create all database tables with migrations
  - [ ] `users` table (id, email, role, created_at)
  - [ ] `profiles_transportista` (user_id, nombre, cuit, telefono, whatsapp, rating, total_viajes, verified, plan, habilitaciones)
  - [ ] `profiles_cargador` (user_id, empresa, cuit, contacto, rating, total_cargas, verified, plan)
  - [ ] `trucks` (id, transportista_id, tipo, patente, capacidad_tn, marca, modelo, año)
  - [ ] `loads` (id, cargador_id, origen_lat/lng/ciudad, destino_lat/lng/ciudad, tipo_carga, peso_tn, tipo_camion_requerido, tarifa_ars, tarifa_negociable, fecha_carga, estado, created_at)
  - [ ] `load_applications` (id, load_id, transportista_id, mensaje, estado, created_at)
  - [ ] `ratings` (id, from_user, to_user, load_id, score, comentario, created_at)
  - [ ] `notifications` (id, user_id, tipo, mensaje, leida, created_at)
  - [ ] `subscriptions` (id, user_id, plan, estado, mp_subscription_id, created_at)
  - [ ] `admin_logs` (id, admin_id, action, entity, entity_id, created_at)
- [ ] `[M]` Write RLS policies for all tables (role-based access: transportista, cargador, admin)
- [ ] `[L]` Implement dual-role auth system
  - [ ] Supabase Auth configuration (email + phone)
  - [ ] Registration flow: role selection (transportista/cargador)
  - [ ] Login flow with role-based redirect
  - [ ] Protected route middleware per role group
  - [ ] Session management + refresh token handling
- [ ] `[M]` Create seed.sql with realistic Argentine test data (50 loads, 20 transportistas, 10 cargadores)
- [ ] `[S]` Set up Sentry error monitoring for Next.js (server + client)
- [ ] `[S]` Set up PostHog analytics + initial event tracking
- [ ] `[M]` Configure CI/CD pipeline (GitHub Actions: lint, typecheck, test, build)
- [ ] `[S]` Set up Vercel project + preview environments for PRs
- [ ] `[M]` Create shared UI component library (Button, Input, Card, Badge, Modal, Select)
- [ ] `[M]` Build responsive layout shell (Header, Sidebar, BottomNav for mobile)
- [ ] `[S]` Configure Resend for transactional emails (welcome, password reset)

### Week 3-4: Core Features

- [ ] `[L]` Build load posting system (cargador)
  - [ ] Load creation form (origin, destination, cargo type, weight, truck type, rate, date, notes)
  - [ ] Address autocomplete with Google Places API
  - [ ] Form validation (Zod schema)
  - [ ] Draft/publish workflow
  - [ ] Load editing + cancellation
  - [ ] "My loads" dashboard with status tracking (activa/asignada/completada/cancelada)
- [ ] `[XL]` Build real-time load board (transportista)
  - [ ] Load feed with live updates via Supabase Realtime
  - [ ] Filter by: zone/province, truck type, weight range, rate range
  - [ ] Sort by: newest, closest, highest rate
  - [ ] Load card component with route, cargo, price, posted time
  - [ ] Load detail page with full info + shipper profile
  - [ ] "Apply to load" flow with optional message
  - [ ] Search by origin/destination city
- [ ] `[M]` Build application management (cargador view)
  - [ ] View applications for each posted load
  - [ ] Carrier profile preview (rating, CUIT, truck info)
  - [ ] Accept/reject application flow
  - [ ] Notification to carrier on accept/reject
- [ ] `[M]` Build load status lifecycle
  - [ ] Status flow: publicada → aplicada → asignada → en_camino → entregada → calificada
  - [ ] Status update triggers (notifications, UI updates)
  - [ ] Completion confirmation from both parties

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
