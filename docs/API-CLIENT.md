# API Client Documentation

> How to consume the CarGA API from both browser (client-side) and server-side contexts.

---

## Table of Contents

1. [Supabase Client Setup](#supabase-client-setup)
2. [Authentication & Session Management](#authentication--session-management)
3. [Making API Requests](#making-api-requests)
4. [Examples](#examples)
5. [Rate Limiting](#rate-limiting)
6. [Error Handling](#error-handling)

---

## Supabase Client Setup

CarGA uses `@supabase/ssr` to manage Supabase clients across the Next.js rendering contexts. There are three client types, each suited to a different environment.

### Browser Client (`createClient`)

Used in React client components (`"use client"` directive). Reads/writes auth cookies automatically via the browser.

**File:** `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Usage in a component:**

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export default function MyComponent() {
  const supabase = createClient();

  async function fetchLoads() {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('estado', 'publicada');
    // ...
  }
}
```

### Server Client (`createServerSupabaseClient`)

Used in Server Components, Route Handlers (`app/api/`), and Server Actions. Accesses cookies via Next.js `cookies()` from `next/headers`.

**File:** `lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (_error) {
            // Server component -- cookie setting may fail silently
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (_error) {
            // Server component -- cookie removal may fail silently
          }
        },
      },
    }
  );
}
```

### Service Role Client (`createServiceRoleClient`)

Used only in trusted server-side operations (webhooks, admin migrations) that need to bypass Row-Level Security. Never expose the service role key to the client.

```typescript
export function createServiceRoleClient() {
  const { createClient } = require('@supabase/supabase-js');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

### Middleware Client

Used in `middleware.ts` to refresh sessions on every request. This client reads cookies from the incoming `NextRequest` and writes updated cookies to the `NextResponse`.

**File:** `lib/supabase/middleware.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}
```

---

## Authentication & Session Management

### How Auth Works

1. **Sign up / Sign in** happens via Supabase Auth (email+password or Google OAuth).
2. Supabase issues a JWT stored in HTTP-only cookies (managed by `@supabase/ssr`).
3. The middleware (`middleware.ts`) calls `updateSession()` on every request, which silently refreshes the token when needed and keeps the cookie up to date.
4. API Route Handlers call `supabase.auth.getUser()` to verify the caller's identity.

### Getting the Current User (Server-side)

```typescript
const supabase = createServerSupabaseClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
  // Not authenticated
}
```

### Getting the Current User (Client-side)

```typescript
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Session Refresh

Sessions are automatically refreshed by the middleware on every navigation/API call. The `@supabase/ssr` library handles token refresh transparently. No manual refresh is needed.

### OAuth Callback

After Google OAuth, the user is redirected to `/api/auth/callback` which:
1. Exchanges the authorization code for a session.
2. Sets the user role (transportista or cargador) based on the `role` query parameter.
3. Redirects to the appropriate dashboard (`/t-panel` or `/c-panel`).

---

## Making API Requests

### From Client Components (Browser)

Use the standard `fetch` API. Cookies are sent automatically by the browser.

```typescript
const response = await fetch('/api/loads?provincia=Buenos%20Aires&limit=10');
const result = await response.json();

if (result.success) {
  console.log(result.data);   // Load[]
  console.log(result.meta);   // { total, limit, offset }
} else {
  console.error(result.error); // { code, message }
}
```

### From Server Components / Route Handlers

Use `createServerSupabaseClient()` to query Supabase directly (bypasses the API layer):

```typescript
const supabase = createServerSupabaseClient();
const { data, error } = await supabase
  .from('loads')
  .select('*')
  .eq('estado', 'publicada')
  .order('created_at', { ascending: false })
  .limit(20);
```

---

## Examples

### Fetching Loads with Filters

```bash
curl -X GET "https://carga.app/api/loads?provincia=Buenos%20Aires&tipo_camion=semirremolque&peso_min=5&limit=10&offset=0" \
  -H "Cookie: <session-cookie>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "origen_ciudad": "Rosario",
      "destino_ciudad": "Buenos Aires",
      "tipo_carga": "cereales",
      "peso_tn": 28,
      "tarifa_ars": 450000,
      "estado": "publicada",
      "..."
    }
  ],
  "meta": {
    "total": 42,
    "limit": 10,
    "offset": 0
  }
}
```

### Creating a Load (Cargador Only)

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
    "id": "uuid",
    "cargador_id": "profile-uuid",
    "estado": "publicada",
    "..."
  }
}
```

### Applying to a Load (Transportista Only)

```bash
curl -X POST "https://carga.app/api/loads/{loadId}/applications" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "mensaje": "Tengo disponibilidad inmediata, camion semirremolque en Rosario."
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "load_id": "load-uuid",
    "transportista_id": "profile-uuid",
    "estado": "pendiente",
    "mensaje": "Tengo disponibilidad inmediata, camion semirremolque en Rosario."
  }
}
```

---

## Rate Limiting

All API requests pass through the middleware rate limiter before reaching the route handler.

| Scope | Limit | Window | Key |
|-------|-------|--------|-----|
| API endpoints (`/api/*`) | 60 requests | 1 minute | `api:{client-ip}` |
| Auth endpoints (POST only) | 5 attempts | 15 minutes | `auth:{client-ip}` |
| Webhooks (internal) | 100 requests | 1 minute | `webhook:{client-ip}` |

### Rate Limit Headers

Every API response includes these headers:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests in the current window |
| `X-RateLimit-Remaining` | Remaining requests in the current window |
| `X-RateLimit-Reset` | Seconds until the window resets |

### When Rate Limited (HTTP 429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Demasiados intentos. Espera unos minutos antes de intentar de nuevo."
  }
}
```

The response also includes a `Retry-After` header with seconds until the limit resets.

---

## Error Handling

### Standard Response Format

All API responses follow a consistent envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 42, "limit": 20, "offset": 0 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

### Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `BAD_REQUEST` | 400 | Invalid request parameters or state |
| `VALIDATION_ERROR` | 400 | Request body failed Zod schema validation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `QUERY_ERROR` | 500 | Database query failed |
| `INSERT_ERROR` | 500 | Database insert failed |
| `UPDATE_ERROR` | 500 | Database update failed |
| `MP_ERROR` | 502 | Mercado Pago API call failed |
| `DB_ERROR` | 500 | Generic database error |
| `CUIT_INVALID` | 400 | AFIP CUIT validation failed |
| `SELF_RATING` | 400 | Attempted to rate yourself |
| `ALREADY_RATED` | 409 | Duplicate rating for same load |
| `LOAD_NOT_FOUND` | 404 | Load does not exist (ratings context) |
| `LOAD_NOT_DELIVERED` | 400 | Load not in 'entregada' state for rating |
| `PROFILE_NOT_FOUND` | 404 | User profile not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Client-Side Error Handling Pattern

```typescript
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!result.success) {
    if (result.error.code === 'UNAUTHORIZED') {
      // Redirect to login
      window.location.href = '/iniciar-sesion';
      throw new Error('Session expired');
    }

    if (result.error.code === 'RATE_LIMIT_EXCEEDED') {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limited. Retry in ${retryAfter}s`);
    }

    throw new Error(result.error.message);
  }

  return result.data;
}
```
