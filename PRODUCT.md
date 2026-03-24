# Product Documentation — CarGA

> La bolsa de cargas digital de Argentina

---

## What is CarGA?

CarGA is a two-sided digital marketplace that connects Argentine truck operators (transportistas) with freight shippers (cargadores) in real time. It replaces the phone calls, WhatsApp groups, and informal broker networks that dominate Argentina's freight coordination today.

### The Problem
- **460,000+ trucks** operate in Argentina — 93% of all domestic freight moves by road
- Truckers find loads through **phone calls and WhatsApp groups** — no structured digital platform
- **Trucks travel empty** 30-40% of the time due to information asymmetry
- **No price transparency** — rates are negotiated ad hoc with no market benchmarks
- **No digital record** — no ratings, no history, no accountability

### The Solution
CarGA provides:
- A **real-time load board** where shippers post loads and carriers find them instantly
- **WhatsApp notifications** when a matching load is posted — meeting truckers where they already are
- An **interactive map** showing available loads geographically
- **CUIT-verified profiles** with ratings and reputation scores
- **Subscription plans** for heavy users who need unlimited access

### Market Opportunity
| Metric | Value |
|--------|-------|
| Active trucks in Argentina | 460,000+ |
| Freight transported by road | 93% of domestic cargo |
| Annual market size | USD 35 billion |
| Dominant digital load board | None |
| Primary competitor | Phone calls + WhatsApp |

---

## User Types

### 1. Transportistas (Carriers)

**Who they are:** Independent truck drivers, small fleet operators (1-10 trucks), and mid-size fleet companies operating in Argentina.

**What they do on CarGA:**
- Browse available loads on the load board
- Filter by: zone/province, truck type, weight range, rate range
- View loads on an interactive map
- Apply to loads with an optional message
- Receive WhatsApp alerts when matching loads are posted
- Build a verified profile with CUIT, truck details, and ratings
- Track completed trips and earnings

**Their pain today:**
- Spend hours calling contacts and checking WhatsApp groups to find loads
- Travel empty between jobs (wasted fuel, time, revenue)
- No way to verify shippers before accepting a load
- No digital record of completed work or ratings

**Subscription plans:**

| Plan | Price | Features |
|------|-------|----------|
| Básico | Free | 3 searches/day, basic profile |
| Profesional | USD 10/mo (ARS 13,500) | Unlimited searches, WhatsApp alerts, verified badge |
| Flota | USD 25/mo (ARS 33,750) | Up to 10 trucks, fleet dashboard, priority support |

### 2. Cargadores (Shippers)

**Who they are:** Agricultural companies, manufacturers, distributors, logistics managers — anyone who needs to move freight regularly across Argentine provinces.

**What they do on CarGA:**
- Post loads with origin, destination, cargo type, weight, truck type required, and rate
- View available carriers (profiles, ratings, truck details)
- Review and accept/reject carrier applications
- Track load status through the delivery lifecycle
- Rate carriers after completed deliveries
- View analytics on their posting activity

**Their pain today:**
- Difficult to find available trucks on short notice
- No centralized platform — rely on broker networks and personal contacts
- No transparency on fair market rates
- No tracking or status updates once cargo is handed off
- No accountability — hard to vet unknown carriers

**Subscription plans:**

| Plan | Price | Features |
|------|-------|----------|
| Starter | Free | 3 posts/month |
| Estándar | USD 15/mo (ARS 20,250) | 20 posts/month, basic analytics |
| Premium | USD 35/mo (ARS 47,250) | Unlimited posts, featured listings, priority support |
| Enterprise | Custom | API access, ERP integration, dedicated account manager |

---

## Core Features — MVP (Phase 1)

### Dual-Role Authentication
- Users register as either **transportista** or **cargador**
- Email + phone authentication via Supabase Auth
- Role-based routing: each role sees a different dashboard, navigation, and feature set
- Admin role for backoffice access

### Real-Time Load Board
- Live feed of all active loads, updated in real time via Supabase Realtime
- Filter by:
  - Province/zone (Buenos Aires, Córdoba, Santa Fe, etc.)
  - Truck type (semirremolque, volcador, frigorífico, etc.)
  - Weight range (toneladas)
  - Rate range (ARS)
