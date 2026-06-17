# AI Instructions — Antigravity
# READ THIS FILE COMPLETELY BEFORE WRITING ANY CODE
# Every AI code editor (Cursor, Windsurf, Copilot, etc.) must follow this file

---

## Project Identity

```
Name:        Antigravity
Type:        Single restaurant premium ordering web app
Theme:       [SET YOUR BRAND COLORS — e.g. Dark Navy (#0D1B2A) + Electric Blue (#1B98E0) + White (#FFFFFF)]
Core USP:    Live 2.5D interactive food customizer (NOT a game — premium food app)
Audience:    Pakistan, mobile-first, Urdu + English
Stage:       MVP — single restaurant, future-proof decision to be made explicitly (see Architecture Note)
```

---

## Non-Negotiable Rules (Read Every Time)

```
1. NO compromise on security — ever, for any reason
2. NO compromise on performance — 60fps animations, <2.5s LCP
3. NO compromise on SEO/AEO/GEO — every page must be optimized
4. Clean code ALWAYS — readable, typed, modular, commented where needed
5. Server-side price validation ALWAYS — never trust client price
6. TypeScript strict mode — no `any`, no implicit types
7. Mobile-first — design for 375px width first, scale up
8. Free tier services ONLY — no paid services unless explicitly approved
9. One section at a time — never mix multiple features in one prompt/commit
10. Premium feel ALWAYS — this is a food app, not a game. No cartoonish effects.
```

---

## The Core Feature — 2.5D Customizer (FULL DETAILED LOGIC)

This is the most important feature of the entire app. Read this section multiple times before touching any customizer code.

### 1. Entry Animation

```
User taps "Customize" button on any menu item
        ↓
Item's normal menu photo is shown briefly
        ↓
Photo plays an IMPLODE + FADE animation
  - Image scales down toward center (scale: 1 → 0.3)
  - Opacity fades out (1 → 0) simultaneously
  - Duration: ~400-500ms
  - Easing: easeInOut
        ↓
Screen transitions to dark background (brand primary dark color)
        ↓
Split-screen layout appears with stagger animation:
  LEFT panel (ingredient cards)   fades/slides in from left
  CENTER canvas (food building)   fades in
  RIGHT panel (order summary)     fades/slides in from right
```

Implementation: Framer Motion `AnimatePresence` + `motion.div` with `variants`.
DO NOT use video, GIF, or heavy particle effects for this — CSS transform + opacity only.

### 2. Screen Layout (Split Screen)

```
┌─────────────────────────────────────────────────────────┐
│  ◄  [Item Name]                                    ✕    │
├──────────────┬────────────────────────┬─────────────────┤
│              │                        │                 │
│  LEFT PANEL  │     CENTER CANVAS      │  RIGHT PANEL    │
│  (ingredient │   (dark background)    │  (white bg)     │
│   cards with │                        │                 │
│   pics)      │   Food builds here     │  Running list:  │
│              │   layer by layer       │  - Item name    │
│  [Base]      │                        │  - Pic + qty    │
│  [Core 1]    │   ┌──────────────┐    │  - Price each   │
│  [Core 2]    │   │  top layer   │    │                 │
│  [Flexible]  │   │  toppings    │    │                 │
│  [Sauce]     │   │  sauce       │    │                 │
│              │   │  core items  │    │                 │
│  ◄ arrows ►  │   │  base layer  │    │                 │
│              │   └──────────────┘    │                 │
├──────────────┴────────────────────────┴─────────────────┤
│  Price: Rs. XXX  |  Time: XX min   [Limit bars per item] │
│                          [ NEXT → ]                       │
└─────────────────────────────────────────────────────────┘

Mobile (< 768px): Stack vertically
  - Top: ingredient cards (horizontal scroll)
  - Middle: canvas
  - Bottom: collapsible summary (swipe up sheet)
```

### 3. Layer Sequence Logic (CRITICAL)

