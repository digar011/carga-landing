# API Reference Guide

> Complete reference for all CarGA API endpoints. Base URL: `https://carga.app` (production) or `http://localhost:3000` (development).

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Loads](#loads)
4. [Applications](#applications)
5. [Ratings](#ratings)
6. [Subscriptions](#subscriptions)
7. [Identity Verification](#identity-verification)
8. [Admin](#admin)
9. [Webhooks](#webhooks)
10. [Auth Callback](#auth-callback)
11. [Error Codes](#error-codes)

---

## Authentication

CarGA uses **Supabase Auth with SSR cookies**. Authentication tokens are stored in HTTP-only cookies managed by `@supabase/ssr`. The middleware automatically refreshes tokens on every request.

**How it works:**
- On sign-in, Supabase sets session cookies in the browser.
- Every request to `/api/*` passes through middleware that validates/refreshes the session.
- API Route Handlers call `supabase.auth.getUser()` to verify the caller.

**No `Authorization` header is needed.** Cookies are sent automatically by the browser. For server-to-server calls, use the Supabase service role client directly.

**Public endpoints** (no auth required):
- `GET /api/loads` (browsing)
- `GET /api/loads/[id]` (viewing a single load)
- `GET /api/webhooks/whatsapp` (Meta verification)
- `POST /api/webhooks/whatsapp` (Meta messages)
- `POST /api/webhooks/mercadopago` (Mercado Pago notifications)
- `GET /api/auth/callback` (OAuth callback)

All other endpoints require an authenticated session.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

The `meta` field is included on paginated list endpoints. Single-resource endpoints omit it.

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of the error"
  }
}
```

---

## Loads

### GET /api/loads

List loads with optional filters. Public endpoint (no auth required).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `provincia` | string | Filter by province |
| `tipo_camion` | enum | Filter by truck type: `semirremolque`, `volcador`, `frigorifico`, `chasis`, `carrozado`, `tanque`, `portacontenedor`, `batea` |
| `tipo_carga` | enum | Filter by cargo type: `cereales`, `alimentos`, `maquinaria`, `materiales_construccion`, `productos_quimicos`, `vehiculos`, `ganado`, `general`, `refrigerados`, `peligrosos` |
| `peso_min` | number | Minimum weight in tons |
| `peso_max` | number | Maximum weight in tons |
| `tarifa_min` | number | Minimum rate in ARS |
| `tarifa_max` | number | Maximum rate in ARS |
| `search` | string | Free-text search |
| `sort` | string | Sort field |
| `limit` | number | Results per page (default: 20) |
| `offset` | number | Offset for pagination (default: 0) |

**Example:**

```bash
curl -X GET "https://carga.app/api/loads?provincia=Buenos%20Aires&tipo_camion=semirremolque&limit=10"
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "cargador_id": "...",
      "origen_ciudad": "Rosario",
      "origen_provincia": "Santa Fe",
      "destino_ciudad": "Buenos Aires",
      "destino_provincia": "Buenos Aires",
      "tipo_carga": "cereales",
      "descripcion_carga": "Trigo a granel",
      "peso_tn": 28,
      "tipo_camion_requerido": "semirremolque",
      "tarifa_ars": 450000,
      "tarifa_negociable": true,
      "fecha_carga": "2026-04-01",
      "estado": "publicada",
      "created_at": "2026-03-25T10:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "limit": 10,
    "offset": 0
  }
}
```

---

### POST /api/loads

Create a new load. **Auth required.** Caller must be a cargador.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `origen_ciudad` | string | Yes | Origin city (min 2 chars) |
| `origen_provincia` | string | Yes | Origin province (min 2 chars) |
| `destino_ciudad` | string | Yes | Destination city (min 2 chars) |
| `destino_provincia` | string | Yes | Destination province (min 2 chars) |
| `tipo_carga` | enum | Yes | Cargo type (see enum values above) |
| `descripcion_carga` | string | Yes | Cargo description (min 3 chars) |
| `peso_tn` | number | Yes | Weight in tons (> 0) |
| `tipo_camion_requerido` | enum | Yes | Required truck type (see enum values above) |
| `tarifa_ars` | number | Yes | Rate in ARS (> 0) |
| `tarifa_negociable` | boolean | Yes | Whether rate is negotiable |
| `fecha_carga` | string | Yes | Pickup date (ISO format) |
| `fecha_entrega` | string | No | Delivery date |
| `observaciones` | string | No | Additional notes |

**Example:**

```bash
curl -X POST "https://carga.app/api/loads" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "origen_ciudad": "Rosario",
    "origen_provincia": "Santa Fe",
    "destino_ciudad": "Buenos Aires",
    "destino_provincia": "Buenos Aires",
    "tipo_carga": "cereales",
    "descripcion_carga": "Trigo a granel - cosecha 2026",
    "peso_tn": 28,
    "tipo_camion_requerido": "semirremolque",
    "tarifa_ars": 450000,
    "tarifa_negociable": true,
    "fecha_carga": "2026-04-01"
  }'
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "cargador_id": "profile-uuid",
    "estado": "publicada",
    "..."
  }
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 401 | `UNAUTHORIZED` | Not logged in |
| 400 | `VALIDATION_ERROR` | Body fails schema validation |
| 403 | `FORBIDDEN` | Caller is not a cargador |
| 500 | `INSERT_ERROR` | Database insert failed |

---

### GET /api/loads/[id]

Get a single load with cargador profile details. Public endpoint.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Load ID |

**Example:**

```bash
curl -X GET "https://carga.app/api/loads/550e8400-e29b-41d4-a716-446655440000"
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "origen_ciudad": "Rosario",
    "destino_ciudad": "Buenos Aires",
    "cargador": {
      "id": "...",
      "empresa": "Agro SA",
      "cuit": "30-12345678-9",
      "contacto_nombre": "Juan",
      "rating": 4.5,
      "total_cargas": 15,
      "verified": true,
      "avatar_url": null,
      "ciudad": "Rosario",
      "provincia": "Santa Fe"
    },
    "..."
  }
}
```

---

### PATCH /api/loads/[id]

Update a load. **Auth required.** Caller must be the load owner (cargador).

**Request Body (all optional):**

| Field | Type | Description |
|-------|------|-------------|
| `tarifa_ars` | number | Updated rate (> 0) |
| `tarifa_negociable` | boolean | Whether rate is negotiable |
| `observaciones` | string | Updated notes |
| `fecha_entrega` | string | Updated delivery date |

**Example:**

```bash
curl -X PATCH "https://carga.app/api/loads/550e8400-..." \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{ "tarifa_ars": 500000, "tarifa_negociable": false }'
```

**Response (200):**

```json
{
  "success": true,
  "data": { "id": "...", "tarifa_ars": 500000, "..." }
}
```

---

### DELETE /api/loads/[id]

Cancel a load (soft delete -- sets `estado` to `cancelada`). **Auth required.** Caller must be the load owner.

**Example:**

```bash
curl -X DELETE "https://carga.app/api/loads/550e8400-..." \
  -H "Cookie: <session-cookie>"
```

**Response (200):**

```json
{
  "success": true,
  "data": { "id": "...", "estado": "cancelada", "..." }
}
```

**Error:** Returns 400 if the load is already cancelled.

---

### PATCH /api/loads/[id]/status

Update load status through the lifecycle. **Auth required.** Permission depends on the transition.

**Valid Status Transitions:**

| From | To | Allowed By |
|------|----|------------|
| `publicada` | `cancelada` | cargador (owner) |
| `aplicada` | `cancelada` | cargador (owner) |
| `aplicada` | `asignada` | cargador (owner) |
| `asignada` | `en_camino` | transportista (assigned) |
| `en_camino` | `entregada` | either (cargador or assigned transportista) |
| `entregada` | `calificada` | system only (automatic) |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `estado` | enum | Yes | Target status |
| `transportista_asignado_id` | UUID | Conditional | Required when transitioning to `asignada` |

**Example (assign a transportista):**

```bash
curl -X PATCH "https://carga.app/api/loads/550e8400-.../status" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "estado": "asignada",
    "transportista_asignado_id": "profile-uuid"
  }'
```

**Response (200):**

```json
{
  "success": true,
  "data": { "id": "...", "estado": "asignada", "transportista_asignado_id": "profile-uuid", "..." }
}
```

**Side effects:** Sends an in-app notification to the affected party when status changes.

---

## Applications

### GET /api/loads/[id]/applications

Get applications for a load. **Auth required.** Response varies by role:
- **Cargador (load owner):** Returns all applications with full transportista profiles and truck data.
- **Transportista:** Returns only their own application for this load.

**Example:**

```bash
curl -X GET "https://carga.app/api/loads/550e8400-.../applications" \
  -H "Cookie: <session-cookie>"
```

**Response for cargador (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "app-uuid",
      "load_id": "load-uuid",
      "transportista_id": "profile-uuid",
      "estado": "pendiente",
      "mensaje": "Disponible esta semana.",
      "transportista": {
        "id": "...",
        "nombre": "Carlos",
        "apellido": "Perez",
        "cuit": "20-33445566-7",
        "rating": 4.8,
        "verified": true,
        "trucks": [
          { "tipo": "semirremolque", "patente": "AB123CD", "capacidad_tn": 30 }
        ]
      }
    }
  ]
}
```

---

### POST /api/loads/[id]/applications

Apply to a load. **Auth required.** Caller must be a transportista. The load must be in `publicada` or `aplicada` status.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mensaje` | string | No | Optional message to the cargador (max 500 chars) |

**Example:**

```bash
curl -X POST "https://carga.app/api/loads/550e8400-.../applications" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{ "mensaje": "Tengo disponibilidad inmediata." }'
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "app-uuid",
    "load_id": "load-uuid",
    "transportista_id": "profile-uuid",
    "estado": "pendiente",
    "mensaje": "Tengo disponibilidad inmediata."
  }
}
```

**Side effects:**
- If this is the first application, the load status changes from `publicada` to `aplicada`.
- An in-app notification is sent to the cargador.

**Error:** Returns 400 if already applied or if the load no longer accepts applications.

---

### PATCH /api/applications/[id]

Accept or reject an application. **Auth required.** Caller must be the load owner (cargador). Application must be in `pendiente` status.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `estado` | enum | Yes | `aceptada` or `rechazada` |

**Example (accept):**

```bash
curl -X PATCH "https://carga.app/api/applications/app-uuid" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{ "estado": "aceptada" }'
```

**Response (200):**

```json
{
  "success": true,
  "data": { "id": "app-uuid", "estado": "aceptada", "..." }
}
```

**Side effects when accepting:**
- All other pending applications for the same load are automatically rejected.
- The load status changes to `asignada` with the accepted transportista assigned.
- Notification sent to the accepted transportista.

**Side effects when rejecting:**
- Notification sent to the rejected transportista.

---

## Ratings

### POST /api/ratings

Create a rating for a completed load. **Auth required.** The load must be in `entregada` status.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `load_id` | UUID | Yes | The load being rated |
| `to_user_id` | UUID | Yes | The user being rated (auth.users ID) |
| `score` | integer | Yes | Rating score (1 to 5) |
| `comentario` | string | No | Optional comment (max 500 chars) |

**Example:**

```bash
curl -X POST "https://carga.app/api/ratings" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "load_id": "load-uuid",
    "to_user_id": "user-uuid",
    "score": 5,
    "comentario": "Excelente servicio, puntual."
  }'
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "rating-uuid",
    "from_user_id": "caller-uuid",
    "to_user_id": "user-uuid",
    "load_id": "load-uuid",
    "score": 5,
    "comentario": "Excelente servicio, puntual."
  }
}
```

**Validations:**
- Cannot rate yourself (400 `SELF_RATING`)
- Load must be in `entregada` status (400 `LOAD_NOT_DELIVERED`)
- Cannot rate the same user for the same load twice (409 `ALREADY_RATED`)

**Side effects:** A database trigger automatically recalculates the rated user's average rating on their profile.

---

### GET /api/ratings/[userId]

Get all ratings for a user. **Auth required.**

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | UUID | The user whose ratings to retrieve (auth.users ID) |

**Example:**

```bash
curl -X GET "https://carga.app/api/ratings/user-uuid" \
  -H "Cookie: <session-cookie>"
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "ratings": [
      {
        "id": "rating-uuid",
        "score": 5,
        "comentario": "Excelente servicio.",
        "created_at": "2026-03-20T14:00:00Z",
        "from_user_id": "..."
      }
    ],
    "average": 4.7,
    "total": 12
  }
}
```

---

## Subscriptions

### GET /api/subscriptions

Get the current user's most recent subscription. **Auth required.**

**Example:**

```bash
curl -X GET "https://carga.app/api/subscriptions" \
  -H "Cookie: <session-cookie>"
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "sub-uuid",
    "user_id": "user-uuid",
    "plan": "profesional",
    "estado": "activa",
    "mp_subscription_id": "mp-sub-id",
    "fecha_inicio": "2026-03-01T00:00:00Z",
    "fecha_fin": null
  }
}
```

Returns `data: null` if the user has no subscription.

---

### POST /api/subscriptions

Create a new subscription via Mercado Pago. **Auth required.**

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `plan` | enum | Yes | Plan ID |

**Valid plans by role:**

| Role | Available Plans |
|------|----------------|
| Transportista | `profesional`, `flota` |
| Cargador | `estandar`, `premium` |

**Example:**

```bash
curl -X POST "https://carga.app/api/subscriptions" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{ "plan": "profesional" }'
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "checkout_url": "https://www.mercadopago.com.ar/subscriptions/checkout/..."
  }
}
```

The client should redirect the user to `checkout_url` to complete payment.

---

### PATCH /api/subscriptions/[id]

Cancel a subscription. **Auth required.** Caller must own the subscription.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Subscription ID |

**Example:**

```bash
curl -X PATCH "https://carga.app/api/subscriptions/sub-uuid" \
  -H "Cookie: <session-cookie>"
```

**Response (200):**

```json
{
  "success": true,
  "data": { "id": "sub-uuid", "estado": "cancelada" }
}
```

**Side effects:** Also cancels the subscription in Mercado Pago via their API.

---

## Identity Verification

### POST /api/verify-cuit

Verify a CUIT number against AFIP and update the user's profile as verified. **Auth required.**

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cuit` | string | Yes | CUIT number (digits only or formatted XX-XXXXXXXX-X) |

**Example:**

```bash
curl -X POST "https://carga.app/api/verify-cuit" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{ "cuit": "20-33445566-7" }'
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "razonSocial": "PEREZ CARLOS ALBERTO",
    "estadoClave": "ACTIVO"
  }
}
```

**Side effects:** Updates the caller's profile (`profiles_transportista` or `profiles_cargador`) with `verified: true` and the formatted CUIT.

---

## Admin

All admin endpoints require authentication and `role: 'admin'` in the `users` table. Returns 401 for unauthenticated or 403 for non-admin users.

### GET /api/admin/stats

Get platform statistics. **Admin only.**

**Example:**

```bash
curl -X GET "https://carga.app/api/admin/stats" \
  -H "Cookie: <admin-session-cookie>"
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "total_users": 1250,
    "total_transportistas": 800,
    "total_cargadores": 420,
    "total_loads": 3500,
    "active_loads": 280,
    "total_subscriptions": 95,
    "new_signups_30d": 180
  }
}
```

---

### GET /api/admin/users

List all users with profile data. **Admin only.** Paginated.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by email |
| `role` | enum | Filter by role: `transportista`, `cargador`, `admin` |
| `verified` | string | Filter by verification: `true` or `false` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |

**Example:**

```bash
curl -X GET "https://carga.app/api/admin/users?role=transportista&verified=true&page=1&limit=20" \
  -H "Cookie: <admin-session-cookie>"
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "email": "carlos@example.com",
      "role": "transportista",
      "nombre": "Carlos Perez",
      "cuit": "20-33445566-7",
      "verified": true,
      "plan": "profesional",
      "rating": 4.8,
      "provincia": "Santa Fe",
      "avatar_url": null,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 800,
    "page": 1,
    "limit": 20,
    "total_pages": 40
  }
}
```

---

### PATCH /api/admin/users

Perform admin actions on a user. **Admin only.**

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | UUID | Yes | Target user ID |
| `action` | enum | Yes | `suspend`, `activate`, or `change_role` |
| `value` | enum | Conditional | New role (required for `change_role`) |

**Example (suspend a user):**

```bash
curl -X PATCH "https://carga.app/api/admin/users" \
  -H "Content-Type: application/json" \
  -H "Cookie: <admin-session-cookie>" \
  -d '{ "userId": "user-uuid", "action": "suspend" }'