- Sort by: newest, closest to current location, highest rate
- Each load card shows: route, distance, cargo type, weight, truck type, price, time posted

### Load Posting (Cargador)
- Form fields: origin, destination (with autocomplete), cargo type, weight (tn), truck type required, rate (ARS), date, notes, "tarifa negociable" toggle
- Draft → publish workflow
- Edit or cancel active loads
- "My Loads" dashboard with status tracking

### Interactive Map
- Google Maps showing all active loads as pins
- Click pin → summary card → "Ver detalle" link
- Pin clustering for zoomed-out views
- Distance + estimated time between origin/destination
- "Loads near me" using browser geolocation

### WhatsApp Notifications
- **Primary notification channel** — truckers live on WhatsApp
- When a new load is posted → matching engine finds transportistas with:
  - Compatible truck type
  - Preferred zone/province
  - Active WhatsApp notifications (Profesional+ plan)
- Sends WhatsApp message via Meta Business API:
  > "Nueva carga: Buenos Aires → Córdoba, Cereales 25tn, $285.000 ARS. Abrí CarGA para ver más."
- Additional notifications: application accepted/rejected, load status changes, welcome message
- Opt-in/opt-out management
- Firebase FCM fallback for push notifications

### Ratings & Reputation
- After a load reaches "entregada" (delivered) status, both parties are prompted to rate
- 1-5 star rating + optional comment
- Average rating displayed on profiles
- Admin moderation for abusive/fake ratings
- Minimum ratings threshold before score is publicly visible

### Mercado Pago Payments
- Subscription billing for all paid plans
- Checkout Pro integration (redirect to Mercado Pago → return)
- Webhook handler for payment events (approved, pending, rejected, cancelled)
- Plan enforcement: free tier limits are server-side enforced
- Upgrade/downgrade flow
- Payment history for users
- All pricing in ARS

### CUIT Verification
- AFIP API integration validates CUIT/CUIL numbers
- Verified badge (✅) displayed on profiles
- Required to post loads or apply to loads
- Handles AFIP downtime gracefully (queue for retry)

### Admin Dashboard
- Overview: active loads, registered users, revenue, signups over time
- User management: list, search, view, suspend, activate, change role
- Load moderation: review flagged loads, hide/remove inappropriate content
- CUIT verification queue: approve/reject pending verifications
- Ratings moderation: review flagged ratings
- Subscription overview: active plans, revenue by plan tier
- Activity audit logs (all admin actions logged)
- CSV export for reporting

---

## Load Status Lifecycle

```
publicada → aplicada → asignada → en_camino → entregada → calificada
```

| Status | Meaning | Who triggers |
|--------|---------|-------------|
| `publicada` | Load is posted and visible | Cargador posts the load |
| `aplicada` | Carrier has applied | Transportista applies |
| `asignada` | Carrier is assigned | Cargador accepts application |
| `en_camino` | Cargo is in transit | Transportista confirms pickup |
| `entregada` | Cargo has been delivered | Either party confirms delivery |
| `calificada` | Both parties have rated | Both submit ratings |
| `cancelada` | Load was cancelled | Cargador cancels |

---

## Database Schema

### Core Tables

| Table | Primary Key | Description |
|-------|------------|-------------|
| `users` | `id` (UUID) | Auth users — email, role (transportista/cargador/admin), created_at |
| `profiles_transportista` | `user_id` (FK) | Nombre, CUIT, teléfono, WhatsApp, rating, total_viajes, verified, plan, habilitaciones |
| `profiles_cargador` | `user_id` (FK) | Empresa, CUIT, contacto, rating, total_cargas, verified, plan |
| `trucks` | `id` (UUID) | transportista_id (FK), tipo, patente, capacidad_tn, marca, modelo, año |
| `loads` | `id` (UUID) | cargador_id (FK), origen (lat/lng/ciudad), destino (lat/lng/ciudad), tipo_carga, peso_tn, tipo_camion_requerido, tarifa_ars, tarifa_negociable, fecha_carga, estado |
| `load_applications` | `id` (UUID) | load_id (FK), transportista_id (FK), mensaje, estado (pendiente/aceptada/rechazada) |
| `ratings` | `id` (UUID) | from_user (FK), to_user (FK), load_id (FK), score (1-5), comentario |
| `notifications` | `id` (UUID) | user_id (FK), tipo, mensaje, leida (boolean) |
| `subscriptions` | `id` (UUID) | user_id (FK), plan, estado, mp_subscription_id |
| `admin_logs` | `id` (UUID) | admin_id (FK), action, entity, entity_id |

