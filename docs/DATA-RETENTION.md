# Data Retention Policies

> **Project:** CarGA — Argentina's first digital load board
> **Last updated:** 2026-03-26
> **Applicable regulations:** Ley 25.326 (Argentina Personal Data Protection), BCRA/UIF financial record requirements

---

## Overview

This document defines how long each category of data is retained, the legal basis for retention, and the deletion/archival procedures. CarGA processes data for Argentine users and must comply with Argentina's data protection framework (Ley 25.326) as well as financial record retention requirements from the BCRA (Central Bank) and UIF (Financial Information Unit).

---

## Retention Schedule

### User Account Data

| Data | Retention Period | Storage | Notes |
|------|-----------------|---------|-------|
| Auth credentials (email, hashed password) | While account is active + 30 days after deletion request | Supabase Auth (`auth.users`) | Supabase handles password hashing via bcrypt |
| User role and metadata | While account is active + 30 days after deletion request | `users` table | Role: transportista, cargador, admin |
| Profile data (name, CUIT, phone, city) | While account is active + 30 days after deletion request | `profiles_transportista`, `profiles_cargador` | CUIT is PII under Ley 25.326 |
| Avatar images | While account is active, deleted on account deletion | Supabase Storage | Physically removed, not soft-deleted |

**Deletion procedure:** When a user requests account deletion, their account is marked for deletion and a 30-day grace period begins. During this period, the user can reactivate. After 30 days, all personal data is permanently deleted via a scheduled cleanup job. Associated records (loads, applications) are anonymized rather than deleted to preserve marketplace history.

---

### Load Data

| Data | Retention Period | Storage | Notes |
|------|-----------------|---------|-------|
| Load postings (origin, destination, cargo, rate) | Indefinite | `loads` table | Core marketplace data, needed for analytics and history |
| Load status history | Indefinite | `loads.estado` field | Tracks lifecycle: publicada -> asignada -> entregada -> calificada |
| Load geolocation (lat/lng) | Indefinite | `loads` table | Required for route analytics and load board history |

**Rationale:** Load data forms the historical backbone of the marketplace. It is used for:
- Analytics and market intelligence (route pricing trends, demand patterns)
- Dispute resolution (reference to original posting terms)
- User reputation context (linked to ratings)

When a user account is deleted, loads are **anonymized** (cargador_id set to a system placeholder) but the load record itself is retained.

---

### Financial Data

| Data | Retention Period | Storage | Notes |
|------|-----------------|---------|-------|
| Subscription records | 10 years from creation | `subscriptions` table | BCRA/UIF requirement for financial transaction records |
| MercadoPago subscription IDs | 10 years | `subscriptions.mp_subscription_id` | Reference to external payment system |
| Payment webhook events | 10 years | Application logs + admin_logs | Logged on receipt for audit trail |
| Invoice/billing data | 10 years | External (MercadoPago) + local reference | MercadoPago is the merchant of record |

**Legal basis:** Argentine financial regulations (BCRA Comunicaciones, UIF Resolution 30/2017) require businesses to retain financial transaction records for a minimum of 10 years. This applies to all payment and subscription data, even after user account deletion.

**Implementation:** Financial records are never hard-deleted. When a user account is deleted, the `user_id` foreign key is set to a system "deleted user" placeholder, but the financial record itself remains intact with all transaction details.

---

### Ratings and Reputation

| Data | Retention Period | Storage | Notes |
|------|-----------------|---------|-------|
| Rating scores (1-5) | Indefinite | `ratings` table | Core trust/reputation system |
| Rating comments | Indefinite | `ratings.comentario` | Part of public reputation |
| Aggregate scores | Indefinite | `profiles_transportista.rating`, `profiles_cargador.rating` | Auto-calculated via trigger |

**Rationale:** Ratings are part of the marketplace's trust infrastructure. Deleting ratings would undermine the reputation system for other users. When a user account is deleted:
- Ratings **given by** the deleted user are anonymized (from_user_id set to system placeholder)
- Ratings **received by** the deleted user are deleted along with the profile
- Aggregate ratings of other users are recalculated

---

### Notifications

| Data | Retention Period | Storage | Notes |
|------|-----------------|---------|-------|
| In-app notifications | 90 days | `notifications` table | After 90 days, moved to cold storage/archive |
| WhatsApp message logs | 90 days | Application logs | Message delivery status only, not content |
| Email delivery logs | 90 days | Resend dashboard | Managed by Resend's retention policy |

**Archival procedure:** A scheduled job runs weekly to archive notifications older than 90 days. Archived notifications are moved to a `notifications_archive` table (or exported to object storage) and removed from the primary table to keep query performance optimal.

---

### Admin and Audit Logs

