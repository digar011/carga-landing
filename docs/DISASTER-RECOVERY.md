# Disaster Recovery Plan

> **Project:** CarGA — Argentina's first digital load board
> **Last updated:** 2026-03-26
> **RTO (Recovery Time Objective):** 1 hour
> **RPO (Recovery Point Objective):** 24 hours (daily backup)

---

## Overview

This document defines the disaster recovery procedures for CarGA. The platform runs on two managed services (Vercel for compute, Supabase for database/auth), both of which provide built-in redundancy and recovery mechanisms. This plan covers how to respond to outages, data loss, and other failure scenarios.

---

## Architecture Recovery Summary

| Component | Provider | Backup Method | Recovery Method | RTO |
|-----------|----------|--------------|-----------------|-----|
| Frontend + API | Vercel | Git repository (source of truth) | Instant rollback or redeploy | < 5 min |
| Database | Supabase | Daily backups + PITR (Pro) | Restore from backup | < 1 hour |
| Auth (users/sessions) | Supabase Auth | Included in DB backup | Restored with database | < 1 hour |
| File storage (avatars) | Supabase Storage | Included in project backup | Restored with project | < 1 hour |
| DNS | Domain registrar | NS records at registrar | Update DNS records | < 1 hour |
| Environment secrets | Vercel + Supabase | Documented in `.env.example` | Re-enter in dashboards | 15 min |

---

## Backup Strategy

### Supabase Database

| Backup Type | Frequency | Retention | Plan |
|-------------|-----------|-----------|------|
| Automatic daily backup | Every 24 hours | 30 days | Free + Pro |
| Point-in-time recovery (PITR) | Continuous (WAL archiving) | 7 days | Pro plan only |
| Manual dump | On demand | As long as stored | Any |

#### Manual backup command

```bash
# Full database dump
supabase db dump -f backup_$(date +%Y%m%d).sql

# Data-only dump (no schema)
supabase db dump -f data_$(date +%Y%m%d).sql --data-only

# Schema-only dump
supabase db dump -f schema_$(date +%Y%m%d).sql --schema-only
```

Store manual backups in a secure location outside Supabase (e.g., encrypted S3 bucket, Google Cloud Storage).

### Vercel (Application Code)

Vercel does not require traditional backups because:

- The **Git repository** is the source of truth for all application code
- Every deployment is **immutable** — previous deployments can be promoted instantly
- Vercel retains all deployment artifacts indefinitely (on paid plans)

### Environment Variables

Environment variables are stored in Vercel and Supabase dashboards. They are **not** backed up automatically.

- Maintain an up-to-date `.env.example` in the repository (no real values)
- Store actual production secrets in a password manager (e.g., 1Password, Bitwarden)
- Document where each secret is obtained (see `docs/DEPLOYMENT.md`)

---

## Failure Scenarios and Response Procedures

### Scenario 1: Vercel Outage (Frontend/API down)

**Symptoms:** Website unreachable, API returning 502/503, Vercel status page shows incident.

**Response:**