```

**Response (200):**

```json
{
  "success": true,
  "data": { "id": "user-uuid", "email": "...", "role": "transportista", "..." }
}
```

**Side effects:** Logs the action to `admin_logs`.

---

### GET /api/admin/loads

List all loads with cargador data. **Admin only.** Paginated.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by origin/destination city or cargo description |
| `status` | enum | Filter by load status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |

**Example:**

```bash
curl -X GET "https://carga.app/api/admin/loads?status=publicada&search=Buenos%20Aires" \
  -H "Cookie: <admin-session-cookie>"
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "load-uuid",
      "origen_ciudad": "Rosario",
      "destino_ciudad": "Buenos Aires",
      "estado": "publicada",
      "cargador": {
        "id": "...",
        "empresa": "Agro SA",
        "verified": true
      },
      "..."
    }
  ],
  "meta": { "total": 150, "page": 1, "limit": 20, "total_pages": 8 }
}
```

---

### PATCH /api/admin/loads

Admin actions on loads. **Admin only.**

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `loadId` | UUID | Yes | Target load ID |
| `action` | enum | Yes | `cancel` or `restore` |

**Example:**

```bash
curl -X PATCH "https://carga.app/api/admin/loads" \
  -H "Content-Type: application/json" \
  -H "Cookie: <admin-session-cookie>" \
  -d '{ "loadId": "load-uuid", "action": "cancel" }'
