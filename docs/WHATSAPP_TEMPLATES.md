# WhatsApp Business API — Template Approval Guide

> **Status:** Templates defined and awaiting Meta approval
> **Action Required:** Submit templates to Meta Business Manager
> **Timeline:** 24-48 hours typical approval time

---

## Overview

CarGA uses 5 WhatsApp message templates to notify transportistas of platform events. All templates are **pre-registered with Meta** and require approval before sending in production.

Templates are defined in [lib/whatsapp/templates.ts](../lib/whatsapp/templates.ts) and follow Meta's WhatsApp Business API naming conventions.

---

## Template Specifications

### 1. **carga_nueva** — New Matching Load Alert

**Purpose:** Notify transportista when a new load matches their profile (truck type, province, plan eligibility)

**Language:** Spanish (Argentina) — `es_AR`

**Template Body:**
```
¡Nueva carga disponible para vos! 🚚

📍 Ruta: {{1}} → {{2}}
💰 Tarifa: {{3}}

Entrá a CarGA y postulate a esta carga.
```

**Parameters:**
- `{{1}}` — Origin city/province (e.g., "Buenos Aires, Buenos Aires")
- `{{2}}` — Destination city/province (e.g., "Córdoba, Córdoba")
- `{{3}}` — Freight rate in ARS (e.g., "$15.000")

**Frequency:** Max 1 per transportista per hour (rate limited)

---

### 2. **postulacion_aceptada** — Application Accepted

**Purpose:** Notify transportista that their application to a load was accepted

**Language:** Spanish (Argentina) — `es_AR`

**Template Body:**
```
¡Felicidades! Tu postulación fue aceptada 🎉

Cargador: {{1}}
Ruta: {{2}}

Contactate con el cargador para coordinar pickup.
```

**Parameters:**
- `{{1}}` — Shipper company name (e.g., "Transportes García S.A.")
- `{{2}}` — Route description (e.g., "Buenos Aires → Córdoba")

---

### 3. **postulacion_rechazada** — Application Rejected

**Purpose:** Notify transportista that their application was not selected

**Language:** Spanish (Argentina) — `es_AR`

**Template Body:**
```
Tu postulación para la ruta {{1}} no fue seleccionada en esta oportunidad.

¡Seguí buscando! Hay muchas más cargas esperándote en CarGA. 💪
```

**Parameters:**
- `{{1}}` — Route description (e.g., "Buenos Aires → Rosario")

---

### 4. **estado_carga** — Load Status Update

**Purpose:** Notify transportista of status changes on assigned loads

**Language:** Spanish (Argentina) — `es_AR`

**Template Body:**
```
Actualización de estado en tu carga 📦

Estado: {{1}}
Ruta: {{2}}

Revisa los detalles en CarGA.
```

**Parameters:**
- `{{1}}` — New status in Spanish (e.g., "En camino")
- `{{2}}` — Route description

---

### 5. **bienvenida** — Welcome Message

**Purpose:** Welcome message sent after registration

**Language:** Spanish (Argentina) — `es_AR`

**Template Body:**
```
¡Bienvenido a CarGA! 🎉

Hola {{1}}, gracias por registrarte como transportista.

Ahora podés:
✓ Buscar cargas disponibles
✓ Postularte a rutas
✓ Ganar dinero 💰

¿Preguntas? Contacta a soporte: support@carga.com.ar
```

**Parameters:**
- `{{1}}` — Transportista first name

---

## Submission Process

### Step 1: Access Meta Business Manager

1. Go to [business.facebook.com](https://business.facebook.com)
2. Log in with your Meta Business Account
3. Navigate to **WhatsApp Manager** → **Message Templates**

### Step 2: Create Each Template

For each template above:

1. Click **Create Template**
2. Enter:
   - **Template Name** — Use exact names from specs (e.g., `carga_nueva`)
   - **Language** — Select `Spanish (Argentina)` or `es_AR`
   - **Category** — Select `ALERT` or `TRANSACTIONAL` (not `MARKETING`)
   - **Template Body** — Copy exact text with parameter placeholders (`{{1}}`, `{{2}}`, etc.)
3. Click **Submit for Review**

### Step 3: Monitor Approval Status

- Templates will show **Pending** while Meta reviews (24-48 hours typical)
- Once approved: **Active** status displayed
- If rejected: Meta provides rejection reason — revise and resubmit

---

## Environment Configuration

Once templates are approved, configure in your `.env.production`:

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_VERIFY_TOKEN=your-custom-verify-token

# Webhook configuration
WHATSAPP_WEBHOOK_URL=https://carga.com.ar/api/webhooks/whatsapp
```

---

## Implementation Details

### Template Builders

Template parameters are built dynamically in [lib/whatsapp/templates.ts](../lib/whatsapp/templates.ts):

```typescript
export function buildNewLoadMessage(
  origen: string,
  destino: string,
  tarifa: string
): TTemplateMessage {
  return {
    templateName: 'carga_nueva',
    languageCode: 'es_AR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: origen },
          { type: 'text', text: destino },
          { type: 'text', text: tarifa },
        ],
      },
    ],
  };
}
```

### Webhook Handler

Incoming messages and delivery status updates are handled in [app/api/webhooks/whatsapp/route.ts](../app/api/webhooks/whatsapp/route.ts).

Meta POSTs to your webhook with:
- Incoming messages from users
- Message delivery status (sent, delivered, read, failed)
- Contact updates

---

## Rate Limiting

To prevent spam, WhatsApp notifications use distributed rate limiting:

- **Load alerts:** 1 per transportista per hour
- **Application updates:** No limit (user-triggered)
- **Backend:** Redis-backed limiter (production) with in-memory fallback (development)

Configure in `.env`:
```bash
REDIS_URL=redis://localhost:6379
```

---

## Testing

### Development (Non-Approved Templates)

WhatsApp notifications gracefully degrade if templates aren't approved:

```typescript
// lib/whatsapp/client.ts
if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[WhatsApp] Not configured — message not sent:', { to, templateName });
  }
  return false;
}
```

### Staging (Pre-Approved)

1. Set `WHATSAPP_ACCESS_TOKEN` and related credentials in Vercel staging environment
2. Deploy to staging
3. Post a test load and verify WhatsApp is sent to your test transportista number

### Production

1. All templates approved ✅
2. Production credentials configured in Vercel environment
3. Deploy to production
4. Monitor webhook logs: `GET /api/logs?filter=whatsapp`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Templates rejected | Check exact template text matches Meta's requirements, no promotional language |
| Messages not sent | Verify `WHATSAPP_ACCESS_TOKEN` and phone number ID are correct |
| Webhook not receiving | Confirm webhook URL is publicly accessible, token verification passes |
| Rate limit too aggressive | Adjust `RATE_LIMIT_MS` in `lib/whatsapp/matching.ts` |
| Redis not available | Falls back to in-memory limiter automatically |

---

## Next Steps

- [ ] Submit 5 templates to Meta Business Manager
- [ ] Monitor approval status (24-48 hours)
- [ ] Configure production credentials once approved
- [ ] Test on staging environment
- [ ] Deploy to production
- [ ] Monitor delivery rates and error logs

---

*Last updated: 2026-05-01*
