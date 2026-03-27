# API Versioning Strategy

> How CarGA manages API versioning, deprecation, and backward compatibility.

---

## Table of Contents

1. [Current State](#current-state)
2. [Versioning Scheme](#versioning-scheme)
3. [Migration Plan](#migration-plan)
4. [Deprecation Policy](#deprecation-policy)
5. [How to Deprecate an Endpoint](#how-to-deprecate-an-endpoint)
6. [Version Changelog](#version-changelog)

---

## Current State

All API routes are served at `/api/*` without an explicit version prefix. This is treated as **v1 (implicit)**.

```
/api/loads
/api/loads/[id]
/api/loads/[id]/applications
/api/loads/[id]/status
/api/applications/[id]
/api/ratings
/api/ratings/[userId]
/api/subscriptions
/api/subscriptions/[id]
/api/verify-cuit
/api/admin/stats
/api/admin/users
/api/admin/loads
/api/admin/logs
/api/admin/export
/api/webhooks/whatsapp
/api/webhooks/mercadopago
/api/auth/callback
```

**Rationale:** During MVP/Phase 1, adding a version prefix introduces unnecessary complexity. The codebase is the only consumer. Versioning will be introduced when external integrations or breaking changes require it.

---

## Versioning Scheme

When breaking changes are needed, CarGA will adopt **URL path versioning**:

```
/api/v1/loads          (original behavior)
/api/v2/loads          (new behavior with breaking changes)
```

### Why URL Path Versioning

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| URL path (`/api/v1/`) | Explicit, easy to route, cacheable | URL clutter | **Selected** |
| Header (`Accept-Version: v2`) | Clean URLs | Hidden, harder to test/debug | Rejected |
| Query param (`?version=2`) | Easy to add | Pollutes params, caching issues | Rejected |

### What Counts as a Breaking Change

- Removing a field from a response body
- Renaming a field in request or response
- Changing the type of an existing field
- Changing the meaning/behavior of an existing endpoint
- Removing an endpoint
- Changing authentication/authorization requirements

### What Does NOT Count as a Breaking Change

- Adding a new optional field to request body
- Adding a new field to response body
- Adding a new endpoint
- Adding new enum values (when clients handle unknown values gracefully)
- Performance improvements with identical behavior
- Bug fixes that align behavior with documented specification

---

## Migration Plan

### Phase 1 (Current): Implicit v1

```
/api/loads     -- v1 implicit
```

No changes needed. All routes live at `/api/*`.

### Phase 2 (When Breaking Changes Needed): Introduce v1 Prefix

1. Create a Next.js route group at `app/api/v1/`.
2. Move existing route handlers into the `v1` group (or re-export them).
3. Keep `/api/*` as an alias that redirects or proxies to `/api/v1/*` for backward compatibility.
4. Add the `API-Version` response header to all responses.

```
app/
  api/
    v1/
      loads/
        route.ts          -- original handlers
      ...
    v2/
      loads/
        route.ts          -- new handlers with breaking changes
```

### Phase 3: Explicit v2

1. Create `app/api/v2/` with the new route handlers.
2. Both `/api/v1/` and `/api/v2/` serve simultaneously.
3. Begin deprecation period for v1.

---

## Deprecation Policy

### Support Window: N-1 for 6 Months

When a new version (vN) is released:

- **vN** is the current/recommended version.
- **vN-1** remains fully operational for **6 months** after vN goes live.
- **vN-2 and older** are removed (returns `410 Gone`).

### Timeline Example

| Date | Event | v1 Status | v2 Status |
|------|-------|-----------|-----------|
| 2026-06-01 | v2 released | Deprecated (still active) | Current |
| 2026-06-01 to 2026-12-01 | Deprecation period | Active with sunset headers | Current |
| 2026-12-01 | v1 end of life | Returns 410 Gone | Current |

### Communication

- **Deprecation header**: All responses from deprecated versions include `Sunset` and `Deprecation` headers.
- **Documentation**: CHANGELOG and API docs updated on the day of deprecation.
- **Client notification**: If applicable, notify integrated partners via email at least 30 days before EOL.

---

## How to Deprecate an Endpoint

### Step 1: Add Deprecation Headers

Add headers to the deprecated endpoint's response:

```typescript
// In the route handler for the deprecated endpoint
response.headers.set('Deprecation', 'true');
response.headers.set('Sunset', 'Sat, 01 Dec 2026 00:00:00 GMT');
response.headers.set('Link', '</api/v2/loads>; rel="successor-version"');
```

### Step 2: Log Usage

Add a log entry whenever the deprecated endpoint is called to track migration progress:

```typescript
console.warn(
  `[API Deprecation] ${request.method} ${request.nextUrl.pathname} called by ${clientIp}`
);
```

### Step 3: Update Documentation

1. Mark the endpoint as `[DEPRECATED]` in `API_GUIDE.md`.
2. Add a note pointing to the replacement endpoint.
3. Add an entry in the [Version Changelog](#version-changelog) below.

### Step 4: Remove After Sunset Date

After the sunset date, replace the handler with a `410 Gone` response:

```typescript
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'GONE',
        message: 'This API version has been removed. Use /api/v2/ instead.',
      },
    },
    { status: 410 }
  );
}
```

---

## Version Changelog

### v1 (Implicit) -- Current

**Released:** 2026-03-01 (MVP)

| Category | Endpoints |
|----------|-----------|
| Loads | `GET/POST /api/loads`, `GET/PATCH/DELETE /api/loads/[id]`, `PATCH /api/loads/[id]/status` |
| Applications | `GET/POST /api/loads/[id]/applications`, `PATCH /api/applications/[id]` |
| Ratings | `POST /api/ratings`, `GET /api/ratings/[userId]` |
| Subscriptions | `GET/POST /api/subscriptions`, `PATCH /api/subscriptions/[id]` |
| Identity | `POST /api/verify-cuit` |
| Admin | `GET /api/admin/stats`, `GET/PATCH /api/admin/users`, `GET/PATCH /api/admin/loads`, `GET /api/admin/logs`, `GET /api/admin/export` |
| Webhooks | `GET/POST /api/webhooks/whatsapp`, `POST /api/webhooks/mercadopago` |
| Auth | `GET /api/auth/callback` |

**Response format:** `{ success, data, meta? }` / `{ success: false, error: { code, message } }`

**Authentication:** Supabase SSR cookies (JWT in HTTP-only cookies).

**Rate limits:** 60 req/min (API), 5 req/15min (auth).

---

### v2 (Planned)

**Status:** Not yet scheduled.

**Potential breaking changes under consideration:**
- Standardize all field names to English (currently mixed Spanish/English)
- Add cursor-based pagination (replace offset-based)
- Restructure admin endpoints under a unified resource pattern
- Add explicit `Content-Language` header support

This section will be updated when v2 development begins.