1. Check [status.vercel.com](https://status.vercel.com) to confirm it is a Vercel-side issue
2. If Vercel is down globally, there is no immediate workaround — wait for their resolution
3. If the issue is specific to the deployment:
   - Go to Vercel dashboard > Deployments
   - Promote a previous working deployment to production
4. Communicate to users via social media / WhatsApp that the platform is temporarily unavailable
5. Monitor Vercel status page for resolution
6. After recovery, check Sentry for any errors that occurred during the outage

**Estimated recovery:** 5 minutes (if deployment-specific), variable (if Vercel global outage).

---

### Scenario 2: Supabase Outage (Database/Auth down)

**Symptoms:** Login fails, load board shows empty, API returns 500 errors referencing database connection.

**Response:**

1. Check [status.supabase.com](https://status.supabase.com) to confirm it is a Supabase-side issue
2. If Supabase is down:
   - The frontend will still serve cached/static pages
   - API routes that depend on the database will fail gracefully with error messages
   - No action required — wait for Supabase resolution
3. If the issue is specific to the project:
   - Check Supabase dashboard > Logs for error details
   - Check if connection pool is exhausted (max connections reached)
   - If the project is paused, restore it: `supabase projects restore --project-ref your-ref`
4. After recovery:
   - Verify auth is working (test login)
   - Verify realtime subscriptions reconnect
   - Check for data consistency issues

**Estimated recovery:** Variable (depends on Supabase).

---

### Scenario 3: Database Corruption or Accidental Data Deletion

**Symptoms:** Missing data, inconsistent records, broken foreign key relationships.

**Response (Point-in-Time Recovery — Pro plan):**

1. Identify the timestamp just **before** the corruption occurred
2. In Supabase dashboard, go to **Database > Backups > Point in Time**
3. Select the target recovery timestamp
4. Supabase creates a new project branch with the restored data
5. Verify the restored data is correct
6. Promote the restored branch to production

**Response (Daily Backup Restore — Free plan):**

1. Go to Supabase dashboard > **Database > Backups**
2. Download the most recent daily backup before the incident
3. Create a new Supabase project (or use a staging project)
4. Restore the backup:
   ```bash
   psql -h db.new-project.supabase.co -U postgres -d postgres < backup.sql
   ```
5. Verify the data
6. Update environment variables to point to the new project
7. Redeploy on Vercel

**Response (Partial data loss — targeted recovery):**

If only specific tables are affected:

1. Dump the affected tables from the backup
2. Restore only those tables to the production database
3. Re-run any relevant triggers to ensure data consistency

**Estimated recovery:** 30–60 minutes.

---

### Scenario 4: Bad Deployment (Application Bug in Production)

**Symptoms:** New errors in Sentry, broken functionality, user reports.

**Response:**

1. **Immediate:** Roll back to the previous deployment in Vercel
   - Dashboard > Deployments > Previous deployment > Promote to Production
   - This takes effect in seconds
2. **Investigate:** Review the failing commit/PR for the root cause
3. **Fix:** Create a hotfix branch, fix the issue, run full CI (`make ci`)
4. **Deploy:** Merge the fix to `main` and let Vercel auto-deploy
5. **Verify:** Monitor Sentry for 30 minutes post-fix

**Estimated recovery:** < 5 minutes (rollback), variable for fix.

---

### Scenario 5: Bad Database Migration

**Symptoms:** Application errors related to missing columns/tables, type mismatches, broken queries.

**Response:**

1. **Immediate:** Roll back the Vercel deployment to the version before the migration-dependent code was deployed
2. **Write a reverse migration:** Create a new migration file that undoes the problematic changes
   ```bash
   # Create reverse migration
   supabase migration new reverse_bad_migration
   # Edit the file with reversal SQL
   supabase db push
   ```
3. **If reversal is not possible:** Restore from backup (see Scenario 3)
4. **Verify:** Test the application against the restored schema
5. **Post-mortem:** Document what went wrong and update the migration testing process

**Prevention:**
- Always test migrations on a Supabase branch or staging project first
- Review migration SQL carefully before applying to production
- Never drop columns or tables without verifying no code depends on them

**Estimated recovery:** 15–60 minutes.

---

### Scenario 6: Compromised Secrets (API Keys, Tokens Exposed)

**Symptoms:** Unusual API usage, unauthorized access, secret detected in public repository.

**Response:**

1. **Immediately rotate all compromised secrets:**
   - Supabase: Regenerate `anon_key` and `service_role_key` in dashboard
   - Google: Revoke and recreate OAuth credentials and Maps API key
   - WhatsApp: Regenerate access token in Meta Business Suite
   - MercadoPago: Regenerate credentials in developer portal
   - Resend: Revoke and create new API key
   - Sentry: Rotate auth token
2. **Update environment variables** in Vercel dashboard with new values
3. **Redeploy** to pick up new environment variables: `vercel --prod`
4. **Audit access logs:**
   - Check Supabase logs for unauthorized queries
   - Check admin_logs table for suspicious admin actions
   - Review Sentry for unusual error patterns
5. **If secrets were committed to Git:**
   - Remove from the repository
   - Use BFG Repo Cleaner to purge from Git history
   - Force push the cleaned history
6. **Notify affected users** if any user data was potentially exposed

**Estimated recovery:** 15–30 minutes for rotation, variable for audit.

---

### Scenario 7: DNS / Domain Issues

**Symptoms:** `carga.com.ar` not resolving, SSL certificate errors.

**Response:**

1. Check domain registrar for DNS record status
2. Verify Vercel DNS records are correct:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
3. If SSL certificate expired:
   - Vercel auto-renews Let's Encrypt certificates
   - Force renewal: remove and re-add the domain in Vercel settings
4. If domain expired: renew at the registrar immediately
5. DNS propagation can take up to 48 hours — use a temporary URL in the meantime

**Estimated recovery:** Minutes to hours depending on DNS propagation.

---

### Scenario 8: Third-Party Service Outage

| Service | Impact | Fallback |
|---------|--------|----------|
| Google Maps | Map view unavailable | Load board list view still works |
| WhatsApp Business API | No WhatsApp notifications | In-app notifications continue working |
| MercadoPago | Payments fail | Users can continue using free tier; subscriptions grace period |
| Resend | Emails not sent | In-app notifications; manual follow-up |
| PostHog | Analytics stop collecting | No user-facing impact |
| Sentry | Error tracking paused | Console logs still captured in Vercel |

**Response:** Monitor the third-party service status page, communicate delays to users if needed, and wait for resolution. No data loss occurs from third-party outages.

---

## Recovery Time and Point Objectives

| Metric | Target | Justification |
|--------|--------|---------------|
| **RTO** (Recovery Time Objective) | 1 hour | Maximum acceptable downtime before business impact becomes significant |
| **RPO** (Recovery Point Objective) | 24 hours | Daily backups mean up to 24 hours of data could be lost in worst case |
| **RPO with PITR** (Pro plan) | Minutes | Point-in-time recovery allows restoring to within minutes of failure |

### Priority Order for Recovery

1. **Authentication** — Users must be able to log in
2. **Load board (read)** — Users must see available loads
3. **Load creation** — Shippers must be able to post loads
4. **Applications** — Carriers must be able to apply
5. **Notifications** — Can be delayed
6. **Payments** — Can use grace period
7. **Admin dashboard** — Lowest priority

---

## Contact Escalation

### Internal Team

| Role | Contact | When to contact |
|------|---------|-----------------|
| Lead Developer | (defined in team contacts) | Any production incident |
| Project Owner | Diego (CEO, Codexium) | Major outage > 30 min, data loss, security breach |

### External Support

| Service | Support Channel | Response Time |
|---------|----------------|---------------|
| Supabase | support@supabase.io or dashboard chat | < 24 hours (Pro), < 4 hours (Enterprise) |
| Vercel | vercel.com/support or support@vercel.com | < 24 hours (Pro), < 1 hour (Enterprise) |
| Google Cloud | console.cloud.google.com/support | Varies by plan |
| Meta (WhatsApp) | business.facebook.com/support | 24–48 hours |
| MercadoPago | developers.mercadopago.com | 24–48 hours |

---

## Post-Incident Process

After every incident:

1. **Incident report:** Document what happened, timeline, impact, and resolution
2. **Root cause analysis:** Identify the underlying cause (not just symptoms)
3. **Action items:** Define preventive measures with owners and deadlines
4. **Update this document:** If the incident revealed gaps in the DR plan
5. **Update CHANGELOG.md:** Record the incident and resolution
6. **Communicate:** Notify affected users if there was data loss or extended downtime

---

## DR Testing Schedule

| Test | Frequency | Description |
|------|-----------|-------------|
| Backup restore test | Quarterly | Restore a database backup to a staging project and verify data integrity |
| Deployment rollback test | Monthly | Practice rolling back a Vercel deployment |
| Secret rotation drill | Quarterly | Practice rotating all secrets and redeploying |
| Full DR simulation | Annually | Simulate a complete database loss and recover from backup |

---

## Runbook: Quick Reference

### Roll back a Vercel deployment

```
1. Go to vercel.com > Project > Deployments
2. Find the last working deployment
3. Click ••• > Promote to Production
4. Verify the site is working
```

### Restore Supabase database from backup

```
1. Go to supabase.com > Project > Database > Backups
2. Select the backup to restore
3. Click Restore (creates a branch — Pro plan)
4. Verify data integrity
5. Promote the restored branch
```

### Rotate Supabase API keys

```
1. Go to supabase.com > Project > Settings > API
2. Click "Regenerate" on the anon key and service role key
3. Update NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in Vercel
4. Redeploy: vercel --prod
5. Verify auth still works
```

### Emergency manual deployment

```bash
# If GitHub Actions or auto-deploy is broken
git clone https://github.com/your-org/carga-landing.git
cd carga-landing
pnpm install
pnpm build
vercel --prod
```
