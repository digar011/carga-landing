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
  > ⚠️ **FINTECH NOTE:** Schema must capture payment timing, completion rates, dispute rates, and reliability data from Day 1 — this transaction data feeds the Phase 4 fintech credit scoring model for Fuel Credit and Factoring products. See [Phase 4 — Fintech Expansion](#-phase-4--fintech-expansion-year-2-3) for full data requirements.
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

- [x] `[L]` Google Maps integration — 2025-03-25
  - [x] MapView component: loads Google Maps JS API via script tag, shows markers at load origins
  - [x] Click marker → InfoWindow with route, cargo type, price, "Ver detalle" link
  - [x] "Mi ubicación" button using browser geolocation
  - [x] useGoogleMaps hook for script loading state management
  - [x] Map page (/t-mapa) with server-side load fetch + client-side realtime
  - [x] Side panel (desktop) / bottom sheet (mobile) for selected load details
  - [x] Geocoding helper: geocodeLoadCities with fallback to PROVINCE_CENTERS
  - [x] Distance Matrix integration via calculateDistance
  - [x] Mobile-optimized: full height, responsive controls
  - [x] Graceful fallback when API key not configured
- [x] `[XL]` WhatsApp Business API integration — 2025-03-25
  - [x] Webhook endpoint (GET verification + POST message/status handling)
  - [x] 5 message template builders (carga_nueva, postulacion_aceptada, postulacion_rechazada, estado_carga, bienvenida)
  - [x] Matching engine: findMatchingTransportistas by truck type + province + paid plan
  - [x] notifyMatchingTransportistas: batch send with rate limiting (1 per user per hour)
  - [x] High-level notification helpers: notifyApplicationAccepted/Rejected, notifyLoadStatusChange, sendWelcomeNotification
  - [x] WhatsApp-first with in-app notification fallback
  - [x] Rate limiting via in-memory tracker with automatic cleanup
- [x] `[M]` Mercado Pago webhook scaffold — 2025-03-25
  - [x] POST /api/webhooks/mercadopago endpoint (payment, subscription_preapproval, subscription_authorized_payment)
  - [x] Event logging for monitoring
  - [x] Placeholder handlers for Week 7-8 implementation

### Week 7-8: Payments + Verification

- [x] `[L]` Mercado Pago integration — 2025-03-26
  - [x] Subscription API: GET/POST /api/subscriptions, PATCH /api/subscriptions/[id] (cancel)
  - [x] Plan definitions with 6 plans: basico/profesional/flota (transportista) + starter/estandar/premium (cargador)
  - [x] Plan enforcement: checkPlanLimit() with free tier limits (3 searches/day, 3 posts/month)
  - [x] Pricing pages for both roles: /t-perfil/planes, /c-perfil/planes
  - [x] PlanCard component: name, price, features, "Plan actual" badge, "Más popular" badge
  - [x] PaymentHistory component: date, plan, amount, status badges
  - [x] useSubscription hook: fetch, subscribe (redirect to MP checkout), cancel
  - [x] Webhook handler (from Week 5-6) handles payment + subscription events
- [x] `[M]` Ratings and reputation system — 2025-03-26
  - [x] POST /api/ratings: create rating with Zod validation, load status check
  - [x] GET /api/ratings/[userId]: public ratings with average + total
  - [x] RatingStars component: filled/empty stars, count display
  - [x] RatingForm: 5 clickable stars + optional comment (max 500 chars)
  - [x] RatingModal: wrapped in Modal UI, "Calificá a {userName}" title
  - [x] RatingsList: chronological list of ratings on profiles
  - [x] DB trigger auto-updates average rating on profiles (from migration)
- [x] `[M]` AFIP CUIT verification — 2025-03-26
  - [x] POST /api/verify-cuit: calls AFIP API, updates profile verified status
  - [x] CuitVerification widget: auto-format XX-XXXXXXXX-X, verify button, success/error states
  - [x] Verified badge display (✅) on profiles
  - [x] Updated profile pages with real layouts: avatar, name, verification, plan info
  - [x] Graceful AFIP error handling with retry option

### Week 9: Admin Dashboard

- [x] `[L]` Admin backoffice — 2025-03-26
  - [x] Dashboard overview: StatCard components showing users, loads, subscriptions, new signups
  - [x] GET /api/admin/stats — aggregate counts from all tables
  - [x] User management: AdminTable with search, role filter, suspend/activate/change role actions
  - [x] GET/PATCH /api/admin/users — list with pagination + role/status updates
  - [x] Load management: AdminTable with status filter, cancel/restore actions
  - [x] GET/PATCH /api/admin/loads — list + moderation actions
  - [x] Reports page: subscription overview, CUIT verification queue, ratings moderation
  - [x] Activity logs: GET /api/admin/logs — paginated admin action history
  - [x] CSV export: GET /api/admin/export?type=users|loads|subscriptions
  - [x] Admin components: StatCard, AdminTable (responsive), ActionDropdown
  - [x] All admin actions logged to admin_logs table

### Week 10-13: QA + Security + Performance

- [x] `[L]` Comprehensive testing — 2025-03-26
  - [x] 5 unit test suites (121 tests): format, validations, cuit, plans, constants
  - [x] 9 E2E test suites (125 tests): home, auth, security, navigation, admin, profiles, loads, landing, prototype
  - [x] Mobile viewport testing (375px, 768px, 1280px)
- [x] `[M]` Security hardening — 2025-03-26
  - [x] RateLimiter class: in-memory, configurable max requests + window
  - [x] API rate limiting: 60 req/min per IP on /api/* routes
  - [x] Auth rate limiting: 5 POST attempts per 15 min on auth routes
  - [x] Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After
  - [x] Input sanitization: sanitizeHtml, sanitizeSearchQuery, sanitizeUserInput utilities
  - [x] Secure headers (HSTS, CSP, X-Frame-Options) — verified in E2E tests
  - [x] Secret exposure checks — verified no API keys in client HTML (E2E tests)
- [x] `[M]` Performance optimization — 2025-03-26
  - [x] Loading states: root loading.tsx, load board skeleton, map loading
  - [x] Skeleton component: card, text, avatar, table-row variants with pulse animation
  - [x] Server components by default — client components only where needed
  - [x] All list endpoints support pagination (limit/offset)

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

## 💳 Phase 4 — Fintech Expansion (Year 2-3)

> **Strategic context:** This follows the proven playbook of Frete.com (Brazil, built FretePago as separate fintech entity after marketplace maturity) and BlackBuck (India, built BlackBuck Finserve as separate NBFC after years of marketplace data). Both reached USD 1B+ valuations largely because of their fintech products, not just marketplace software. CarGA's fintech products require a **separate capital raise** (USD 117K-227K) and a **separate BCRA-regulated legal entity** — they are deliberately excluded from the MVP investment ask. The marketplace must first establish 12+ months of transaction history to build the credit scoring models these products depend on.

### Regulatory & Legal Foundation (Start Month 12 — Cannot Wait)

- [ ] `[M]` Research BCRA Circular A 7193 and factoring authorization requirements for fintech SAS in Argentina
- [ ] `[M]` Research BCRA Communication A 6885 (digital lending) and requirements for revolving credit products
- [ ] `[L]` Engage Argentine fintech legal counsel specializing in BCRA-regulated entities (budget: USD 8,000-12,000)
- [ ] `[M]` Map all regulatory requirements: capital minimums, reporting obligations, consumer protection rules under Ley 24.240
- [ ] `[L]` Draft corporate structure: constitute separate SAS (Sociedad por Acciones Simplificada) for fintech operations
  - [ ] Define equity split between marketplace entity and fintech entity
  - [ ] Establish board structure with compliance officer role
  - [ ] Register fintech SAS with IGJ (Inspección General de Justicia)
- [ ] `[L]` File BCRA authorization application for credit facilitation activities
  - [ ] Prepare required documentation: business plan, capital proof, AML/KYC procedures
  - [ ] Submit to BCRA Gerencia de Entidades No Financieras
  - [ ] Budget 6-18 months for approval process
- [ ] `[M]` Design AML/KYC compliance framework per UIF (Unidad de Información Financiera) Resolution 30/2017
  - [ ] Customer due diligence procedures for credit recipients
  - [ ] Suspicious activity reporting (ROS) workflow
  - [ ] Record retention policies (10 years per UIF requirements)
- [ ] `[L]` Develop ARS/USD hedging strategy for working capital float
  - [ ] Research ROFEX (Rosario Futures Exchange) hedging instruments
  - [ ] Evaluate dollar-linked bonds (bonos dólar linked) for float protection
  - [ ] Define maximum currency exposure limits
  - [ ] Establish relationship with FX broker for operational hedging
- [ ] `[M]` Draft standard legal documentation templates
  - [ ] Fuel credit agreement (contrato de crédito para combustible)
  - [ ] Factoring assignment agreement (contrato de cesión de crédito)
  - [ ] General terms and conditions for financial products
  - [ ] Privacy addendum for financial data processing (Ley 25.326 compliance)
- [ ] `[S]` Engage external auditor for annual compliance reviews
- [ ] `[S]` Register with UIF as obligated reporting entity (sujeto obligado)

### Data Infrastructure (Start in MVP — Critical for Credit Scoring)

> These tasks feed into the fintech credit scoring model. The schema and tracking must be built into the MVP from Day 1, even though the fintech products launch in Year 2-3.

- [ ] `[M]` Design `payment_events` table: track when cargador pays for each completed load
  - [ ] Fields: load_id, cargador_id, amount_ars, invoice_date, due_date, paid_date, days_to_pay, payment_method
  - [ ] RLS: cargador reads own, admin reads all
- [ ] `[M]` Design `user_reliability_scores` materialized view
  - [ ] Transportista: completion_rate, on_time_rate, avg_rating, loads_per_month, revenue_per_month, cancellation_rate, dispute_rate
  - [ ] Cargador: avg_days_to_pay, payment_default_rate, avg_load_value, total_loads_posted, dispute_rate
  - [ ] Refresh schedule: daily via pg_cron or Supabase Edge Function
- [ ] `[S]` Add `completed_at` timestamp to loads table for precise delivery timing tracking
- [ ] `[S]` Add `payment_received_at` timestamp to loads table for payment timing per cargador
- [ ] `[M]` Design `disputes` table: track disputes between parties
  - [ ] Fields: load_id, initiated_by, reason, status (abierta/resuelta/escalada), resolution, created_at, resolved_at
  - [ ] Used for both marketplace quality and credit risk assessment
- [ ] `[M]` Build payment timing tracking pipeline
  - [ ] Instrument load completion → payment receipt flow with timestamps
  - [ ] Calculate rolling 90-day average days-to-pay per cargador
  - [ ] Flag cargadores with deteriorating payment patterns
- [ ] `[M]` Build transportista reliability scoring pipeline
  - [ ] Track load acceptance → pickup → delivery timeline
  - [ ] Calculate rolling completion rate (completed / accepted)
  - [ ] Score on-time delivery rate vs. estimated delivery date
  - [ ] Track monthly income consistency (coefficient of variation)
- [ ] `[L]` Set up data warehouse for financial analysis
  - [ ] Evaluate Supabase pg_analytics or external warehouse (BigQuery/Redshift)
  - [ ] Build ETL pipeline: marketplace events → analytics tables
  - [ ] Define data retention policies (financial data: 10 years per BCRA)
- [ ] `[M]` Build route economics dataset
  - [ ] Average tarifa per route (origin_provincia → destino_provincia)
  - [ ] Seasonal patterns by month and cargo type
  - [ ] Rate trend analysis (increasing/decreasing by corridor)
- [ ] `[S]` Add PostHog events for all financial-relevant actions
  - [ ] `load_payment_received`, `payment_overdue`, `dispute_opened`, `dispute_resolved`
  - [ ] `credit_score_calculated`, `reliability_score_updated`

### Fuel Credit Product

> Revolving credit line for transportistas for fuel purchases. CarGA pays the fuel station, transportista repays when they receive load payment. Revenue: 3-5% fee per credit cycle.

- [ ] `[L]` Define fuel credit product specification
  - [ ] Credit limit calculation formula based on: monthly income, completion rate, platform tenure, rating
  - [ ] Repayment terms: net-30 from load payment receipt, automatic deduction
  - [ ] Interest/fee structure: 3-5% per cycle, late payment penalties
  - [ ] Default definition: 60+ days past due
  - [ ] Eligibility criteria: 6+ months on platform, 90%+ completion rate, 4.0+ rating, verified CUIT
- [ ] `[XL]` Build credit scoring model for transportistas
  - [ ] Feature engineering: income_consistency, completion_rate, on_time_rate, platform_tenure_months, avg_rating, dispute_count, cancellation_rate
  - [ ] Train logistic regression model on 12+ months of marketplace data
  - [ ] Define score bands: A (auto-approve), B (manual review), C (decline)
  - [ ] Backtesting framework: simulate model on historical data
  - [ ] Model monitoring: track prediction accuracy monthly
- [ ] `[L]` Build fuel station partnership network
  - [ ] Research YPF, Shell, Axion fuel networks and B2B payment APIs
  - [ ] Negotiate bulk discount agreements (target 2-3% below retail)
  - [ ] Build fuel station payment integration (QR code or virtual card)
  - [ ] Onboard initial 50 fuel stations on BA-Córdoba-Rosario corridor
- [ ] `[L]` Build float management system
  - [ ] Working capital pool tracking (initial target: USD 50,000)
  - [ ] Real-time utilization dashboard (total extended vs. available)
  - [ ] Automated alerts at 70%, 85%, 95% utilization thresholds
  - [ ] Daily reconciliation: credits extended vs. repayments received
- [ ] `[M]` Build credit application and approval flow
  - [ ] Transportista-facing: view available credit, request increase, see repayment schedule
  - [ ] Admin-facing: review applications in Band B, approve/reject with notes
  - [ ] Automated approval for Band A (credit score above threshold)
- [ ] `[M]` Build repayment tracking system
  - [ ] Automatic deduction from load payment when received
  - [ ] Manual repayment option via Mercado Pago
  - [ ] Payment reminder notifications: 7 days before due, on due date, 3 days overdue
  - [ ] Grace period handling (5 business days before penalty)
- [ ] `[L]` Build default and collections process
  - [ ] Automated escalation: overdue → reminder → warning → suspended → collections
  - [ ] Platform access suspension for 60+ day defaults
  - [ ] Integration with Argentine credit bureau (Veraz/Nosis) for reporting defaults
  - [ ] Legal collection letter generation (carta documento)
  - [ ] Write-off policy and provisioning rules per BCRA standards
- [ ] `[M]` Build user-facing credit dashboard
  - [ ] Current balance, available credit, next payment due
  - [ ] Transaction history: fuel purchases, repayments
  - [ ] Credit score indicator (simplified: Excelente/Bueno/Regular)
  - [ ] Repayment calendar with upcoming dates
- [ ] `[S]` Design fuel credit marketing materials
  - [ ] In-app banner for eligible transportistas
  - [ ] WhatsApp notification: "Tenés crédito disponible para combustible"
  - [ ] Onboarding flow explaining terms clearly

### Factoring Product

> Transportista completes a load. Cargador owes payment in 30-60 days. CarGA buys the invoice at 3-5% discount, pays transportista immediately, collects full amount from cargador. Revenue: the spread.

- [ ] `[L]` Define factoring product specification
  - [ ] Discount rate calculation: base rate + risk premium based on cargador payment history
  - [ ] Eligible invoices: loads with status 'entregada', confirmed by both parties
  - [ ] Maximum invoice age for factoring: 7 days from delivery
  - [ ] Minimum/maximum factoring amounts (floor: ARS 50,000, ceiling: ARS 5,000,000)
  - [ ] Recourse vs. non-recourse: start with full recourse (transportista liable if cargador defaults)
- [ ] `[L]` Build invoice verification system
  - [ ] Automated verification: load exists, status confirmed, both parties signed off
  - [ ] Digital signature/confirmation from cargador acknowledging payment obligation
  - [ ] Cross-reference with cargador's payment history and credit score
  - [ ] Fraud detection: flag unusual patterns (same route/amount/parties, rapid submissions)
- [ ] `[XL]` Build cargador creditworthiness assessment
  - [ ] Scoring model: avg_days_to_pay, default_rate, total_volume, platform_tenure, CUIT status, Veraz/Nosis check
  - [ ] Risk tiers: Premium (auto-approve factoring), Standard (manual review), High-risk (decline)
  - [ ] Dynamic credit limits per cargador based on outstanding factored invoices
  - [ ] Concentration risk limits: max exposure per single cargador
- [ ] `[M]` Build discount rate engine
  - [ ] Base rate: 3% (low risk) to 5% (standard risk)
  - [ ] Adjustments: +0.5% per 10 days expected payment delay, -0.5% for Premium tier
  - [ ] Volume discounts: reduce rate by 0.25% for cargadores with 10+ factored loads/month
  - [ ] Real-time rate calculation and display to transportista before acceptance
- [ ] `[L]` Build collections infrastructure for factored invoices
  - [ ] Automated payment reminders to cargador: 7 days, 3 days, due date, overdue
  - [ ] Escalation workflow: reminder → formal notice → carta documento → legal action
  - [ ] Integration with collections agency for 90+ day defaults
  - [ ] Partial payment handling and reconciliation
- [ ] `[M]` Build ARS/USD hedging for factoring float
  - [ ] Daily mark-to-market of outstanding factored receivables in ARS
  - [ ] Automated ROFEX future purchases to hedge USD-denominated working capital
  - [ ] Currency exposure reporting for investors and BCRA
- [ ] `[M]` Build legal documentation generation per transaction
  - [ ] Automated cesión de crédito document with digital signatures
  - [ ] Notification to cargador of assignment (required by Argentine Civil Code art. 1620)
  - [ ] Transaction record storage (10 years per BCRA and UIF requirements)
- [ ] `[M]` Build accounting integration for factoring
  - [ ] Journal entries: invoice purchase, discount income recognition, payment receipt
  - [ ] Monthly P&L for factoring business unit
  - [ ] Provisioning for expected credit losses (IFRS 9 / BCRA Comunicación A 5693)
- [ ] `[M]` Build transportista-facing factoring flow
  - [ ] "Cobrar ahora" button on completed loads
  - [ ] Instant quote: show discount rate, net amount, and expected payment date
  - [ ] One-click acceptance with digital signature
  - [ ] Payment confirmation and receipt generation
- [ ] `[S]` Build cargador-facing factoring notification
  - [ ] Notify cargador when their invoice has been factored
  - [ ] Update payment instructions (pay to CarGA fintech entity, not transportista)
  - [ ] Payment portal for cargador to pay factored invoices

### Fintech Infrastructure

- [ ] `[L]` Build separate payment rails for fintech operations
  - [ ] Dedicated Mercado Pago merchant account for fintech entity
  - [ ] CBU/CVU account setup for direct bank transfers
  - [ ] Integration with DEBIN (Débito Inmediato) for automated collections
  - [ ] Reconciliation engine: match incoming payments to outstanding obligations
- [ ] `[L]` Build float management dashboard (admin)
  - [ ] Real-time view: total working capital, deployed (fuel credit + factoring), available
  - [ ] Daily cash flow forecast: expected repayments vs. expected disbursements
  - [ ] Utilization trending: weekly, monthly, quarterly views
  - [ ] Alert system: low float, concentration risk, currency exposure
- [ ] `[L]` Build risk monitoring system
  - [ ] Portfolio overview: total exposure by product, by user, by geography
  - [ ] Delinquency tracking: 30/60/90 day buckets
  - [ ] Watch list: users with deteriorating scores or payment patterns
  - [ ] Stress testing: model portfolio performance under adverse scenarios (e.g., 20% default rate)
- [ ] `[M]` Build regulatory reporting system
  - [ ] Monthly BCRA reports: outstanding credit, delinquency rates, capital adequacy
  - [ ] UIF suspicious activity reports (ROS) generation workflow
  - [ ] Annual external audit data package preparation
  - [ ] Ad-hoc regulatory query response capability
- [ ] `[M]` Build comprehensive audit trail for financial transactions
  - [ ] Immutable event log: every credit decision, disbursement, payment, adjustment
  - [ ] User action tracking: who approved, when, with what data
  - [ ] Data export for external auditors (CSV, PDF reports)
- [ ] `[L]` Build fraud detection system
  - [ ] Velocity checks: multiple applications from same device/IP/CUIT
  - [ ] Collusion detection: related parties creating fake loads for credit extraction
  - [ ] Amount anomaly detection: invoices significantly above route averages
  - [ ] Real-time blocking with manual review queue
- [ ] `[M]` Build enhanced KYC/AML for financial products
  - [ ] Identity verification beyond CUIT: DNI photo match, proof of address
  - [ ] PEP (Politically Exposed Person) screening against UIF database
  - [ ] Sanctions list screening (ONU, OFAC)
  - [ ] Ongoing monitoring: re-verify KYC annually

### Working Capital Raise (Year 2)

- [ ] `[M]` Build investor deck for fintech round
  - [ ] Marketplace traction metrics: loads/month, GMV, user growth
  - [ ] Credit scoring model performance: prediction accuracy, default rates from pilot
  - [ ] Unit economics: revenue per credit cycle, cost of capital, net interest margin
  - [ ] Competitive analysis: Frete.com FretePago, BlackBuck Finserve precedents
  - [ ] Use of funds breakdown: working capital float, development, legal, reserves
- [ ] `[L]` Build financial model for credit/factoring business
  - [ ] Revenue projections: load volume × factoring penetration × discount rate
  - [ ] Credit loss projections based on scoring model and historical data
  - [ ] Working capital requirements by month (ramp-up curve)
  - [ ] Break-even analysis for fintech unit
  - [ ] Sensitivity analysis: default rate, interest rate, ARS/USD scenarios
- [ ] `[M]` Prepare due diligence data room
  - [ ] Marketplace financial statements (Year 1)
  - [ ] BCRA authorization documentation
  - [ ] Fintech entity corporate documents
  - [ ] Credit scoring model documentation and backtesting results
  - [ ] Sample loan/factoring agreements
  - [ ] Technology architecture documentation for fintech systems
- [ ] `[M]` BCRA approval documentation package for investors
  - [ ] Current application status and expected timeline
  - [ ] Compliance framework documentation
  - [ ] Capital adequacy projections post-funding
  - [ ] Regulatory risk assessment and mitigation plan
- [ ] `[L]` Execute fintech working capital raise (target: USD 75,000-150,000)
  - [ ] Identify fintech-focused investors in Argentina (Kaszek, Mundi, Copernico)
  - [ ] Present at fintech-specific events (Finnosummit LATAM, Argentina Fintech Forum)
  - [ ] Negotiate terms: convertible note vs. priced equity vs. revenue-based financing
  - [ ] Close round and deploy capital to float management accounts

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

*Last updated: 2025-03-26*
