# Database Documentation

> **Project:** CarGA — Argentina's first digital load board
> **Database:** Supabase (PostgreSQL 15)
> **Last updated:** 2026-03-26

---

## Overview

CarGA uses Supabase as its database and backend-as-a-service layer. The database consists of 10 core tables, 8 custom enums, 6 triggers, 3 helper functions, and comprehensive Row Level Security (RLS) policies on every table. Realtime subscriptions are enabled on 3 tables for live updates.

---

## Custom Enums

### `user_role`
Defines the type of user account.

| Value | Description |
|-------|-------------|
| `transportista` | Truck operator / carrier |
| `cargador` | Freight shipper |
| `admin` | Platform administrator |

### `load_status`
Lifecycle status of a load posting.

| Value | Description |
|-------|-------------|
| `publicada` | Published and visible on the load board |
| `aplicada` | At least one carrier has applied |
| `asignada` | Assigned to a specific carrier |
| `en_camino` | In transit |
| `entregada` | Delivered |
| `calificada` | Both parties have rated the transaction |
| `cancelada` | Cancelled by the shipper or admin |

### `application_status`
Status of a carrier's application to a load.

| Value | Description |
|-------|-------------|
| `pendiente` | Awaiting review by the shipper |
| `aceptada` | Accepted — carrier is assigned |
| `rechazada` | Rejected |

### `truck_type`
Types of trucks available in the Argentine freight market.

| Value | Description |
|-------|-------------|
| `semirremolque` | Semi-trailer |
| `volcador` | Dump truck |
| `frigorifico` | Refrigerated truck |
| `chasis` | Chassis truck |
| `carrozado` | Box truck |
| `tanque` | Tank truck |
| `portacontenedor` | Container carrier |
| `batea` | Flatbed trailer |

### `cargo_type`
Categories of freight.

| Value | Description |
|-------|-------------|
| `cereales` | Grains |
| `alimentos` | Food products |
| `maquinaria` | Machinery |
| `materiales_construccion` | Construction materials |
| `productos_quimicos` | Chemical products |
| `vehiculos` | Vehicles |
| `ganado` | Livestock |
| `general` | General cargo |
| `refrigerados` | Refrigerated goods |
| `peligrosos` | Hazardous materials |

### `plan_type`
Subscription plan tiers.

| Value | Description |
|-------|-------------|
| `basico` | Free tier for transportistas |
| `profesional` | Paid tier for transportistas |
| `flota` | Fleet tier for transportistas |
| `starter` | Free tier for cargadores |
| `estandar` | Paid tier for cargadores |
| `premium` | Premium tier for cargadores |
| `enterprise` | Enterprise tier for cargadores |

### `notification_type`
Types of in-app notifications.

| Value | Description |
|-------|-------------|
| `nueva_carga` | New load matching carrier preferences |
| `aplicacion_recibida` | Shipper received a new application |
| `aplicacion_aceptada` | Carrier's application was accepted |
| `aplicacion_rechazada` | Carrier's application was rejected |
| `estado_carga` | Load status changed |
| `nueva_calificacion` | New rating received |
| `sistema` | System notification |

### `subscription_status`
Subscription lifecycle status.

| Value | Description |
|-------|-------------|
| `activa` | Active and paid |
| `cancelada` | Cancelled by user |
| `vencida` | Expired |
| `pendiente` | Payment pending |

---

## Schema Diagram (ERD)