```
Sequence is auto-managed by the system, NOT manually forced step-by-step:

1. BASE LAYER
   - If restaurant has only 1 base type → auto-placed, user does NOT choose
   - If restaurant has multiple base types → user picks ONE from left panel
   - Always renders at z-index: 1 (bottom of stack)
   - This is CORE — cannot be removed, can only be swapped (if multiple types exist)

2. CORE INGREDIENTS (e.g. main protein, primary element)
   - CORE ingredient — is_required = true in DB
   - User MUST add at least 1x before proceeding
   - Can increase quantity (1x, 2x, 3x) up to max_limit set by restaurant
   - Cannot be deleted entirely — minimum 1x enforced
   - If user tries to reduce to 0 → show alert + block (see Section 5)

3. SECONDARY CORE (e.g. cheese, core topping)
   - CORE ingredient — directly follows each primary core
   - Same validation rules as primary core (required, quantity adjustable, cannot go to 0
     if restaurant marked it as is_required)

4. EVERYTHING AFTER CORE = FLEXIBLE
   - Toppings, sauces, extras
   - These are is_flexible = true, is_required = false (unless restaurant
     specifically locks one)
   - User can skip entirely, add, remove, or adjust freely
   - User can navigate forward/backward through these freely (left/right arrows
     or swipe)

5. TOP LAYER
   - ALWAYS z-index: 10 (always renders on top of everything)
   - Auto-placed by system — same logic as base layer (single type = auto,
     multiple types = user choice)
   - User cannot place any ingredient "above" the top layer visually
```

⚠️ Note on `is_core`/`is_required`: these flags exist at both the
`ingredients` table level and the `menu_item_ingredients` table level.
Always read from `menu_item_ingredients` at runtime — it's the source
of truth for a given menu item. The `ingredients`-level flags are only
ever used as defaults when a restaurant first assigns an ingredient to
a menu item.

### 4. Layer Configuration (Database-Driven)

```typescript
// Every ingredient has a fixed position defined ONCE by developer
// Stored in ingredients table

interface IngredientLayerConfig {
  zIndex: number;        // stacking order
  yPosition: string;     // CSS % from top of canvas
  widthRatio: string;    // CSS % width relative to canvas
}

// Example canonical config (developer sets these when uploading PNGs):
const LAYER_DEFAULTS = {
  base_layer:  { zIndex: 1,  yPosition: '75%', widthRatio: '100%' },
  core_item:   { zIndex: 2,  yPosition: '60%', widthRatio: '85%'  },
  secondary:   { zIndex: 3,  yPosition: '52%', widthRatio: '90%'  },
  sauce:       { zIndex: 4,  yPosition: '48%', widthRatio: '82%'  },
  topping:     { zIndex: 5,  yPosition: '44%', widthRatio: '78%'  },
  top_layer:   { zIndex: 10, yPosition: '20%', widthRatio: '100%' },
};
```

Rule: Canvas is a FIXED size container (e.g., 360x480px on mobile, scales
responsively but maintains aspect ratio). Every ingredient PNG fits within
this fixed coordinate system regardless of original image dimensions.

### 5. Validation Rules (Hard Guardrails)

```
RULE 1 — Core item cannot be zero:
  If is_core = true AND is_required = true AND quantity attempts to go to 0:
    → Block the action (button does not register the decrement below 1)
    → Show toast: "Chef's Rule: [Item name] is required for this item."
    → NEXT/Add to Cart button remains disabled until resolved

RULE 2 — Max limit enforcement:
  If quantity reaches max_limit (set by restaurant per ingredient):
    → "+" button becomes disabled (greyed out, not clickable)
    → Limit bar (visual fill indicator) reaches 100% and does a subtle
      "shake" animation once to indicate limit reached
    → Toast: "Maximum reached — [Chef's warning message from DB]"

RULE 3 — Flexible items, zero is allowed:
  is_flexible = true items can go to 0 (effectively not added) with no
  warning or blocking. User can skip entirely.
```

