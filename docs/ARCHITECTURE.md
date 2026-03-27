# System Architecture

> High-level architecture overview of CarGA, Argentina's first digital load board.

---

## Table of Contents

1. [System Diagram](#system-diagram)
2. [Application Structure](#application-structure)
3. [Route Groups & Prefixes](#route-groups--prefixes)
4. [Server vs Client Components](#server-vs-client-components)
5. [Data Flow](#data-flow)
6. [Middleware Pipeline](#middleware-pipeline)
7. [External Services](#external-services)
8. [Security Layers](#security-layers)
9. [Real-time Architecture](#real-time-architecture)
10. [Database Schema Overview](#database-schema-overview)

---

## System Diagram

```
                              +-------------------+
                              |   Mobile/Desktop   |
                              |     Browser        |
                              +--------+----------+
                                       |
                                       | HTTPS
                                       v
                              +-------------------+
                              |      Vercel        |
                              |   (Edge Network)   |
                              +--------+----------+
                                       |
                                       v
                    +------------------+------------------+
                    |           Next.js 14 App            |
                    |         (App Router / SSR)           |
                    |                                      |
                    |  +------------+  +----------------+  |
                    |  | Middleware  |  | Rate Limiter   |  |
                    |  | (auth +    |  | (in-memory)    |  |
                    |  |  routing)  |  +----------------+  |
                    |  +-----+------+                      |
                    |        |                              |
                    |  +-----v--------------------------+   |
                    |  |        Route Handlers          |   |
                    |  |  /api/loads, /api/admin, ...   |   |
                    |  +-----+--------+--------+-------+   |
                    |        |        |        |           |
                    +--------|--------|--------|----------+
                             |        |        |
              +--------------+   +----+----+   +---------------+
              |                  |         |                   |
              v                  v         v                   v
     +--------+------+  +-------+--+  +---+--------+  +------+--------+
     |   Supabase    |  | WhatsApp |  | Mercado    |  | Google Maps   |
     | (PostgreSQL + |  | Business |  | Pago       |  | Platform      |
     |  Auth +       |  | API      |  | (Payments) |  | (JS + Geocode)|
     |  Realtime +   |  | (Meta)   |  +------------+  +---------------+
     |  Storage)     |  +----------+
     +-------+-------+        ^                +---------------+
             |                 |                |    AFIP       |
             |                 |                | (CUIT Valid.) |
             v                 |                +---------------+
     +-------+-------+        |
     |  PostgreSQL   |        |                +---------------+
     |  10 Tables    |  Webhook callbacks      |    Resend     |
     |  + RLS        |  (status updates)       | (Transac.     |
     |  + Triggers   |                         |  Email)       |
     +---------------+                         +---------------+
```

---

## Application Structure

```
app/
  (auth)/                    # Authentication pages
    iniciar-sesion/          # Login page
    registro/                # Registration page
  (transportista)/           # Carrier dashboard & pages
    t-panel/                 # Dashboard
    t-cargas/                # Browse loads
    t-mapa/                  # Interactive map
    t-perfil/                # Profile management
  (cargador)/                # Shipper dashboard & pages
    c-panel/                 # Dashboard
    c-publicar/              # Post a new load
    c-mis-cargas/            # My loads (manage)
    c-perfil/                # Profile management
  (admin)/                   # Admin dashboard
    a-panel/                 # Admin dashboard
    a-usuarios/              # User management
    a-cargas/                # Load management
    a-reportes/              # Reports
  api/                       # API Route Handlers (17 endpoints)
    loads/                   # Load CRUD + filtering
    applications/            # Application decisions
    ratings/                 # Mutual ratings
    subscriptions/           # Subscription management
    verify-cuit/             # AFIP identity verification
    admin/                   # Admin endpoints (stats, users, loads, logs, export)
    webhooks/                # WhatsApp + Mercado Pago webhooks
    auth/                    # OAuth callback
  layout.tsx                 # Root layout
  page.tsx                   # Landing page (/)
  globals.css                # Tailwind + global styles

lib/
  supabase/                  # Supabase clients (browser, server, middleware)
  security/                  # Rate limiter
  whatsapp/                  # WhatsApp API client
  mercadopago/               # Mercado Pago client
  google-maps/               # Google Maps loader
  afip/                      # CUIT validation
  email/                     # Resend email client
  subscriptions/             # Plan definitions
  contexts/                  # React contexts
  monitoring/                # Error/performance monitoring

components/                  # Shared React components
hooks/                       # Custom React hooks
utils/                       # Validation schemas, formatters, constants
types/                       # TypeScript type definitions
```

---

## Route Groups & Prefixes

Next.js route groups (parenthesized folders) organize pages by user role without affecting the URL path. The actual URL paths use role prefixes to enable middleware-based route protection.

| Route Group | URL Prefix | Role Required | Description |
|-------------|------------|---------------|-------------|
| `(auth)` | `/iniciar-sesion`, `/registro` | None (public) | Authentication pages |
| `(transportista)` | `/t-*` | `transportista` or `admin` | Carrier dashboard, load browsing, map, profile |
| `(cargador)` | `/c-*` | `cargador` or `admin` | Shipper dashboard, load posting, management |
| `(admin)` | `/a-*` | `admin` only | Platform administration |

**Why prefixes instead of nested routes?** Next.js App Router does not support overlapping route groups with the same path segments. Prefixes (`t-`, `c-`, `a-`) avoid conflicts while keeping URLs short and memorable.

### Route Protection Flow

```
User navigates to /t-cargas
        |
        v
  middleware.ts
        |
        +-- Is user authenticated?
        |     NO --> Redirect to /iniciar-sesion?redirect=/t-cargas
        |     YES --+
        |           v
        |     Query users table for role
        |           |
        |     +-----+------+------------+
        |     |            |            |
        |  /t-* route   /c-* route   /a-* route
        |     |            |            |
        |   role ==      role ==      role ==
        |   transportista cargador     admin
        |   or admin?    or admin?     ?
        |     |            |            |
        |   YES: proceed NO: redirect  NO: redirect
        |                to /t-panel   based on role
```

---

## Server vs Client Components

CarGA follows the Next.js 14 App Router conventions for component rendering.

### Server Components (Default)

Used for pages and components that:
- Fetch data from Supabase on the server
- Do not need interactivity or browser APIs
- Benefit from SSR/streaming for performance

**Examples:** Dashboard pages, load detail pages, admin tables.

### Client Components (`"use client"`)

Used for components that:
- Need interactivity (forms, filters, toggles, modals)
- Use React hooks (`useState`, `useEffect`, custom hooks)
- Access browser APIs (geolocation, localStorage)
- Use Supabase Realtime subscriptions

**Examples:** Load filter sidebar, Google Maps component, notification bell, auth forms.

### Pattern

```
Page (Server Component)
  |-- Fetches initial data via createServerSupabaseClient()
  |-- Passes data as props to client components
  |
  +-- InteractiveFilter (Client Component)
  |     |-- Uses useState for filter state
  |     |-- Calls /api/loads with fetch()
  |
  +-- LoadMap (Client Component)
        |-- Uses Google Maps JS API
        |-- Subscribes to Supabase Realtime for live updates
```

---

## Data Flow

### Load Posting to Delivery (Complete Lifecycle)

```
1. CARGADOR posts a load
   POST /api/loads
   |
   v
   Load created with estado: "publicada"
   Supabase Realtime broadcasts to subscribed transportistas

2. TRANSPORTISTA applies
   POST /api/loads/{id}/applications
   |
   v
   Application created (estado: "pendiente")
   Load status changes to "aplicada" (if first application)
   In-app notification sent to cargador
   WhatsApp notification sent to cargador (if enabled)

3. CARGADOR accepts an application
   PATCH /api/applications/{id}  { estado: "aceptada" }
   |
   v
   Application accepted, all others auto-rejected
   Load status -> "asignada", transportista_asignado_id set
   Notification to accepted transportista
   WhatsApp notification to transportista

4. TRANSPORTISTA starts transit
   PATCH /api/loads/{id}/status  { estado: "en_camino" }
   |
   v
   Load status -> "en_camino"
   Notification to cargador

5. Either party marks as delivered
   PATCH /api/loads/{id}/status  { estado: "entregada" }
   |
   v
   Load status -> "entregada"
   Notification to other party
   Rating period opens

6. Both parties rate each other
   POST /api/ratings
   |
   v
   Rating stored, profile average auto-recalculated by DB trigger
   Load status -> "calificada" (when both ratings submitted)
```

### Status State Machine

```
  publicada -----> cancelada
      |
      v
  aplicada ------> cancelada
      |
      v
  asignada
      |
      v
  en_camino
      |
      v
  entregada
      |
      v
  calificada
```

---

## Middleware Pipeline

Every request (except static assets) passes through the middleware pipeline defined in `middleware.ts`.

```
Incoming Request
      |
      v
  1. Extract Client IP
     (X-Forwarded-For or X-Real-IP)
      |
      v
  2. Auth Rate Limiting (POST /iniciar-sesion, /registro only)
     5 attempts / 15 minutes per IP
     |-- Exceeded? --> 429 Response
     |-- OK? --> continue
      |
      v
  3. API Rate Limiting (/api/* except /api/webhooks)
     60 requests / minute per IP
     |-- Exceeded? --> 429 Response
     |-- OK? --> continue
      |
      v
  4. Supabase Session Refresh (updateSession)
     - Reads session cookies from request
     - Calls supabase.auth.getUser() to refresh token
     - Writes updated cookies to response
      |
      v
  5. Route Protection
     - Public routes: allow through
     - Unauthenticated + protected route: redirect to /iniciar-sesion
     - Authenticated + wrong role prefix: redirect to correct dashboard
     - Authenticated + auth pages: redirect to dashboard
      |
      v
  6. Add Rate Limit Headers
     X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
      |
      v
  Route Handler / Page Component
```

### Matcher Configuration

The middleware runs on all routes except:
- `_next/static/*` (static assets)
- `_next/image/*` (image optimization)
- `favicon.ico`
- `landing/*` (public landing assets)
- Image files (`*.svg`, `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.webp`, `*.ico`)

---

## External Services

| Service | Purpose | Integration Point | Auth Method |
|---------|---------|-------------------|-------------|
| **Supabase** | Database, Auth, Realtime, Storage | `lib/supabase/` clients | Anon key (client), Service role key (server) |
| **Google Maps Platform** | Interactive map, geocoding, distance | `lib/google-maps/` loader, client components | API key (browser restricted) |
| **WhatsApp Business API** | Push notifications to users | `lib/whatsapp/` client, webhook handler | Meta API token, Verify token |
| **Mercado Pago** | Subscription payments, checkout | `lib/mercadopago/` client, webhook handler | Access token, public key |
| **AFIP** | CUIT/CUIL identity verification | `lib/afip/` validator | Public API (no auth) |
| **Resend** | Transactional emails | `lib/email/` client | API key |

### Environment Variables Required

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# WhatsApp Business API
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=

# Resend
RESEND_API_KEY=
```

---

## Security Layers

CarGA implements defense in depth with multiple security layers:

### Layer 1: Rate Limiting (Middleware)

```
Rate Limiter (in-memory, per-IP)
  |
  +-- API endpoints:    60 req/min
  +-- Auth endpoints:    5 req/15min (POST only)
  +-- Webhooks:        100 req/min
```

In-memory rate limiter with automatic cleanup of expired entries every 60 seconds. Suitable for single-instance deployment. For multi-instance, replace with Redis-backed limiter.

### Layer 2: Authentication (Supabase Auth + Middleware)

- JWT-based sessions stored in HTTP-only cookies.
- Middleware refreshes tokens on every request.
- Route Handlers verify user identity via `supabase.auth.getUser()`.
- OAuth support (Google) with role assignment.

### Layer 3: Authorization (Middleware + Route Handlers)

- Middleware enforces role-based route protection (`/t-*`, `/c-*`, `/a-*`).
- Route Handlers verify resource ownership (e.g., only load owner can edit).
- Admin endpoints check `role === 'admin'` in the `users` table.

### Layer 4: Row-Level Security (PostgreSQL)

Every Supabase table has RLS enabled. Users can only access data they own or are authorized to see. RLS policies are defined in Supabase migrations and are never disabled.

### Layer 5: Input Validation (Zod)

All API request bodies are validated with Zod schemas before processing:
- `loadSchema` -- load creation
- `applicationSchema` -- application submission
- `ratingSchema` -- rating creation
- `updateLoadSchema` -- load updates
- `statusUpdateSchema` -- status transitions
- `verifyCuitSchema` -- CUIT verification
- `applicationDecisionSchema` -- accept/reject

### Layer 6: CSP Headers

Content Security Policy headers are configured to restrict script sources, frame ancestors, and other vectors. Configured at the Next.js middleware or `next.config.mjs` level.

### Layer 7: Input Sanitization

User inputs are sanitized before database insertion to prevent XSS and injection attacks.

---

## Real-time Architecture

CarGA uses Supabase Realtime (built on PostgreSQL logical replication) to push live updates to connected clients.

### Subscribed Tables

| Table | Events | Use Case |
|-------|--------|----------|
| `loads` | INSERT, UPDATE | New loads appear on map/list, status changes reflect immediately |
| `notifications` | INSERT | Notification bell updates without polling |
| `load_applications` | INSERT, UPDATE | Cargador sees new applications in real time |

### Client-Side Subscription Pattern

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

function useRealtimeLoads(onNewLoad: (load: TLoad) => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('loads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loads',
          filter: 'estado=eq.publicada',
        },
        (payload) => onNewLoad(payload.new as TLoad)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewLoad]);
}
```

### Notification Flow

```
Database trigger fires
        |
        v
Supabase Realtime broadcasts change
        |
        v
Client channel receives payload
        |
        v
React state updates (notification count, load list, etc.)
```

---

## Database Schema Overview

10 tables with RLS enabled on all of them.

```
+------------------+       +---------------------+
|      users       |       | profiles_transportista|
|------------------|       |---------------------|
| id (PK, UUID)    |<----->| user_id (FK)        |
| email            |       | nombre, apellido    |
| role             |       | cuit, telefono      |
| created_at       |       | rating, verified    |
| updated_at       |       | plan, provincia     |
+------------------+       +-----+---------------+
        |                        |
        |                  +-----+-----+
        |                  |   trucks  |
        |                  |-----------|
        |                  | id (PK)   |
        |                  | transportista_id (FK)|
        |                  | tipo, patente       |
        |                  | capacidad_tn        |
        |                  +-------------------+
        |
        |               +---------------------+
        +-------------->| profiles_cargador    |
                        |---------------------|
                        | user_id (FK)        |
                        | empresa, cuit       |
                        | rating, verified    |
                        | plan, provincia     |
                        +-----+---------------+
                              |
                        +-----+-----+
                        |   loads   |
                        |-----------|
                        | id (PK)   |
                        | cargador_id (FK)     |
                        | origen/destino       |
                        | tipo_carga, peso_tn  |
                        | tarifa_ars, estado   |
                        | transportista_asignado_id (FK)|
                        +-----+-----+
                              |
              +---------------+---------------+
              |                               |
     +--------+--------+            +--------+--------+
     |load_applications|            |    ratings      |
     |-----------------|            |-----------------|
     | id (PK)         |            | id (PK)         |
     | load_id (FK)    |            | from_user_id    |
     | transportista_id|            | to_user_id      |
     | estado, mensaje |            | load_id (FK)    |
     +-----------------+            | score, comentario|
                                    +-----------------+

+------------------+     +------------------+     +------------------+
| notifications    |     | subscriptions    |     |   admin_logs     |
|------------------|     |------------------|     |------------------|
| id (PK)          |     | id (PK)          |     | id (PK)          |
| user_id (FK)     |     | user_id (FK)     |     | admin_id (FK)    |
| tipo, titulo     |     | plan, estado     |     | action, entity   |
| mensaje, leida   |     | mp_subscription_id|    | entity_id        |
| metadata         |     | fecha_inicio/fin |     | details          |
+------------------+     +------------------+     +------------------+
```

### Key Relationships

- `users` 1:1 `profiles_transportista` OR `profiles_cargador` (depends on role)
- `profiles_transportista` 1:N `trucks`
- `profiles_cargador` 1:N `loads`
- `loads` 1:N `load_applications`
- `loads` 1:N `ratings`
- `users` 1:N `notifications`
- `users` 1:N `subscriptions`
- `users` (admin) 1:N `admin_logs`

### Database Triggers

- **`handle_new_user`**: On `auth.users` INSERT, creates a row in `users` + the appropriate profile table based on role metadata.
- **Rating average recalculation**: On `ratings` INSERT, updates the `rating` field on the rated user's profile.