```
┌─────────────────────┐
│     auth.users       │  (Supabase Auth — managed)
│  id (UUID, PK)       │
│  email               │
│  encrypted_password   │
│  raw_user_meta_data   │
└──────────┬───────────┘
           │ 1:1 (ON DELETE CASCADE)
           ▼
┌─────────────────────┐       ┌──────────────────────────┐
│       users          │       │       admin_logs          │
│  id (UUID, PK, FK)   │◄──────│  admin_id (FK → users)   │
│  email               │       │  action                  │
│  role (user_role)     │       │  entity                  │
│  created_at           │       │  entity_id               │
│  updated_at           │       │  details (JSONB)         │
└──────────┬───────────┘       │  created_at              │
           │                    └──────────────────────────┘
           │ 1:1
     ┌─────┴──────┐
     │            │
     ▼            ▼
┌────────────────────────┐  ┌────────────────────────┐
│ profiles_transportista  │  │  profiles_cargador      │
│ id (UUID, PK)           │  │  id (UUID, PK)          │
│ user_id (FK → users)    │  │  user_id (FK → users)   │
│ nombre, apellido        │  │  empresa                │
│ cuit (UNIQUE)           │  │  cuit (UNIQUE)          │
│ telefono, whatsapp      │  │  contacto_nombre        │
│ provincia, ciudad       │  │  contacto_telefono      │
│ rating, total_viajes    │  │  contacto_email         │
│ verified, plan          │  │  provincia, ciudad      │
│ habilitaciones (TEXT[]) │  │  rating, total_cargas   │
│ whatsapp_notifications  │  │  verified, plan         │
│ avatar_url              │  │  avatar_url             │
│ created_at, updated_at  │  │  created_at, updated_at │
└──────────┬─────────────┘  └──────────┬─────────────┘
           │                            │
           │ 1:N                        │ 1:N
           ▼                            ▼
┌─────────────────────┐      ┌─────────────────────────────┐
│       trucks         │      │          loads               │
│ id (UUID, PK)        │      │  id (UUID, PK)              │
│ transportista_id(FK) │      │  cargador_id (FK → p_carg)  │
│ tipo (truck_type)    │      │  origen_lat/lng/ciudad/prov  │
│ patente (UNIQUE)     │      │  destino_lat/lng/ciudad/prov │
│ capacidad_tn         │      │  distancia_km               │
│ marca, modelo, anio  │      │  tipo_carga (cargo_type)    │
│ activo               │      │  descripcion_carga          │
│ created_at           │      │  peso_tn                    │
└──────────────────────┘      │  tipo_camion_requerido      │
                              │  tarifa_ars                 │
           ┌──────────────────│  tarifa_negociable          │
           │                  │  fecha_carga, fecha_entrega │
           │                  │  observaciones              │
           │                  │  estado (load_status)       │
           │                  │  transportista_asignado_id  │
           │                  │  created_at, updated_at     │
           │                  └──────────┬──────────────────┘
           │                             │
           │                    ┌────────┴────────┐
           │                    │                 │
           │                    ▼                 ▼
           │       ┌─────────────────────┐  ┌──────────────────┐
           │       │  load_applications   │  │     ratings       │
           │       │  id (UUID, PK)       │  │  id (UUID, PK)   │
           └──────►│  load_id (FK)        │  │  from_user_id(FK)│
                   │  transportista_id(FK)│  │  to_user_id (FK) │
                   │  mensaje             │  │  load_id (FK)    │
                   │  estado (app_status) │  │  score (1-5)     │
                   │  created_at          │  │  comentario      │
                   │  updated_at          │  │  created_at      │
                   └──────────────────────┘  └──────────────────┘

┌──────────────────────────┐  ┌─────────────────────────────┐
│      notifications        │  │       subscriptions          │
│  id (UUID, PK)            │  │  id (UUID, PK)              │
│  user_id (FK → users)     │  │  user_id (FK → users, UQ)  │
│  tipo (notification_type) │  │  plan (plan_type)           │
│  titulo                   │  │  estado (subscription_stat) │
│  mensaje                  │  │  mp_subscription_id         │
│  leida (BOOLEAN)          │  │  fecha_inicio               │
│  metadata (JSONB)         │  │  fecha_fin                  │
│  created_at               │  │  created_at, updated_at     │
└───────────────────────────┘  └─────────────────────────────┘
```

---

## Tables Detail

### `users`

Links Supabase Auth to application-level user data.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, FK → auth.users ON DELETE CASCADE |
| `email` | TEXT | NOT NULL, UNIQUE |
| `role` | user_role | NOT NULL, DEFAULT 'transportista' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `profiles_transportista`

