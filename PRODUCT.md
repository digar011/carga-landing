# Product Documentation — CarGA

## Product Overview
CarGA is Argentina's first digital load board platform. It connects transportistas (truck operators) with cargadores (shippers) to find and book freight in real time.

## Target Users

### Transportistas (Truck Operators)
- Independent truck drivers or small fleet operators
- Currently find loads via phone calls, WhatsApp groups, or intermediaries
- Pain: hours wasted searching, trucks traveling empty, opaque pricing
- Device: primarily mobile (Android), often on slow connections

### Cargadores (Shippers)
- Agricultural companies, manufacturers, distributors
- Need to move cargo regularly across Argentine provinces
- Pain: difficulty finding available trucks, no price transparency, no tracking

## Landing Page Features

### Waitlist Signup Form
- **Fields**: Nombre completo (required), Email (required), Tipo (required dropdown), WhatsApp (optional)
- **Tipo options**: Transportista, Cargador, Despachante, Inversor, Otro
- **Storage**: localStorage JSON array (`carga_waitlist`)
- **Counter**: Base of 47 + actual submissions
- **Validation**: Client-side — name required, valid email format, tipo selected
- **Success state**: Inline thank-you message with first name, no page reload

### Page Sections
1. **Hero** — Value proposition, CTA to signup
2. **Problem** — 3 pain point cards
3. **How It Works** — 3-step process
4. **Stats** — Market size social proof (460K trucks, 93% road freight, $35B market)
5. **Signup** — Two-column: benefits + form
6. **Footer** — Links, Codexium credit

## Prototype Screens (prototype.html)

| # | Screen | Description |
|---|--------|-------------|
| 1 | Splash | Onboarding with role selection |
| 2 | Login | Simulated login form |
| 3 | Home / Load Board | List of available loads with filters |
| 4 | Load Detail | Full details of a specific load |
| 5 | WhatsApp Chat | Simulated messaging after contact |
| 6 | Map View | Visual map of available loads |
| 7 | Publish Load | Cargador form to post a load |
| 8 | Profile | Driver profile and stats dashboard |

## Market Data (hardcoded in landing page)
- 460,000+ active trucks in Argentina
- 93% of merchandise transport is by road
- USD 35 billion market without digitization

These are real industry statistics for the Argentine freight market.

## Future Roadmap (not in scope for landing)
- Real Supabase backend for waitlist
- Email confirmation workflow (n8n)
- WhatsApp Business API integration
- Real-time load matching algorithm
- GPS tracking and ETA
- In-app payments and invoicing
