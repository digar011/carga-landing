# CLAUDE.md — CarGA Landing Page

## Project Overview
CarGA is Argentina's first digital load board platform connecting truck operators (transportistas) with shippers (cargadores). This project is the pre-launch landing page + interactive prototype for investor demos.

## Tech Stack
- **Single HTML files** — no frameworks, no build steps
- Vanilla CSS + vanilla JavaScript only
- Google Fonts (Inter) as only external dependency
- Deployable to any static host (Vercel, Netlify, Cloudflare Pages)

## Files
| File | Purpose |
|------|---------|
| `index.html` | Production landing page with waitlist signup form |
| `prototype.html` | 8-screen interactive mobile app prototype for investor demos |

## Design System
| Token | Value |
|-------|-------|
| Primary (Navy) | `#1A3C5E` |
| Accent (Gold) | `#C9922A` |
| Blue | `#2563A8` |
| Green | `#16A34A` |
| Background | `#FFFFFF` (landing), `#F5F7FA` (prototype cards) |
| Font | Inter 400/500/600/700/800 |

## Development Commands
```bash
# Lint HTML
npx htmlhint index.html prototype.html

# Run E2E tests
npx playwright test

# Open locally
open index.html
```

## Key Decisions
- All data stored in localStorage (no backend yet)
- Waitlist counter starts from base of 47 to feel populated
- Prototype uses emoji as icons (no icon library dependency)
- Spanish language throughout — Argentine Spanish (vos conjugation)

## Rules
- No external JS/CSS libraries
- No build step required
- Must work when opened as `file://` in browser
- Mobile-first responsive design
- All form validation is client-side only