Carrier profile with business and verification details.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → users ON DELETE CASCADE |
| `nombre` | TEXT | NOT NULL |
| `apellido` | TEXT | NOT NULL |
| `cuit` | TEXT | UNIQUE, CHECK regex `^\d{2}-\d{8}-\d{1}$` |
| `telefono` | TEXT | NOT NULL |
| `whatsapp` | TEXT | |
| `provincia` | TEXT | NOT NULL |
| `ciudad` | TEXT | NOT NULL |
| `rating` | NUMERIC(3,2) | NOT NULL, DEFAULT 0 |
| `total_viajes` | INT | NOT NULL, DEFAULT 0 |
| `verified` | BOOLEAN | NOT NULL, DEFAULT false |
| `plan` | plan_type | NOT NULL, DEFAULT 'basico' |
| `habilitaciones` | TEXT[] | DEFAULT '{}' |
| `whatsapp_notifications` | BOOLEAN | NOT NULL, DEFAULT true |
| `avatar_url` | TEXT | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `profiles_cargador`

Shipper/company profile.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → users ON DELETE CASCADE |
| `empresa` | TEXT | NOT NULL |
| `cuit` | TEXT | UNIQUE, CHECK regex `^\d{2}-\d{8}-\d{1}$` |
| `contacto_nombre` | TEXT | NOT NULL |
| `contacto_telefono` | TEXT | NOT NULL |
| `contacto_email` | TEXT | NOT NULL |
| `provincia` | TEXT | NOT NULL |
| `ciudad` | TEXT | NOT NULL |
| `rating` | NUMERIC(3,2) | NOT NULL, DEFAULT 0 |
| `total_cargas` | INT | NOT NULL, DEFAULT 0 |
| `verified` | BOOLEAN | NOT NULL, DEFAULT false |
| `plan` | plan_type | NOT NULL, DEFAULT 'starter' |
| `avatar_url` | TEXT | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `trucks`

Vehicle fleet linked to carrier profiles.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `transportista_id` | UUID | NOT NULL, FK → profiles_transportista ON DELETE CASCADE |
| `tipo` | truck_type | NOT NULL |
| `patente` | TEXT | NOT NULL, UNIQUE, CHECK: old format `^[A-Z]{3}\d{3}$` or new format `^[A-Z]{2}\d{3}[A-Z]{2}$` |
| `capacidad_tn` | NUMERIC | NOT NULL, CHECK > 0 |
| `marca` | TEXT | NOT NULL |
| `modelo` | TEXT | NOT NULL |
| `anio` | INT | NOT NULL |
| `activo` | BOOLEAN | NOT NULL, DEFAULT true |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `loads`

Core table for freight load postings.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `cargador_id` | UUID | NOT NULL, FK → profiles_cargador ON DELETE CASCADE |
| `origen_lat` | DOUBLE PRECISION | NOT NULL |
| `origen_lng` | DOUBLE PRECISION | NOT NULL |
| `origen_ciudad` | TEXT | NOT NULL |
| `origen_provincia` | TEXT | NOT NULL |
| `destino_lat` | DOUBLE PRECISION | NOT NULL |
| `destino_lng` | DOUBLE PRECISION | NOT NULL |
| `destino_ciudad` | TEXT | NOT NULL |
| `destino_provincia` | TEXT | NOT NULL |
| `distancia_km` | NUMERIC | |
| `tipo_carga` | cargo_type | NOT NULL |
| `descripcion_carga` | TEXT | NOT NULL |
| `peso_tn` | NUMERIC | NOT NULL, CHECK > 0 |
| `tipo_camion_requerido` | truck_type | NOT NULL |
| `tarifa_ars` | NUMERIC | NOT NULL, CHECK > 0 |
| `tarifa_negociable` | BOOLEAN | NOT NULL, DEFAULT false |
| `fecha_carga` | TIMESTAMPTZ | NOT NULL |
| `fecha_entrega` | TIMESTAMPTZ | |
| `observaciones` | TEXT | |
| `estado` | load_status | NOT NULL, DEFAULT 'publicada' |
| `transportista_asignado_id` | UUID | FK → profiles_transportista ON DELETE SET NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `load_applications`

Tracks carrier applications to loads.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `load_id` | UUID | NOT NULL, FK → loads ON DELETE CASCADE |
| `transportista_id` | UUID | NOT NULL, FK → profiles_transportista ON DELETE CASCADE |
| `mensaje` | TEXT | |
| `estado` | application_status | NOT NULL, DEFAULT 'pendiente' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**UNIQUE constraint:** `(load_id, transportista_id)` — one application per carrier per load.