```

**Side effects:** Logs the action to `admin_logs` with the new status.

---

### GET /api/admin/logs

Get admin activity logs. **Admin only.** Paginated.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |

**Example:**

```bash
curl -X GET "https://carga.app/api/admin/logs?page=1&limit=20" \
  -H "Cookie: <admin-session-cookie>"
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "log-uuid",
      "admin_id": "admin-uuid",
      "action": "suspend",
      "entity": "user",
      "entity_id": "user-uuid",
      "details": { "value": null },
      "created_at": "2026-03-25T12:00:00Z",
      "admin": { "email": "admin@carga.app" }
    }
  ],
  "meta": { "total": 45, "page": 1, "limit": 20, "total_pages": 3 }
}
```

---

### GET /api/admin/export

Export data as CSV. **Admin only.** Returns a CSV file download.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | enum | Yes | `users`, `loads`, or `subscriptions` |

**Example:**

```bash
curl -X GET "https://carga.app/api/admin/export?type=users" \
  -H "Cookie: <admin-session-cookie>" \
  -o "carga-users-2026-03-25.csv"
```

**Response (200):**

Headers:
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="carga-users-2026-03-25.csv"
```

Body: CSV data (up to 5,000 rows).

**CSV columns by type:**

| Type | Columns |
|------|---------|
| `users` | ID, Email, Rol, Nombre/Empresa, CUIT, Telefono, Provincia, Ciudad, Verificado, Plan, Fecha registro |
| `loads` | ID, Origen Ciudad, Origen Provincia, Destino Ciudad, Destino Provincia, Tipo Carga, Peso (tn), Tarifa (ARS), Estado, Fecha Carga, Fecha Creacion |
| `subscriptions` | ID, Email, Plan, Estado, Fecha Inicio, Fecha Fin, Fecha Creacion |

