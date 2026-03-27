# Test Summary and Coverage Report

> CarGA has 246 tests: 121 unit tests (Vitest) and 125 E2E tests (Playwright). All passing.

## Overview

| Category | Framework | Test Count | Suites |
|----------|-----------|------------|--------|
| Unit | Vitest | 121 | 5 |
| E2E | Playwright | 125 | 9 |
| **Total** | | **246** | **14** |

## Unit Tests (Vitest)

121 tests across 5 test suites. Target coverage: 80%+.

### Suite Breakdown

| Suite | File | Tests | What It Covers |
|-------|------|-------|----------------|
| Format utilities | `format.test.ts` | 26 | `formatARS` (currency), `formatDistance` (km), `formatRelativeTime` (relative dates), `formatDate` (absolute dates), `formatRating` (stars), `getInitials` (avatar initials) |
| Validations | `validations.test.ts` | 44 | All 7 Zod schemas: login, register, load creation, application, rating, profile update, truck registration |
| CUIT utilities | `cuit.test.ts` | 13 | `isValidCuitFormat` (Argentine tax ID format validation), `formatCuit` (formatting with dashes) |
| Plans | `plans.test.ts` | 18 | `checkPlanLimit` (free tier enforcement), `getPlansForRole` (role-specific plan lists), `formatPlanPrice` (ARS price formatting) |
| Constants | `constants.test.ts` | 20 | `PROVINCIAS` (24 Argentine provinces), `TRUCK_TYPE_LABELS`, `CARGO_TYPE_LABELS`, `LOAD_STATUS_LABELS` (enum display labels) |

### Key Coverage Areas

- **Input validation:** Every Zod schema is tested with valid input, invalid input, edge cases, and boundary values
- **Formatting:** Currency formatting with Argentine peso conventions, distance with proper units, relative time in Spanish
- **Business logic:** Plan limits per tier, role-based plan availability, CUIT format validation per AFIP standards
- **Constants integrity:** All enum labels map correctly, all 24 provinces present, no missing entries

## E2E Tests (Playwright)

125 tests across 9 test suites. Run against Chromium.

### Suite Breakdown

| Suite | File | Tests | What It Covers |
|-------|------|-------|----------------|
| Home / Landing | `app-home.spec.ts` | 16 | Landing page renders, hero section content, stats counter, meta tags (title, description, OG), responsive layout at 375px/768px/1280px |
| Authentication | `app-auth.spec.ts` | 22 | Login form, register form, role selection (transportista/cargador), form validation errors, password requirements, email format validation |
| Security | `app-security.spec.ts` | 11 | Security headers (CSP, X-Frame-Options, HSTS), no secrets in HTML source, autocomplete attributes on password fields, `lang` attribute on `<html>` |
| Navigation | `app-navigation.spec.ts` | 12 | Route accessibility, link destinations, viewport-specific navigation (mobile hamburger menu, desktop nav bar) |
| Admin | `app-admin.spec.ts` | 9 | Admin pages load correctly (`/a-panel`, `/a-usuarios`, `/a-cargas`, `/a-reportes`), admin-only access enforcement |
| Profiles | `app-profiles.spec.ts` | 10 | Profile pages render, CUIT verification widget, pricing/plans pages, profile edit form |
| Loads | `app-loads.spec.ts` | 10 | Load board page, load publish form, "mis cargas" (my loads) page, interactive map page |
| Landing (static) | `landing.spec.ts` | 20 | Static landing page contact form, form field validation, animated counter, responsive design, CTA buttons |
| Prototype | `prototype.spec.ts` | 19 | All 8 prototype screens render correctly, navigation between screens, UI element presence |

### Key Coverage Areas

- **User flows:** Registration through role selection, load posting, application workflow
- **Security:** CSP headers present, no leaked environment variables, proper autocomplete attributes
- **Responsive:** Tests at mobile (375px), tablet (768px), and desktop (1280px) viewports
- **SEO:** Meta tags, Open Graph tags, semantic HTML, `lang` attribute
- **Admin:** Protected routes, dashboard pages, user management

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test
# or
make test

# Run with coverage report (fails if below 80%)
pnpm test:coverage
# or
make test-coverage

# Run a specific test file
pnpm test format.test

# Run in watch mode during development
pnpm test -- --watch
```

### E2E Tests

```bash
# First-time setup: install Playwright browsers
make e2e-install

# Run all E2E tests (headless)
pnpm test:e2e
# or
make e2e

# Run a specific E2E suite
npx playwright test app-home

# Run with browser visible (headed mode)
npx playwright test --headed

# View the HTML test report
npx playwright show-report
```

### Full CI Pipeline

```bash
# Runs lint + typecheck + test + build
make ci
```

## Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| Line coverage | 80%+ | Passing |
| Branch coverage | 80%+ | Passing |
| Function coverage | 80%+ | Passing |
| Statement coverage | 80%+ | Passing |

Coverage is enforced by the `test-coverage` target. The CI pipeline runs unit tests (without coverage threshold) as part of `make ci`. Use `make test-coverage` to verify coverage locally before a release.

## CI Integration

All tests run automatically on every push and pull request via GitHub Actions:

```yaml
# Simplified CI workflow
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

E2E tests run in a separate job with Playwright installed:

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install chromium --with-deps
      - run: pnpm test:e2e
```

## Adding New Tests

### Unit Tests

1. Create or update a test file in `tests/` (e.g., `tests/new-util.test.ts`)
2. Follow the existing pattern: `describe` block per function, `it` blocks per case
3. Run `pnpm test` to verify
4. Run `make test-coverage` to check coverage

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/utils/my-util';

describe('myFunction', () => {
  it('should handle valid input', () => {
    expect(myFunction('valid')).toBe('expected');
  });

  it('should throw on invalid input', () => {
    expect(() => myFunction('')).toThrow();
  });
});
```

### E2E Tests

1. Create or update a spec file in `tests/e2e/` (e.g., `tests/e2e/app-new-feature.spec.ts`)
2. Use Playwright page objects when interacting with complex pages
3. Test at multiple viewports for responsive behavior
4. Run `make e2e` to verify

```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test('should render the feature page', async ({ page }) => {
    await page.goto('/new-feature');
    await expect(page.locator('h1')).toContainText('New Feature');
  });
});
```

## Test File Locations

```
tests/
  format.test.ts          # Unit: formatting utilities
  validations.test.ts     # Unit: Zod schema validation
  cuit.test.ts            # Unit: CUIT format utilities
  plans.test.ts           # Unit: plan/subscription logic
  constants.test.ts       # Unit: enum constants
  e2e/
    app-home.spec.ts      # E2E: landing page
    app-auth.spec.ts      # E2E: authentication flows
    app-security.spec.ts  # E2E: security headers/checks
    app-navigation.spec.ts # E2E: routing and navigation
    app-admin.spec.ts     # E2E: admin dashboard
    app-profiles.spec.ts  # E2E: user profiles
    app-loads.spec.ts     # E2E: load board features
    landing.spec.ts       # E2E: static landing page
    prototype.spec.ts     # E2E: prototype screens
```
