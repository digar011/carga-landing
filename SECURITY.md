# Security Policy

CarGA takes the security of its platform and users seriously. We appreciate the efforts of security researchers and the broader community in helping us maintain a secure application. This document outlines how to report vulnerabilities, our disclosure process, and the security practices we follow.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.6.x (current development) | Yes |
| < 0.6.0 | No |

Only the latest release on the `main` branch receives security updates. We recommend always running the most recent version.

## Reporting a Vulnerability

**Do NOT report security vulnerabilities through public GitHub issues, discussions, or pull requests.** Public disclosure before a fix is available puts all users at risk.

### Preferred: GitHub Private Vulnerability Reporting

Use GitHub's built-in private vulnerability reporting:

1. Go to the [CarGA repository](https://github.com/digar011/carga-landing)
2. Navigate to **Settings > Security > Private vulnerability reporting**
3. Click **Report a vulnerability**
4. Fill out the form with as much detail as possible

### Alternative: Email

Send an email to **security@codexium.ai** with the subject line `[CarGA Security] <brief description>`.

### What to Include

To help us triage and respond quickly, please include as much of the following as possible:

- **Description** of the vulnerability and its potential impact
- **Steps to reproduce** or a proof of concept (including relevant URLs, payloads, or screenshots)
- **Impact assessment** — what an attacker could achieve (data exposure, privilege escalation, denial of service, etc.)
- **Affected component** (e.g., API, web app, admin portal, authentication, Supabase RLS)
- **Affected version(s)** or commit SHA
- **Severity assessment** (your best estimate: Critical / High / Medium / Low)
- **Suggested remediation** (if you have one)

### What NOT to Do

- Do not open public GitHub issues for security vulnerabilities
- Do not exploit the vulnerability beyond what is necessary to demonstrate it
- Do not access, modify, or delete data belonging to other users
- Do not perform denial-of-service attacks against production infrastructure
- Do not test vulnerabilities against production systems without prior written permission
- Do not include real user data or credentials in your report

## Response Timeline

| Stage | Timeframe |
|-------|-----------|
| Acknowledgment | Within 48 hours of receipt |
| Initial triage and severity assessment | Within 5 business days |
| Fix for critical severity | Within 7 days of confirmation |
| Fix for high severity | Within 14 days of confirmation |
| Fix for medium/low severity | Within 30 days of confirmation |
| Public disclosure (coordinated) | After patch is released, or 90 days from report, whichever comes first |

We will keep you informed of our progress throughout the process. If we determine the report is not a valid vulnerability, we will explain our reasoning.

## What Constitutes a Security Vulnerability

We consider the following types of issues to be security vulnerabilities:

- **Authentication and authorization bypass** — accessing resources or performing actions without proper credentials or permissions
- **Injection attacks** — SQL injection, NoSQL injection, command injection, or template injection
- **Cross-site scripting (XSS)** — stored, reflected, or DOM-based
- **Cross-site request forgery (CSRF)** — unauthorized actions performed on behalf of authenticated users
- **Server-side request forgery (SSRF)** — making the server issue requests to unintended destinations
- **Sensitive data exposure** — leaking credentials, tokens, personal information, or internal system details
- **Insecure direct object references (IDOR)** — accessing other users' data by manipulating identifiers
- **Remote code execution** — executing arbitrary code on the server
- **Privilege escalation** — gaining higher access levels than intended (e.g., transportista accessing admin routes)
- **Row Level Security bypass** — accessing Supabase data outside of RLS policy scope
- **Path traversal** — accessing files or directories outside the intended scope
- **Denial of service (DoS)** — application-level vulnerabilities that cause service disruption
- **Cryptographic weaknesses** — weak algorithms, improper key management, or insecure random number generation

## Out of Scope

The following are generally **not** considered security vulnerabilities:

- Clickjacking on pages with no sensitive actions
- Missing HTTP security headers on non-sensitive pages (report these as regular issues)
- Vulnerabilities in outdated browsers or platforms
- Social engineering attacks
- Physical security attacks
- Denial of service via volumetric network attacks
- Issues that require unlikely user interaction (e.g., self-XSS)
- Reports from automated scanners without a demonstrated proof of concept
- Missing best practices without a demonstrated security impact

## Disclosure Policy

We follow a **90-day responsible disclosure** timeline:

1. Reporter submits a vulnerability through one of the channels above
2. We acknowledge receipt within 48 hours and begin triage
3. We develop and test a fix within the timelines above, depending on severity
4. We release the fix and publish a security advisory (via GitHub Security Advisories)
5. After 90 days from the initial report (or once the fix is released, whichever comes first), the reporter may publicly disclose the vulnerability

### Coordinated Disclosure

- We commit to working with reporters transparently and in good faith
- If more time is needed to develop a fix, we will request an extension and explain why
- We will not take legal action against researchers who follow this policy in good faith
- Do not disclose publicly before the agreed-upon disclosure date or the 90-day disclosure window

## Recognition

We believe in recognizing the contributions of security researchers:

- Confirmed vulnerabilities will be credited in our release notes (unless you prefer to remain anonymous)
- We maintain a **Security Hall of Fame** to acknowledge significant contributions

## Security Best Practices for Contributors

All contributors must follow these practices to maintain the security posture of the codebase:

### Secrets and Environment Variables

- **Never commit secrets** (API keys, tokens, passwords) to the repository
- Use environment variables for all sensitive configuration — `.env.local` is gitignored
- See `.env.example` for the list of required variables with placeholder values
- Super admin credentials are loaded from env vars, never hardcoded

### Input Validation

- Validate all input with **Zod schemas** — every API route must validate request bodies, query parameters, and path parameters before processing
- Never trust client-side validation alone — always validate on the server
- Use `sanitizeHtml()`, `sanitizeSearchQuery()`, and `sanitizeUserInput()` from `@/lib/security/sanitize`

### Database Access

- Use **Supabase client** exclusively — never write raw SQL in application code
- **RLS (Row Level Security)** is enabled on all 10 tables — never disable it
- Schema changes must go through migrations (`supabase migration new`)
- Use `createServerSupabaseClient()` for server-side queries (anon key)
- Use `createServiceRoleClient()` only when RLS bypass is explicitly needed (e.g., WhatsApp matching across users)

### Error Handling

- Use standard error response format: `{ success: false, error: { code, message } }`
- Never expose stack traces, internal paths, or implementation details to clients
- Use try/catch in every API route handler
- Log errors with context via `console.error` (Sentry captures these)

### Authentication

- Follow Supabase Auth patterns — never implement custom auth logic
- Middleware enforces auth on all non-public routes
- Rate limiting: 5 POST attempts per 15 min on auth routes, 60 req/min on API routes
- Google OAuth configured for transportista login

### Dependency Management

- Run `pnpm audit` before every release to check for known vulnerabilities
- Review dependency changes carefully — do not blindly merge updates
- Pin exact versions in production

## Current Security Measures

| Measure | Description |
|---------|-------------|
| **Supabase Auth** | Session-based authentication with email/password + Google OAuth |
| **Row Level Security** | Enabled on all 10 tables — users can only access own data |
| **Rate limiting** | In-memory rate limiter: 60/min API, 5/15min auth, with proper headers |
| **Input sanitization** | `sanitizeHtml`, `sanitizeSearchQuery`, `sanitizeUserInput` utilities |
| **Security headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| **Zod validation** | All API routes validate input with Zod schemas before processing |
| **Secret protection** | No API keys in client HTML (verified by E2E tests) |
| **Middleware auth** | Route-level protection with role-based access (t-/c-/a- prefixes) |
| **CUIT verification** | AFIP API validation for identity verification |
| **Audit logging** | All admin actions logged to `admin_logs` table |
| **HTTPS enforced** | HSTS header with 1-year max-age + includeSubDomains |

## Security Hall of Fame

We thank the following individuals for responsibly disclosing security vulnerabilities:

*No entries yet. Be the first!*

## Contact

- **Security vulnerabilities**: security@codexium.ai or GitHub Private Vulnerability Reporting
- **General questions**: Open a GitHub issue
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

*This security policy is effective as of March 2025 and will be reviewed quarterly.*