### 6. Sauce Logic (Special Case)

```
Same sauce tapped twice:
  → NO new layer is added
  → Opacity of existing sauce layer increases (CSS opacity: 0.7 → 1.0)
  → This creates a "thicker sauce" visual with zero visible gap
  → Framer Motion animates the opacity transition smoothly

Different sauce tapped:
  → New separate layer is created at the same z-index band
  → Layers sit next to each other on the canvas (side by side or slight overlap)
  → Each sauce has its own limit bar
```

### 7. Price Calculation (Two-Layer System)

```
CLIENT SIDE (Zustand — real-time, optimistic):
  - Every tap updates price immediately
  - Uses ingredient prices from initial API fetch
  - Displays with odometer/counter animation
  - THIS PRICE IS DISPLAY ONLY — never trusted for payment

SERVER SIDE (API route — authoritative):
  - Triggered only on "Add to Cart" action
  - Receives: { menuItemId, ingredients: [{ id, quantity }] }
  - Independently calculates total from DB prices
  - Compares with client-submitted total
  - Mismatch tolerance: 0 (any difference = reject)
  - On rejection: logs the discrepancy, returns error, user sees
    "Price changed — please review your order"
```

---

## Tech Stack (LOCKED — Do Not Deviate)

```
Framework:       Next.js 15, App Router ONLY (no Pages Router)
Language:        TypeScript strict mode (tsconfig: strict: true)
Styling:         Tailwind CSS (utility-first, no CSS modules unless
                  absolutely necessary for canvas-specific styles)
UI Components:   Shadcn UI (radix primitives + tailwind)
Animation:       Framer Motion (for ALL animations — no raw CSS @keyframes
                  unless trivial, no GSAP, no Lottie in MVP, no Three.js/WebGL)
State:           Zustand (customizer, cart, active order — NOT React Context
                  for these, too much re-render overhead)
Database:        Supabase (PostgreSQL + RLS + Realtime)
Auth:            Supabase Auth (Phone OTP for users, Email+2FA for
                  restaurant/developer)
Payments:        PayMob (JazzCash, Easypaisa, Card) — webhook-based,
                  idempotent
Images:          next/image ALWAYS — never raw <img> tags
Storage:         Supabase Storage (private bucket for ingredient PNGs,
                  public bucket for menu photos)
Validation:      Zod for ALL form inputs and API payloads
Hosting:         Vercel
Monitoring:      Sentry (production only)
```

DO NOT introduce alternative libraries for the same purpose without
explicit approval (e.g. no Redux alongside Zustand, no styled-components
alongside Tailwind, no GSAP alongside Framer Motion).

---

## Code Standards

### TypeScript
```typescript
// ✅ CORRECT
interface CustomizerSelection {
  ingredientId: string;
  quantity: number;
  isCore: boolean;
}
const selections: Record<string, CustomizerSelection> = {};

// ❌ WRONG
const selections: any = {};
var qty = 1;
```

### File Naming
```
React Components:   PascalCase    FoodCanvas.tsx
Hooks:               camelCase     useCustomizerStore.ts
Lib/Utils:           camelCase     priceCalculator.ts
Type files:          camelCase     menuTypes.ts
Constants:           UPPER_SNAKE   MAX_TOPPING_LIMIT = 5
```

### Import Order (ESLint enforced)
```typescript
// 1. React/Next
import { useState } from 'react'
import Image from 'next/image'

// 2. Third party
import { motion } from 'framer-motion'
import { z } from 'zod'

// 3. Internal absolute (@/)
import { useCustomizerStore } from '@/store/useCustomizerStore'
import { supabase } from '@/lib/supabase'

// 4. Internal relative
import { IngredientCard } from './IngredientCard'
import type { Ingredient } from './types'
```

