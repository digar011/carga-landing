# Makefile Documentation

> All development commands for CarGA in one place. No memorizing scripts — just `make <target>`.

## Quick Reference

| Target | Command | Description |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Start Next.js development server |
| `dev-static` | `npx serve public/landing -l 3001` | Serve static landing page + prototype on port 3001 |
| `build` | `pnpm build` | Production build |
| `clean` | `rm -rf .next out node_modules coverage test-results playwright-report` | Remove all build artifacts |
| `test` | `pnpm test` | Run Vitest unit tests (121 tests) |
| `test-coverage` | `pnpm test:coverage` | Tests with coverage report (80% threshold) |
| `e2e` | `pnpm test:e2e` | Run Playwright E2E tests (125 tests) |
| `e2e-install` | `npx playwright install chromium` | Install Playwright browsers (first-time setup) |
| `typecheck` | `pnpm typecheck` | TypeScript type checking (`strict: true`) |
| `lint` | `pnpm lint` | Run ESLint |
| `lint-fix` | `pnpm lint --fix` | Run ESLint with auto-fix |
| `ci` | lint + typecheck + test + build | Full CI pipeline |
| `db-push` | `supabase db push` | Apply Supabase migrations |
| `db-seed` | `supabase db seed` | Load seed data |
| `db-reset` | `supabase db reset` | Reset local database (destructive) |
| `db-types` | `pnpm db:gen-types` | Regenerate TypeScript types from database |
| `db-studio` | `supabase start` | Open Supabase Studio at `http://localhost:54323` |
| `setup-users` | `node scripts/setup-users.mjs` | Create initial admin and test users in Supabase |
| `deploy-preview` | `vercel` | Deploy preview to Vercel |
| `deploy-prod` | `vercel --prod` | Deploy to production (requires confirmation) |
| `help` | (built-in) | Show all targets with descriptions |

## Usage Examples

### Daily Development

```bash
# Start working on the project
make dev

# In a separate terminal, serve the static landing page
make dev-static
```

### Before Committing

```bash
# Run the full CI pipeline locally — must pass before pushing
make ci
```

This runs `lint`, `typecheck`, `test`, and `build` in sequence. If any step fails, the pipeline stops.

### Running Tests

```bash
# Unit tests only (fast, ~5 seconds)
make test

# Unit tests with coverage report (fails if below 80%)
make test-coverage

# E2E tests (requires Playwright browsers installed)
make e2e

# First-time E2E setup
make e2e-install
```

### Database Operations

```bash
# Apply new migrations to your local Supabase instance
make db-push

# Regenerate TypeScript types after schema changes
make db-types

# Seed the database with sample data
make db-seed

# Full reset — wipes local DB and reapplies all migrations
make db-reset

# Open Supabase Studio to inspect tables visually
make db-studio
```

### Deployment

```bash
# Deploy a preview build (generates a unique URL)
make deploy-preview

# Deploy to production (Vercel will prompt for confirmation)
make deploy-prod
```

### Clean Slate

```bash
# Remove all build artifacts, node_modules, test results
make clean

# Then reinstall and rebuild
pnpm install && make build
```

## CI/CD Integration

The `make ci` target mirrors the GitHub Actions pipeline exactly. The rule is simple:

> If `make ci` passes locally, it will pass in CI.

The CI pipeline runs these steps in order:

1. **`lint`** — ESLint checks for code quality issues
2. **`typecheck`** — TypeScript strict mode validation
3. **`test`** — 121 Vitest unit tests
4. **`build`** — Next.js production build

If any step fails, the entire pipeline stops. Fix the issue before pushing.

### GitHub Actions Equivalent

```yaml
# .github/workflows/ci.yml (simplified)
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: make ci
```

## Adding New Targets

When adding a new Makefile target:

1. Add it to the `.PHONY` declaration at the top
2. Include a `## Description` comment on the same line as the target (this powers `make help`)
3. Use `pnpm` scripts when possible, direct commands when needed

Example:

```makefile
.PHONY: new-target

new-target: ## Description shown in make help
	pnpm run new-script
```