### `ratings`

User-to-user ratings tied to completed loads.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `from_user_id` | UUID | NOT NULL, FK → users ON DELETE CASCADE |
| `to_user_id` | UUID | NOT NULL, FK → users ON DELETE CASCADE |
| `load_id` | UUID | NOT NULL, FK → loads ON DELETE CASCADE |
| `score` | INT | NOT NULL, CHECK >= 1 AND <= 5 |
| `comentario` | TEXT | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**UNIQUE constraint:** `(from_user_id, load_id)` — one rating per user per load.

### `notifications`

In-app notification system.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, FK → users ON DELETE CASCADE |
| `tipo` | notification_type | NOT NULL |
| `titulo` | TEXT | NOT NULL |
| `mensaje` | TEXT | NOT NULL |
| `leida` | BOOLEAN | NOT NULL, DEFAULT false |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `subscriptions`

Subscription and plan management with MercadoPago integration.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → users ON DELETE CASCADE |
| `plan` | plan_type | NOT NULL |
| `estado` | subscription_status | NOT NULL, DEFAULT 'pendiente' |
| `mp_subscription_id` | TEXT | |
| `fecha_inicio` | TIMESTAMPTZ | NOT NULL |
| `fecha_fin` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `admin_logs`

Audit log for administrative actions.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `admin_id` | UUID | NOT NULL, FK → users ON DELETE CASCADE |
| `action` | TEXT | NOT NULL |
| `entity` | TEXT | NOT NULL |
| `entity_id` | TEXT | NOT NULL |
| `details` | JSONB | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

---

## Key Constraints

| Constraint | Table | Type | Description |
|------------|-------|------|-------------|
| CUIT format (transportista) | `profiles_transportista` | CHECK | Must match `^\d{2}-\d{8}-\d{1}$` |
| CUIT format (cargador) | `profiles_cargador` | CHECK | Must match `^\d{2}-\d{8}-\d{1}$` |
| CUIT uniqueness (transportista) | `profiles_transportista` | UNIQUE | No duplicate CUITs |
| CUIT uniqueness (cargador) | `profiles_cargador` | UNIQUE | No duplicate CUITs |
| Patente format | `trucks` | CHECK | Old: `^[A-Z]{3}\d{3}$`, New: `^[A-Z]{2}\d{3}[A-Z]{2}$` |
| Patente uniqueness | `trucks` | UNIQUE | No duplicate license plates |
| One application per load | `load_applications` | UNIQUE | `(load_id, transportista_id)` |
| One rating per load per user | `ratings` | UNIQUE | `(from_user_id, load_id)` |
| One subscription per user | `subscriptions` | UNIQUE | `user_id` |
| Positive weight | `loads` | CHECK | `peso_tn > 0` |
| Positive rate | `loads` | CHECK | `tarifa_ars > 0` |
| Positive capacity | `trucks` | CHECK | `capacidad_tn > 0` |
| Rating range | `ratings` | CHECK | `score >= 1 AND score <= 5` |

---

## Indexes