### Component Rules
```
- Server Components by default
- 'use client' ONLY when: hooks, state, animation, event handlers needed
- Customizer components (FoodCanvas, IngredientLayer, etc.) are
  always Client Components
- Keep components under 200 lines — split if larger
- Props always typed with interface, never inline object types for
  anything reused more than once
```

---

## Security Rules (Apply to Every Single Feature)

```
1. Every API route validates input with Zod before processing
2. Every price-related calculation is re-verified server-side
3. RLS enabled on every Supabase table — no exceptions
4. Phone OTP rate-limited: 3 sends per 10 minutes per number
5. Order placement rate-limited: 10 per user per hour
6. No secrets in code — .env.local only, never committed
7. Restaurant/Developer panels require role check on EVERY request,
   not just on login
8. Kitchen LCD requires PIN verification, lockout after 3 wrong attempts
9. File uploads (ingredient PNGs, menu photos): type + size validated
   server-side, never trust client-side validation alone
10. Activity logs are immutable — INSERT only, no UPDATE/DELETE allowed
    via RLS policy
11. Developer panel 2FA must be enrolled per-user (via Supabase Auth's
    native MFA factor enrollment), never a single shared TOTP secret
    for every developer account
```

---

## Performance Rules (Apply to Every Single Feature)

```
1. Images: next/image only, WebP auto-served, lazy load below the fold
2. Customizer must hit 60fps — test on mid-range Android before
   considering a feature "done"
3. No blocking API calls during animation — all customizer interaction
   is local-state-first
4. Code-split heavy components (customizer engine) with dynamic import
5. Avoid unnecessary re-renders — Zustand selectors, not whole-store
   subscriptions
6. Database queries must use indexes — no full table scans in hot paths
   (KDS, menu fetch, order placement)
7. Bundle size monitored — flag any single dependency addition over 50KB
```

---

## SEO / AEO / GEO Rules (Apply to Every Page)

```
1. Every page exports generateMetadata() with title, description, OG tags
2. JSON-LD structured data on home page (LocalBusiness/Restaurant) and
   menu item pages (Menu schema)
3. Semantic HTML always — proper heading hierarchy, alt text on every
   image (translated for Urdu mode too)
4. Sitemap and robots.txt auto-maintained via next-sitemap
5. Core Web Vitals checked before marking any page "done":
   LCP < 2.5s, CLS < 0.1, FID < 100ms
6. /llm.txt maintained for AI crawler discoverability
```

---

## Vibe Coding Workflow (How To Use This Project)

```
Step 1: Open final_master_checklist.md
Step 2: Pick ONE section/feature to work on
Step 3: Write a prompt referencing this ai-instructions.md file and the
        specific checklist section
Step 4: Give prompt to AI code editor (Cursor/Windsurf/etc.)
Step 5: Review generated code against the rules in this file
Step 6: Test manually — does it match the EXACT logic described above?
Step 7: Run checks:
          npm run type-check
          npm run lint
          npm run build
Step 8: If all pass → commit → move to next section
Step 9: NEVER skip ahead to a dependent feature before its prerequisite
        section is fully working (e.g. don't build Cart before
        Customizer state is solid)

⚠️ One section at a time. Incomplete sections are never left half-done
   across multiple commits — finish or explicitly pause clearly.
```

---

## What This App Is NOT

```
❌ NOT a game — no score boards, no confetti, no cartoon sound effects,
   no neon gaming colors, no "level up" language anywhere
❌ NOT a generic e-commerce template — the customizer IS the product,
   treat it as the highest-quality part of the codebase
❌ NOT multi-restaurant in this version — build for ONE restaurant
   (Antigravity) only right now. The schema is single-tenant; adding
   multi-restaurant later means a real schema migration. Decide
   explicitly whether to add restaurant_id columns now or accept this.
❌ NOT using any paid service in MVP — everything must run on free tiers.
   Known free-tier constraints to monitor: Supabase 200 concurrent
   Realtime connections cap, ~7-day auto-pause without API traffic.
```
