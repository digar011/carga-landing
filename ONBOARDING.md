# Onboarding — CarGA Landing Page

## What is CarGA?
CarGA is a digital load board (bolsa de cargas) for Argentina. It connects truck operators (transportistas) who have available trucks with shippers (cargadores) who have cargo to move. Think of it as an Uber for freight — but tailored for Argentina's trucking industry.

## Architecture
This is intentionally simple: **two static HTML files** with no build system.

- `index.html` — The public-facing landing page with a waitlist signup form
- `prototype.html` — An investor demo that simulates an 8-screen mobile app

All CSS is in `<style>` tags, all JS is in `<script>` tags. No frameworks, no bundlers.

## Why no framework?
1. Speed of deployment — drop files on any static host
2. Zero dependencies to maintain
3. Fastest possible page load for truckers on slow mobile connections
4. The landing page will eventually be replaced when the real app launches

## Key Design Decisions

### Language
Everything is in Argentine Spanish (voseo — "vos" instead of "tú"). UI copy uses Argentine conventions:
- "Publicá" not "Publica"
- "Encontrá" not "Encuentra"
- "Conectate" not "Conéctate"

### Colors
- Navy `#1A3C5E` — trust, professionalism
- Gold `#C9922A` — premium, action buttons
- Clean whites and grays — no gradients, no shadows on landing page

### Data Storage
The landing page stores waitlist signups in `localStorage` as a JSON array under the key `carga_waitlist`. The visible counter starts at a base of 47 + actual signups.

### Prototype Navigation
The prototype uses a simple screen-switching system: all 8 screens exist in the DOM, only one is visible at a time. Navigation is handled by JS functions that add/remove CSS classes with slide transitions.

## Running Locally
```bash
# Just open in browser
open index.html
open prototype.html

# Or use any local server
npx serve .
python -m http.server 8000
```

## Running Tests
```bash
npm install
npx playwright install chromium
npx playwright test
```

## Who to Contact
- **Diego** — CEO, Codexium (project owner)