### Base Table Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `idx_users_role` | users | role | Filter users by role for admin queries |
| `idx_profiles_transportista_user_id` | profiles_transportista | user_id | FK lookup |
| `idx_profiles_transportista_provincia` | profiles_transportista | provincia | Filter carriers by province |
| `idx_profiles_transportista_verified` | profiles_transportista | verified | Filter verified carriers |
| `idx_profiles_cargador_user_id` | profiles_cargador | user_id | FK lookup |
| `idx_profiles_cargador_provincia` | profiles_cargador | provincia | Filter shippers by province |
| `idx_profiles_cargador_verified` | profiles_cargador | verified | Filter verified shippers |
| `idx_trucks_transportista_id` | trucks | transportista_id | FK lookup, carrier fleet queries |
| `idx_trucks_tipo` | trucks | tipo | Filter by truck type |
| `idx_trucks_activo` | trucks | activo | Filter active trucks |
| `idx_loads_cargador_id` | loads | cargador_id | FK lookup, shipper's loads |
| `idx_loads_estado` | loads | estado | Filter by load status |
| `idx_loads_tipo_camion_requerido` | loads | tipo_camion_requerido | Filter by required truck type |
| `idx_loads_origen_provincia` | loads | origen_provincia | Filter by origin province |
| `idx_loads_destino_provincia` | loads | destino_provincia | Filter by destination province |
| `idx_loads_created_at` | loads | created_at DESC | Sort by newest first |
| `idx_loads_transportista_asignado` | loads | transportista_asignado_id | FK lookup, assigned loads |
| `idx_load_applications_load_id` | load_applications | load_id | FK lookup |
| `idx_load_applications_transportista_id` | load_applications | transportista_id | FK lookup |
| `idx_ratings_from_user_id` | ratings | from_user_id | FK lookup |
| `idx_ratings_to_user_id` | ratings | to_user_id | FK lookup |
| `idx_ratings_load_id` | ratings | load_id | FK lookup |
| `idx_notifications_user_id` | notifications | user_id | FK lookup |
| `idx_notifications_leida` | notifications | leida | Filter unread |
| `idx_notifications_created_at` | notifications | created_at DESC | Sort by newest |
| `idx_notifications_user_unread` | notifications | (user_id, leida) WHERE leida = false | Partial index for unread count |
| `idx_subscriptions_user_id` | subscriptions | user_id | FK lookup |
| `idx_subscriptions_estado` | subscriptions | estado | Filter by status |
| `idx_subscriptions_mp_subscription_id` | subscriptions | mp_subscription_id | MercadoPago webhook lookup |
| `idx_admin_logs_admin_id` | admin_logs | admin_id | FK lookup |
| `idx_admin_logs_entity` | admin_logs | entity | Filter by entity type |
| `idx_admin_logs_created_at` | admin_logs | created_at DESC | Sort by newest |

### Production Performance Indexes

| Index | Table | Columns | Type | Purpose |
|-------|-------|---------|------|---------|
| `idx_loads_board_query` | loads | (estado, created_at DESC) WHERE estado = 'publicada' | Partial | Main load board query |
| `idx_loads_province_truck` | loads | (origen_provincia, tipo_camion_requerido) WHERE estado = 'publicada' | Partial composite | Load board filter combo |
| `idx_loads_origen_ciudad_trgm` | loads | origen_ciudad | GIN (trigram) | Fuzzy city search |
| `idx_loads_destino_ciudad_trgm` | loads | destino_ciudad | GIN (trigram) | Fuzzy city search |
| `idx_applications_pending` | load_applications | load_id WHERE estado = 'pendiente' | Partial | Pending applications count |
| `idx_subscriptions_active` | subscriptions | user_id WHERE estado = 'activa' | Partial | Active subscription lookup |

**Extension:** `pg_trgm` is enabled for trigram-based fuzzy search on city names.

---

## Triggers

### `on_auth_user_created`
- **Fires:** AFTER INSERT on `auth.users`
- **Function:** `handle_new_user()`
- **Purpose:** Auto-creates a row in `users` when a new auth user registers. Reads the `role` from `raw_user_meta_data`, defaulting to `transportista`.

### `users_updated_at`
- **Fires:** BEFORE UPDATE on `users`
- **Function:** `update_updated_at()`
- **Purpose:** Sets `updated_at = NOW()` on every update.

### `profiles_transportista_updated_at`
- **Fires:** BEFORE UPDATE on `profiles_transportista`
- **Function:** `update_updated_at()`
- **Purpose:** Sets `updated_at = NOW()` on every update.

### `profiles_cargador_updated_at`
- **Fires:** BEFORE UPDATE on `profiles_cargador`
- **Function:** `update_updated_at()`
- **Purpose:** Sets `updated_at = NOW()` on every update.

### `loads_updated_at`
- **Fires:** BEFORE UPDATE on `loads`
- **Function:** `update_updated_at()`
- **Purpose:** Sets `updated_at = NOW()` on every update.

### `load_applications_updated_at`
- **Fires:** BEFORE UPDATE on `load_applications`
- **Function:** `update_updated_at()`
- **Purpose:** Sets `updated_at = NOW()` on every update.