| Data | Retention Period | Storage | Notes |
|------|-----------------|---------|-------|
| Admin action logs | 5 years | `admin_logs` table | Required for audit compliance |
| Authentication events | 2 years | Supabase Auth logs | Login, logout, password reset |
| API access logs | 1 year | Vercel function logs | Request/response metadata (no body) |

**Rationale:** Admin logs provide an audit trail for all administrative actions (user verification, load removal, subscription changes). The 5-year retention aligns with general corporate audit requirements in Argentina.

---

### Analytics and Monitoring

| Data | Retention Period | Storage | Notes |
|------|-----------------|---------|-------|
| PostHog events | 2 years | PostHog Cloud | Product analytics, funnel tracking, feature usage |
| Sentry error events | 90 days | Sentry Cloud | Unhandled exceptions, breadcrumbs, stack traces |
| Vercel function logs | 1 hour (Hobby) / 3 days (Pro) | Vercel | Stdout/stderr from serverless functions |

**Note:** PostHog and Sentry retention is governed by their respective platform policies and plan tiers. The values above reflect the configured retention for CarGA's accounts.

---

### Session and Authentication Data

| Data | Retention Period | Storage | Notes |
|------|-----------------|---------|-------|
| JWT access tokens | 1 hour | Client-side (memory/cookie) | Expires automatically, refreshable |
| Refresh tokens | 7 days | Supabase Auth | Rotated on use |
| Session metadata | Duration of session | Supabase Auth | IP, user agent logged for security |

**Security note:** JWTs are stateless and expire automatically. Supabase handles refresh token rotation. On logout, the refresh token is revoked server-side.

---

### Backup Retention

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Daily database backup | Every 24 hours | 30 days | Supabase (automatic) |
| Weekly database backup | Every 7 days | 1 year | Supabase (Pro plan) / Manual export to object storage |
| Point-in-time recovery (PITR) | Continuous | 7 days (Pro plan) | Supabase WAL archiving |

---

## Data Protection Compliance

### Ley 25.326 (Argentina)

Argentina's Personal Data Protection Law (Ley 25.326) establishes the following rights that CarGA must support:

| Right | Implementation |
|-------|---------------|
| **Access** | Users can view all their personal data via their profile page and a data export endpoint |
| **Rectification** | Users can update their profile data at any time |
| **Deletion** | Users can request account deletion; processed within 30 days |
| **Data portability** | Users can request a full data export in JSON format via `/api/user/export` |
| **Consent** | Registration requires explicit consent to data processing terms |

### Data Export Format

When a user requests a data export, the system generates a JSON file containing:

```json
{
  "user": { "email": "...", "role": "...", "created_at": "..." },
  "profile": { "nombre": "...", "cuit": "...", "..." },
  "trucks": [ { "patente": "...", "..." } ],
  "loads": [ { "descripcion_carga": "...", "..." } ],
  "applications": [ { "load_id": "...", "estado": "...", "..." } ],
  "ratings_given": [ { "score": 5, "..." } ],
  "ratings_received": [ { "score": 4, "..." } ],
  "notifications": [ { "titulo": "...", "..." } ],
  "subscription": { "plan": "...", "estado": "...", "..." }
}
```

### Data Deletion Process

1. User submits deletion request via profile settings or email to support
2. System marks account as `pending_deletion` with a 30-day countdown
3. User receives confirmation email with cancellation instructions
4. After 30 days:
   - Personal data (name, CUIT, phone, email) is permanently deleted
   - Auth record is removed from Supabase Auth
   - Loads are anonymized (cargador_id/transportista_id replaced with system placeholder)
   - Financial records are retained per BCRA/UIF requirements (10 years)
   - Ratings given are anonymized; ratings received are deleted
5. Deletion is logged in `admin_logs` for audit compliance

---

## Data Classification

| Classification | Examples | Handling |
|---------------|----------|----------|
| **Public** | Load postings (when estado = 'publicada'), ratings, aggregate stats | Visible to all authenticated users |
| **Internal** | User profiles, truck details, application history | Visible to the owning user + admin |
| **Confidential** | CUIT numbers, financial data, admin logs | Encrypted at rest, restricted access |
| **Restricted** | Passwords, API keys, JWT secrets | Never stored in plaintext, never logged |

---

## Scheduled Cleanup Jobs

| Job | Frequency | Action |
|-----|-----------|--------|
| Archive old notifications | Weekly | Move notifications > 90 days to archive |
| Process deletion requests | Daily | Delete accounts past 30-day grace period |
| Clean expired sessions | Handled by Supabase Auth | Automatic |
| Purge old error logs | Monthly | Remove Sentry events > 90 days (managed by Sentry) |

---

## Review Schedule

This data retention policy is reviewed:
- **Quarterly** by the engineering team
- **Annually** by legal counsel for regulatory compliance
- **Immediately** when Argentine data protection regulations change