---

## Webhooks

### GET /api/webhooks/whatsapp

WhatsApp Business API webhook verification. Called by Meta to verify the webhook URL.

**Query Parameters (set by Meta):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `hub.mode` | string | Must be `subscribe` |
| `hub.verify_token` | string | Must match `WHATSAPP_VERIFY_TOKEN` env var |
| `hub.challenge` | string | Challenge string to echo back |

**Response:** Returns the `hub.challenge` string as plain text (200), or 403 if the token is invalid.

---

### POST /api/webhooks/whatsapp

Receive incoming WhatsApp messages and delivery status updates from Meta. No auth required (verified by payload structure).

**Payload:** Meta WhatsApp Cloud API webhook format. See [Meta WhatsApp Webhook docs](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks).

**Response:** Always returns `200 { success: true }` to prevent Meta from retrying.

**Processing:**
- Status updates (sent, delivered, read, failed) are logged.
- Incoming messages are logged (Phase 2: routed to in-app chat).

---

### POST /api/webhooks/mercadopago

Receive payment and subscription notifications from Mercado Pago. No auth required (verified by headers).

**Payload:**

```json
{
  "id": 12345,
  "live_mode": true,
  "type": "subscription_preapproval",
  "action": "updated",
  "data": { "id": "mp-subscription-id" }
}
```

