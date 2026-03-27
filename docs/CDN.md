# CDN and Static Asset Strategy

> **Project:** CarGA — Argentina's first digital load board
> **Last updated:** 2026-03-26

---

## Overview

CarGA uses Vercel as its primary CDN and hosting platform. Since the application is built on Next.js 14, Vercel's Edge Network handles static asset delivery, image optimization, and edge caching out of the box with zero additional configuration.

---

## CDN Architecture

### Vercel Edge Network

Vercel deploys the Next.js application across its global Edge Network, which provides:

- **30+ edge locations worldwide**, including South America (Sao Paulo), which serves Argentine users with low latency
- Automatic SSL/TLS termination
- HTTP/2 and HTTP/3 support
- Brotli and gzip compression
- DDoS protection at the network layer

All static pages (ISR/SSG) and assets are served from the nearest edge node. Server-rendered pages execute in the Serverless Function region closest to the user.

### Edge Regions

The Vercel project should be configured with the primary function region set to **GRU (Sao Paulo)** for optimal latency to Argentine users. Static assets are cached at all edge nodes regardless of function region.

---

## Static Assets

### `/public/images/`

All static images (logos, hero images, icons, illustrations) are stored in `/public/images/` and served directly via Vercel's CDN.

| Asset Type | Location | Format |
|------------|----------|--------|
| Logo | `/public/images/logo.png` | PNG |
| Hero images | `/public/images/hero-*.webp` | WebP |
| Icons | `/public/images/icons/` | SVG/PNG |
| Social cards | `/public/images/og-*.png` | PNG |

**Serving behavior:**
- Files in `/public/` are served at the root path (e.g., `/images/logo.png`)
- Vercel applies long-term caching headers automatically for hashed filenames
- Non-hashed files receive `Cache-Control: public, max-age=0, must-revalidate`

### Image Optimization via `next/image`

All images rendered through the `<Image>` component from `next/image` benefit from:

- **Automatic format conversion**: Serves WebP or AVIF based on the requesting browser's `Accept` header
- **Responsive sizing**: Generates multiple resolutions via `srcSet` and serves the appropriate one
- **Lazy loading**: Images below the fold are lazy-loaded by default
- **Quality optimization**: Default quality is 75 (configurable per image)
- **Caching**: Optimized images are cached at the edge with `Cache-Control: public, max-age=60, stale-while-revalidate=31536000`

**Configuration in `next.config.js`:**

```js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

---

## Font Loading

### Google Fonts (Inter) via `next/font`

The Inter font family is loaded using `next/font/google`, which:

- **Self-hosts the font files** at build time — no external request to `fonts.googleapis.com` or `fonts.gstatic.com`
- **Eliminates layout shift** (CLS) by using `font-display: swap` with a CSS `size-adjust` fallback
- **Serves subset**: Only the Latin character set is loaded (sufficient for Argentine Spanish)
- **Zero privacy concerns**: No data sent to Google at runtime

```ts
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});
```

The font files are hashed and cached indefinitely at the edge.

---

## Cache Headers Strategy

### Hashed Static Assets (JS, CSS, fonts)

```
Cache-Control: public, max-age=31536000, immutable
```

Next.js generates hashed filenames for all JS and CSS bundles (e.g., `_next/static/chunks/abc123.js`). These are immutable — the hash changes when the content changes, so they can be cached forever.

### Optimized Images (`/_next/image`)

```
Cache-Control: public, max-age=60, stale-while-revalidate=31536000
```

Optimized images are fresh for 60 seconds, then served stale while revalidating in the background. This ensures fast delivery while keeping images reasonably up to date.

### HTML Pages (SSR / ISR)

```
Cache-Control: s-maxage=1, stale-while-revalidate
```

Server-rendered pages are cached briefly at the edge and revalidated on subsequent requests. ISR pages use the `revalidate` value configured per page.

### API Routes

```
Cache-Control: no-store, no-cache, must-revalidate
```

All API routes under `/api/` return dynamic data and must not be cached. The default Vercel behavior for serverless functions is no caching.

### Custom Cache Headers

Additional cache headers can be configured in `next.config.js`:

```js
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400, stale-while-revalidate=604800',
        },
      ],
    },
  ];
},
```

---

## Security Headers

The following security-related headers are set via middleware and `next.config.js`:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `Content-Security-Policy` | Configured per source type | Prevent XSS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer leakage |

---

## Third-Party Asset Loading

| Service | Loading Method | CDN Hit? |
|---------|---------------|----------|
| Inter font | `next/font` (self-hosted at build) | No external CDN |
| Google Maps | Dynamic `<Script>` tag | Yes — `maps.googleapis.com` |
| Mercado Pago SDK | Dynamic script injection | Yes — `sdk.mercadopago.com` |
| PostHog | JS snippet | Yes — `us.i.posthog.com` |
| Sentry | NPM package (bundled) | No external CDN |

Google Maps and Mercado Pago are the only runtime external CDN dependencies. Both are loaded dynamically and do not block initial page render.

---

## Performance Metrics

Target Core Web Vitals for CDN-served pages:

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | Edge-cached pages, optimized images, self-hosted fonts |
| FID (First Input Delay) | < 100ms | Code splitting, lazy loading, minimal JS on landing |
| CLS (Cumulative Layout Shift) | < 0.1 | `next/font` size-adjust, explicit image dimensions |
| TTFB (Time to First Byte) | < 200ms | Sao Paulo edge node, ISR caching |

---

## Future Considerations

### Cloudflare (Additional Layer)

If the platform scales significantly or faces targeted attacks, consider adding Cloudflare in front of Vercel:

- **Additional DDoS protection**: Cloudflare's WAF and Bot Management
- **Argentine edge nodes**: Cloudflare has a point of presence in Buenos Aires (closer than Sao Paulo)
- **Rate limiting at the edge**: Offload rate limiting from serverless functions
- **Custom rules**: Geo-blocking, IP allowlists for admin routes

**Trade-offs:**
- Added complexity in DNS and SSL configuration
- Double-proxying can add slight latency if misconfigured
- Cost: Cloudflare Pro starts at $20/month

### Image CDN (Alternative)

If image optimization costs become significant on Vercel, consider:
- **Cloudinary** or **imgix** for heavy image processing workloads
- **Supabase Storage CDN** for user-uploaded content (avatars, truck photos)

### Service Worker Caching

For the mobile-heavy Argentine trucker audience:
- Implement a service worker for offline-first caching of the load board
- Cache API responses for recently viewed loads
- This aligns with the PWA strategy planned for Phase 2