### `subscriptions_updated_at`
- **Fires:** BEFORE UPDATE on `subscriptions`
- **Function:** `update_updated_at()`
- **Purpose:** Sets `updated_at = NOW()` on every update.

### `ratings_update_transportista_avg`
- **Fires:** AFTER INSERT on `ratings`
- **Function:** `update_transportista_rating()`
- **Purpose:** Recalculates `profiles_transportista.rating` and `total_viajes` when a new rating is given to a carrier.

### `ratings_update_cargador_avg`
- **Fires:** AFTER INSERT on `ratings`
- **Function:** `update_cargador_rating()`
- **Purpose:** Recalculates `profiles_cargador.rating` and `total_cargas` when a new rating is given to a shipper.

### `prevent_self_application`
- **Fires:** BEFORE INSERT on `load_applications`
- **Function:** `check_no_self_application()`
- **Purpose:** Prevents a user from applying to their own load (cross-checks via profiles).

### `check_rating_before_insert`
- **Fires:** BEFORE INSERT on `ratings`
- **Function:** `check_rating_eligibility()`
- **Purpose:** Ensures the load is in `entregada` or `calificada` status before allowing a rating. Also prevents self-rating.

---

## Helper Functions

### `count_user_loads_this_month(p_user_id UUID) → INT`
Returns the count of loads posted by a user in the current calendar month. Used for free tier enforcement (limiting the number of monthly postings on the `basico`/`starter` plan).

### `get_user_plan(p_user_id UUID) → plan_type`
Returns the user's current plan by checking both `profiles_transportista` and `profiles_cargador` tables. Defaults to `basico` if no profile is found.

### `is_user_verified(p_user_id UUID) → BOOLEAN`
Returns whether the user's CUIT has been verified. Checks both profile tables and defaults to `false`.

---

## Row Level Security (RLS) Policies

RLS is enabled on **every table**. Below is a summary per table.

### `users`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `users_select_own` | SELECT | Owner | `id = auth.uid()` |
| `users_select_admin` | SELECT | Admin | Role = 'admin' |
| `users_update_own` | UPDATE | Owner | `id = auth.uid()` |
| `users_update_admin` | UPDATE | Admin | Role = 'admin' |

### `profiles_transportista`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `transportista_select_own` | SELECT | Owner | `user_id = auth.uid()` |
| `transportista_select_admin` | SELECT | Admin | Role = 'admin' |
| `transportista_select_public` | SELECT | Authenticated | `auth.uid() IS NOT NULL` |
| `transportista_insert_own` | INSERT | Owner | `user_id = auth.uid()` |
| `transportista_update_own` | UPDATE | Owner | `user_id = auth.uid()` |
| `transportista_update_admin` | UPDATE | Admin | Role = 'admin' |

### `profiles_cargador`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `cargador_select_own` | SELECT | Owner | `user_id = auth.uid()` |
| `cargador_select_admin` | SELECT | Admin | Role = 'admin' |
| `cargador_select_public` | SELECT | Authenticated | `auth.uid() IS NOT NULL` |
| `cargador_insert_own` | INSERT | Owner | `user_id = auth.uid()` |
| `cargador_update_own` | UPDATE | Owner | `user_id = auth.uid()` |
| `cargador_update_admin` | UPDATE | Admin | Role = 'admin' |

### `trucks`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `trucks_select_own` | SELECT | Owner | Via profiles_transportista lookup |
| `trucks_insert_own` | INSERT | Owner | Via profiles_transportista lookup |
| `trucks_update_own` | UPDATE | Owner | Via profiles_transportista lookup |
| `trucks_delete_own` | DELETE | Owner | Via profiles_transportista lookup |
| `trucks_select_admin` | SELECT | Admin | Role = 'admin' |
| `trucks_select_cargador` | SELECT | Cargador | Active trucks only, role = 'cargador' |

### `loads`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `loads_select_published` | SELECT | Authenticated | Published loads only |
| `loads_select_own_cargador` | SELECT | Owner | Via profiles_cargador lookup |
| `loads_select_assigned_transportista` | SELECT | Assigned carrier | Via transportista_asignado_id |
| `loads_insert_cargador` | INSERT | Cargador | Via profiles_cargador lookup |
| `loads_update_own_cargador` | UPDATE | Owner | Via profiles_cargador lookup |
| `loads_delete_own_cargador` | DELETE | Owner | Via profiles_cargador lookup |
| `loads_select_admin` | SELECT | Admin | Role = 'admin' |
| `loads_update_admin` | UPDATE | Admin | Role = 'admin' |
| `loads_delete_admin` | DELETE | Admin | Role = 'admin' |