### Key Relationships
- A **transportista** has one profile, many trucks, many load_applications, many ratings
- A **cargador** has one profile, many loads, many ratings
- A **load** belongs to one cargador, has many applications, one assigned transportista
- A **rating** connects two users for a specific load

---

## API Endpoints (Planned)

### Loads
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/loads` | List loads (filterable, paginated) |
| GET | `/api/loads/[id]` | Get load detail |
| POST | `/api/loads` | Create a load (cargador only) |
| PATCH | `/api/loads/[id]` | Update load (owner only) |
| DELETE | `/api/loads/[id]` | Cancel load (owner only) |
| POST | `/api/loads/[id]/apply` | Apply to load (transportista only) |

### Applications
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/loads/[id]/applications` | List applications (load owner only) |
| PATCH | `/api/applications/[id]` | Accept/reject application (load owner only) |

### Users / Profiles
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/profile` | Get current user profile |
| PATCH | `/api/profile` | Update current user profile |
| GET | `/api/users/[id]` | Get public profile (rating, verified status) |

### Webhooks
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/webhooks/whatsapp` | WhatsApp message status callbacks |
| POST | `/api/webhooks/mercadopago` | Payment event callbacks |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/users` | List all users (admin only) |
| PATCH | `/api/admin/users/[id]` | Update user role/status (admin only) |
| GET | `/api/admin/loads` | List all loads for moderation |
| GET | `/api/admin/stats` | Dashboard metrics |

---

## Phase 2 Features (Months 4-9)

| Feature | Description |
|---------|-------------|
| **Android App** | Native app (React Native/Expo) for the primary user device |
| **In-App Chat** | Real-time messaging between transportista and cargador |
| **AI Pricing** | Claude API suggests fair rates based on route + cargo + historical data |
| **Shipper Analytics** | Fill rate, avg time-to-fill, rate trends for cargadores |
| **CNRT Verification** | National trucking registry verification for carriers |
| **Referral Program** | Invite code → first month free for referrer and referee |
| **Public API** | REST API for integrators, logistics platforms, ERPs |

## Phase 3 Features (Months 10-18)

| Feature | Description |
|---------|-------------|
| **iOS App** | Native iOS app for iPhone users |
| **Insurance Marketplace** | Partner with Argentine freight insurers for in-app coverage |
| **Factura Electrónica** | AFIP electronic invoicing integration |
| **ERP Integrations** | SAP, Oracle connectors for enterprise shippers |
| **LATAM Expansion** | Uruguay, Chile, Paraguay — localized per market |
| **Predictive AI Pricing** | ML model trained on CarGA historical data |
| **White-Label** | White-label load board for freight brokers |

---

## Financial Projections (Conservative)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| ARR (USD) | $8,400 | $75,000 | $380,000 |
| ARR (ARS at 1,350/USD) | 11.3M | 101.2M | 513M |
| Break-even | — | Mid-Year 2 | — |

### Year 3 Exit Scenarios
| Scenario | Valuation |
|----------|-----------|
| Conservative | USD 1.75M |
| Strong growth | USD 9M |
| Market leader | USD 24M |

**Pre-money valuation:** USD 200,000
**Target raise:** USD 20,000 – 41,640 (seed/angel round)

---

## Launch Strategy

1. **Phase 1 (MVP):** Buenos Aires + Córdoba only
   - Manual onboarding: 50 transportistas + 20 cargadores
   - Fully free during validation period
   - WhatsApp group outreach to existing informal trucking communities

2. **Phase 2 (Growth):** Expand to Santa Fe, Mendoza, Tucumán
   - Activate monetization (paid plans)
   - Begin Android app rollout

3. **Phase 3 (Scale):** National coverage + LATAM expansion
   - Full plan monetization
   - Enterprise contracts
   - iOS launch

---

*This document is the product source of truth. Updated 2025-03-24.*
