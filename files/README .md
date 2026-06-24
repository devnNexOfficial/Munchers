# Muncherz — Premium Restaurant Ordering App

Pakistan's first **live 2.5D interactive burger customizer**, combined with a complete restaurant ordering platform.
Red & Yellow premium theme. Single restaurant. World-class experience.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript (Strict Mode) | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | Shadcn UI | Latest |
| Animation | Framer Motion | 11.x |
| State Management | Zustand | 4.x |
| Database | Supabase (PostgreSQL + RLS + Realtime) | Latest |
| Auth | Supabase Auth (OTP/Phone) | Latest |
| Payments | PayMob (JazzCash + Easypaisa + Card) | Latest |
| Storage | Supabase Storage (PNG ingredients) | Latest |
| Hosting | Vercel | Free |
| Monitoring | Sentry | Production only |
| SEO/Performance | Next.js built-in + next-sitemap | Latest |

---

## Quick Start

```bash
# 1. Clone
git clone [repo-url]
cd muncherz

# 2. Install — use npm ci, NOT npm install (keeps lockfile authoritative)
npm ci

# 3. Environment
cp .env.example .env.local
# Fill in your values inside .env.local

# 4. Database
npx supabase db push

# 5. Dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Project Structure

```
src/
├── app/
│   ├── (user)/              User-facing pages
│   │   ├── page.tsx         Home screen — menu, deals, categories
│   │   ├── customize/       2.5D burger customizer page
│   │   ├── cart/            Cart page
│   │   ├── checkout/        Checkout + OTP
│   │   ├── track/           Live order tracker
│   │   └── profile/         User profile, saved creations
│   ├── (restaurant)/        Restaurant panel
│   │   ├── kds/             Live Kitchen Display System
│   │   ├── menu/            Menu manager
│   │   ├── inventory/       Ingredient stock control
│   │   ├── orders/          Order history + financials
│   │   ├── analytics/       Sales analytics + heatmap
│   │   ├── feedback/        Customer reviews
│   │   ├── delivery/        Delivery settings
│   │   ├── deals/           Deals manager
│   │   └── settings/        Staff, printer, QR, timings
│   ├── (developer)/         Developer health dashboard
│   │   └── dashboard/       App status, errors, traffic
│   ├── api/                 API routes
│   │   ├── auth/            Auth endpoints
│   │   ├── menu/            Menu CRUD
│   │   ├── orders/          Order placement + status
│   │   ├── payment/         PayMob webhooks
│   │   ├── customizer/      Ingredient fetch + price validate
│   │   └── analytics/       Analytics endpoints
│   └── kitchen/             Kitchen LCD screen (PIN protected)
├── components/
│   ├── ui/                  Shadcn + custom base components
│   ├── customizer/          2.5D burger engine components
│   │   ├── BurgerCanvas.tsx         Main canvas
│   │   ├── IngredientLayer.tsx      Single layer component
│   │   ├── IngredientCard.tsx       Side panel cards
│   │   ├── SauceBlend.tsx           Sauce merge effect
│   │   ├── LimitBar.tsx             Fill-up limit indicator
│   │   ├── SummaryList.tsx          Right side order summary
│   │   └── MealSelector.tsx         With meal popup
│   ├── home/                Home screen components
│   ├── cart/                Cart components
│   ├── checkout/            Checkout components
│   ├── tracker/             Order tracker components
│   └── kds/                 Kitchen display components
├── hooks/                   Custom React hooks
├── lib/                     Supabase client, utils, validators
├── store/                   Zustand stores
│   ├── useCustomizerStore.ts        Burger state
│   ├── useCartStore.ts              Cart state
│   └── useOrderStore.ts             Active order state
└── types/                   TypeScript type definitions
```

---

## Three Panels

### 1. User Panel `/`
Customer-facing. Home screen, 2.5D customizer, cart, checkout, order tracker, profile.

### 2. Restaurant Panel `/restaurant`
Owner/manager use. KDS, menu manager, inventory, analytics, feedback, delivery settings, deals, staff control.

### 3. Developer Panel `/developer`
App health, live traffic, error logs, payment success rate, DB status.

### Kitchen LCD `/kitchen`
PIN-protected full-screen KDS for kitchen tablets/screens.

---

## 2.5D Customizer — Core Feature

```
User clicks Customize
        ↓
