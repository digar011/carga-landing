# Contributing to CarGA

Thank you for your interest in contributing to CarGA. This guide covers our engineering standards, workflow, and best practices. All contributors must follow these guidelines — they are non-negotiable across all Codexium projects.

## Getting Started

1. Read the [README.md](README.md) for project overview
2. Read the [ONBOARDING.md](ONBOARDING.md) for setup instructions
3. Read the [CLAUDE.md](CLAUDE.md) for AI-assisted development rules
4. Pick a task from [TODO.md](TODO.md) — start with `[S]` (small) tasks

## Development Workflow

### Branch Strategy

```
main              ← production, always stable
develop           ← integration branch
feature/<name>    ← new features
fix/<name>        ← bug fixes
hotfix/<name>     ← urgent production fixes
```

**Never push directly to `main` or `develop`.** Always use pull requests.

### Creating a Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. Write your code following the standards below
2. Run quality checks before committing:
   ```bash
   make ci    # lint + typecheck + test + build
   ```
3. Commit with Conventional Commits (see below)
4. Push and open a PR against `develop`

## Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `test` | Adding or updating tests |
| `chore` | Build tools, dependencies, configs |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

### Examples

```
feat(loads): add real-time filtering to load board
fix(auth): resolve session conflict on role switch
docs(readme): update test account credentials
chore(deps): upgrade supabase-js to 2.x
test(loads): add E2E test for load posting flow
refactor(lib): extract WhatsApp message builder
```

## Code Standards

### TypeScript

- **`strict: true`** — non-negotiable
- **No `any`** without an explicit justification comment
- **Types use T-prefix**: `TUser`, `TLoad`, `TProfile`
- **Files use kebab-case**: `load-card.tsx`, `use-loads.ts`
- **Components use PascalCase**: `LoadCard`, `MapView`

### React / Next.js

- **Server components by default** — only add `'use client'` when you need interactivity
- **Mobile-first CSS** — design at 375px, then scale up
- **All user-facing text in Argentine Spanish** (voseo: "vos", "publicá", "encontrá")
- Use `@/` path alias for all imports

### Supabase

- **RLS on every table** — never disable, not even for convenience
- **Never use service role key client-side** — only in server components or API routes
- **All schema changes via migrations** — never edit production directly
- **Never store secrets in localStorage** — use httpOnly cookies via Supabase Auth

### API Routes

- Standard response format:
  ```typescript
  // Success
  { success: true, data: { ... } }

  // Error
  { success: false, error: { code: 'ERROR_CODE', message: 'Human-readable message in Spanish' } }
  ```
- Proper HTTP status codes: 200, 201, 400, 401, 403, 404, 500
- Validate all input with Zod schemas
- Every route has try/catch error handling

### CSS / Tailwind

- Use Tailwind utility classes — no custom CSS unless absolutely necessary
- Use CarGA design tokens: `navy`, `gold`, `brand-blue`, `brand-green`
- Test at: 375px (mobile), 768px (tablet), 1280px (desktop)

### Security

- **Never hardcode secrets** — environment variables only
- **Validate all user input** — Zod schemas on client AND server
- **Sanitize outputs** — use `sanitizeHtml()` from `@/lib/security/sanitize`
- **Run `pnpm audit`** before every release
- See [SECURITY.md](SECURITY.md) for vulnerability reporting

## Pull Request Process

### PR Requirements

Every PR must include:

1. **Title**: follows conventional commit format
2. **Description**: what changed and why
3. **How to test**: steps to verify the change
4. **Screenshots**: if any UI changed (mobile + desktop)
5. **Passes CI**: lint + typecheck + tests + build

### PR Template

```markdown
## What changed
<Brief description>

## Why
<Motivation / ticket reference>

## How to test
1. Step one
2. Step two
3. Expected result

## Screenshots
<If UI changed>

## Checklist
- [ ] Tests added/updated
- [ ] Lint passes (`pnpm lint`)
- [ ] TypeScript passes (`pnpm typecheck`)
- [ ] Build passes (`pnpm build`)
- [ ] Documentation updated if needed
```

### Review Process

- PRs are reviewed within 24 hours
- Approve only when all checks pass
- Every review checks: correctness, tests, security, performance, readability
- Squash merge to `develop` after approval

## Testing Requirements

### Unit Tests (Vitest)

- Test all utility functions and business logic
- Test all Zod validation schemas
- Target 80%+ coverage on `lib/`, `utils/`, `hooks/`
- Run: `pnpm test`

### E2E Tests (Playwright)

- Test all user-facing flows
- Test at mobile (375px) and desktop (1280px) viewports
- Test security headers and secret exposure
- Run: `pnpm test:e2e`

### Before Every Commit

```bash
make ci    # Runs: lint → typecheck → test → build
```

If `make ci` passes locally, it passes in CI.

## Adding Dependencies

- **Do NOT add packages without explicit approval** from the project lead
- Prefer well-maintained, actively updated packages
- Pin exact versions in production
- Run `pnpm audit` after adding any dependency
- Document why the dependency is needed in the PR description

## Documentation

Every change must be reflected in documentation:

- **CHANGELOG.md** — what changed, why, and outcome
- **TODO.md** — mark tasks complete with date
- **README.md** — if setup/usage changed
- **ONBOARDING.md** — if developer workflow changed
- **docs/** — if architecture or systems changed

## Questions?

- Read the docs in `docs/` folder first
- Check existing issues and PRs
- Open an issue for discussion before starting large changes
- Contact the project lead for urgent questions

---

*These standards are the source of truth for all CarGA contributions. Following them is mandatory.*