**Supported event types:**

| Type | Handler |
|------|---------|
| `subscription_preapproval` | Maps MP actions to subscription states and updates DB |
| `payment` | Logged (full implementation pending) |
| `subscription_authorized_payment` | Logged (full implementation pending) |

**Response:** Always returns `200 { success: true }` to prevent Mercado Pago from retrying.

**MP action to DB state mapping:**

| MP Action | DB Estado |
|-----------|-----------|
| `created` | `pendiente` |
| `updated` | `activa` |
| `cancelled` | `cancelada` |
| `paused` | `cancelada` |

---

## Auth Callback

### GET /api/auth/callback

OAuth callback handler. Called by Supabase after Google OAuth sign-in. No direct auth required (uses the authorization code from the query string).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | Authorization code from Supabase |
| `next` | string | Redirect path after login (default: `/t-panel`) |
| `role` | string | User role: `transportista` or `cargador` (default: `transportista`) |

**Behavior:**
1. Exchanges the authorization code for a session.
2. Sets the user role in the `users` table if this is a new OAuth user.
3. Redirects to the appropriate dashboard based on role.
4. On failure, redirects to `/iniciar-sesion?error=auth_callback_failed`.

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `FORBIDDEN` | 403 | Insufficient permissions for this action |
| `NOT_FOUND` | 404 | Resource does not exist |
| `BAD_REQUEST` | 400 | Invalid parameters or state transition |
| `VALIDATION_ERROR` | 400 | Request body failed Zod schema validation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests -- check `Retry-After` header |
| `QUERY_ERROR` | 500 | Database query failed |
| `INSERT_ERROR` | 500 | Database insert failed |
| `UPDATE_ERROR` | 500 | Database update failed |
| `DB_ERROR` | 500 | Generic database error |
| `MP_ERROR` | 502 | Mercado Pago API call failed |
| `CUIT_INVALID` | 400 | AFIP CUIT validation failed |
| `SELF_RATING` | 400 | Cannot rate yourself |
| `ALREADY_RATED` | 409 | Duplicate rating for same load+user |
| `LOAD_NOT_FOUND` | 404 | Load does not exist (ratings context) |
| `LOAD_NOT_DELIVERED` | 400 | Load not in `entregada` status for rating |
| `PROFILE_NOT_FOUND` | 404 | User profile not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `GONE` | 410 | Deprecated API version removed (future) |