Burger image loads → Implode + Fade animation → Black screen
        ↓
Split screen appears:
  LEFT:  Ingredient cards (with PNG pics)
  CENTER: Live burger canvas (layers stack)
  RIGHT: Running order summary list
        ↓
User selects ingredients:
  - Core items: Must add, cannot delete, can change quantity
  - Flexible items: Optional, can skip, can delete
        ↓
Every + tap:
  - Ingredient flies from card → lands on burger (Framer Motion)
  - Layer adds to canvas (z-index ordered)
  - Price counter updates (odometer effect)
  - Prep time updates
        ↓
Limit bar fills up → shakes when max reached
        ↓
All core items added → NEXT button activates
        ↓
Meal selector → Cart → Checkout
```

---

## Layer Config (Developer Defined)

```typescript
// src/lib/layerConfig.ts
export const LAYER_CONFIG = {
  bottom_bun:  { zIndex: 1,  yPosition: '75%', width: '100%' },
  patty:       { zIndex: 2,  yPosition: '60%', width: '85%'  },
  cheese:      { zIndex: 3,  yPosition: '52%', width: '90%'  },
  sauce:       { zIndex: 4,  yPosition: '48%', width: '82%'  },
  topping:     { zIndex: 5,  yPosition: '44%', width: '78%'  },
  top_bun:     { zIndex: 10, yPosition: '20%', width: '100%' },
}
```

---

## Environment Variables

```bash
cp .env.example .env.local
```

Full variable list in `.env.example`.

---

## Performance Targets

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3.5s |
| Bundle size (initial) | < 200KB gzipped |
| Customizer FPS | 60fps locked |
| API response | < 200ms |
| DB query | < 50ms |

---

## SEO / AEO / GEO

- Next.js App Router metadata API — all pages
- Structured data (JSON-LD) — Restaurant, Menu, LocalBusiness
- Sitemap auto-generated — next-sitemap
- robots.txt configured
- OG images — dynamic generation
- Urdu + English — hreflang tags
- Core Web Vitals — monitored via Vercel Analytics

---

## References

| File | Description |
|---|---|
| `ARCHITECTURE.md` | Full system diagram, DB schema, security |
| `ai-instructions.md` | AI coding rules — READ FIRST |
| `quick-reference-antigravity.md` | Quick rules for the Antigravity AI editor |
| `quick-reference-codex.md` | Quick rules for the Codex AI editor |
| `CONTRIBUTING.md` | Git workflow, standards |
| `final_master_checklist.md` | Complete vibe coding checklist |
| `.env.example` | All environment variables |
| `DEPLOYMENT.md` | Production deploy checklist |
| `ROLLBACK.md` | Emergency rollback procedure |
| `SECURITY.md` | Master security reference — cross-checked against all files above |

---

## Changes Made (Audit Pass)

- Translated four Roman Urdu lines to professional English (tagline, npm install note, env setup note, localhost availability note).
- Fixed `final_master_checklist.html` → `final_master_checklist.md` in the references table — the file has never had an `.html` extension; this was a stale reference.
- Added `SECURITY.md` to the references table. It existed as a real, substantial file but wasn't linked from anywhere a new developer would actually find it.
- **Removed the stale `.cursorrules` reference** and replaced it with `quick-reference-antigravity.md` and `quick-reference-codex.md`. The team uses Antigravity and Codex, not Cursor — the `.cursorrules` file was deleted from the project for that reason, but this table still pointed to it, which would have sent a new contributor looking for a file that doesn't exist.