### `load_applications`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `applications_select_own_transportista` | SELECT | Applicant | Via profiles_transportista lookup |
| `applications_insert_transportista` | INSERT | Transportista | Via profiles_transportista lookup |
| `applications_select_load_owner` | SELECT | Load owner | Via loads → profiles_cargador join |
| `applications_update_load_owner` | UPDATE | Load owner | Via loads → profiles_cargador join |
| `applications_select_admin` | SELECT | Admin | Role = 'admin' |
| `applications_update_admin` | UPDATE | Admin | Role = 'admin' |

### `ratings`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `ratings_insert_own` | INSERT | Rater | `from_user_id = auth.uid()` |
| `ratings_select_authenticated` | SELECT | Authenticated | `auth.uid() IS NOT NULL` |

### `notifications`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `notifications_select_own` | SELECT | Owner | `user_id = auth.uid()` |
| `notifications_update_own` | UPDATE | Owner | `user_id = auth.uid()` |
| `notifications_insert_admin` | INSERT | Admin | Role = 'admin' |

### `subscriptions`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `subscriptions_select_own` | SELECT | Owner | `user_id = auth.uid()` |
| `subscriptions_select_admin` | SELECT | Admin | Role = 'admin' |
| `subscriptions_update_admin` | UPDATE | Admin | Role = 'admin' |
| `subscriptions_insert_admin` | INSERT | Admin | Role = 'admin' |

### `admin_logs`

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `admin_logs_select_admin` | SELECT | Admin | Role = 'admin' |
| `admin_logs_insert_admin` | INSERT | Admin | Role = 'admin' |

---

## Migrations

All migrations are in `supabase/migrations/` and must be applied in order.

| # | File | Description |
|---|------|-------------|
| 1 | `20250325000001_create_enums.sql` | Creates all 8 custom enum types |
| 2 | `20250325000002_create_users_table.sql` | Creates users table, handle_new_user trigger, update_updated_at function |
| 3 | `20250325000003_create_profiles.sql` | Creates profiles_transportista and profiles_cargador |
| 4 | `20250325000004_create_trucks.sql` | Creates trucks table |
| 5 | `20250325000005_create_loads.sql` | Creates loads table with full load lifecycle |
| 6 | `20250325000006_create_applications.sql` | Creates load_applications with unique constraint |
| 7 | `20250325000007_create_ratings.sql` | Creates ratings with auto-update triggers for avg rating |
| 8 | `20250325000008_create_notifications.sql` | Creates notifications with partial index for unread |
| 9 | `20250325000009_create_subscriptions.sql` | Creates subscriptions with MercadoPago reference |
| 10 | `20250325000010_create_admin_logs.sql` | Creates admin_logs audit table |
| 11 | `20250326000001_production_indexes_and_functions.sql` | Production indexes, helper functions, realtime, integrity constraints |

### Applying Migrations

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply all pending migrations
supabase db push

# Check migration status
supabase migration list
```

---

## Realtime Subscriptions

Realtime is enabled on the following tables via `supabase_realtime` publication:

| Table | Use Case |
|-------|----------|
| `loads` | Live load board updates — new loads appear instantly |
| `notifications` | In-app notification bell — real-time unread count |
| `load_applications` | Shippers see new applications as they arrive |

Clients subscribe using the Supabase Realtime client:

```ts
supabase
  .channel('loads')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'loads' }, (payload) => {
    // Handle new load
  })
  .subscribe();
```

---

## Backup and Recovery

- **Automatic daily backups**: Managed by Supabase (Pro plan includes 7-day PITR)
- **Manual backup**: `supabase db dump > backup.sql`
- **Restore**: `psql -h db.your-project.supabase.co -U postgres < backup.sql`

See `docs/DISASTER-RECOVERY.md` for full recovery procedures.
