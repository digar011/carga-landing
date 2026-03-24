# CarGA — La bolsa de cargas digital de Argentina

Pre-launch landing page and interactive prototype for CarGA, Argentina's first digital load board connecting truck operators with freight shippers.

## Quick Start

No build step required. Open `index.html` in any browser.

```bash
# Or serve locally
npx serve .

# Or deploy to Vercel
vercel deploy
```

## Project Structure

```
carga-landing/
├── index.html          # Production landing page (waitlist signup)
├── prototype.html      # 8-screen interactive mobile app prototype
├── tests/
│   └── e2e/
│       ├── landing.spec.ts     # Playwright tests for landing page
│       └── prototype.spec.ts   # Playwright tests for prototype
├── playwright.config.ts
├── package.json
├── CLAUDE.md           # AI development instructions
├── README.md           # This file
├── ONBOARDING.md       # New developer guide
├── PRODUCT.md          # Product specs and feature documentation
├── CHANGELOG.md        # Change log
├── TODO.md             # Task queue
└── .env.example        # Environment variables template
```

## Pages

### Landing Page (`index.html`)
- Hero section with value proposition
- Problem statement cards
- How it works (3 steps)
- Market stats / social proof
- Email waitlist signup form with localStorage persistence
- Responsive, mobile-first design

### Prototype (`prototype.html`)
- 8 interactive screens simulating the CarGA mobile app
- Phone frame on desktop, full-screen on mobile
- Slide transitions between screens
- Designed for investor demos

## Tech Stack
- Single HTML files (no frameworks)
- Vanilla CSS + vanilla JavaScript
- Google Fonts (Inter)
- No build step — deploy by dropping files on any static host

## Deployment

Works on any static hosting platform:
- **Vercel**: `vercel deploy`
- **Netlify**: drag & drop the folder
- **Cloudflare Pages**: connect repo or upload
- **GitHub Pages**: push to `gh-pages` branch

## Testing

```bash
npm install
npx playwright install
npx playwright test
```

## Environment Variables

See `.env.example` — currently none required (static site).

## License

© 2025 CarGA. All rights reserved.

Developed by [Codexium](https://codexium.ai)
