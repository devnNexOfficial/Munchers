# AI Instructions — Muncherz
# READ THIS FILE COMPLETELY BEFORE WRITING ANY CODE
# Every AI code editor (Cursor, Windsurf, Copilot, etc.) must follow this file

---

## Project Identity

```
Name:        Muncherz
Type:        Single restaurant premium ordering web app
Theme:       Red (#D62828) + Yellow (#F7B731) + Black (#0A0A0A)
Core USP:    Live 2.5D interactive food customizer (NOT a game — premium food app)
Audience:    Pakistan, mobile-first, Urdu + English
Stage:       MVP — single restaurant, future-proof for multi-restaurant scale
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
Screen transitions to black background (--muncherz-black: #0A0A0A)
        ↓
Split-screen layout appears with stagger animation:
  LEFT panel (ingredient cards)   fades/slides in from left
  CENTER canvas (burger building) fades in
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
│  (ingredient │   (black background)   │  (white bg)     │
│   cards with │                        │                 │
│   pics)      │   Burger builds here   │  Running list:  │
│              │   layer by layer       │  - Item name    │
│  [Bun]       │                        │  - Pic + qty    │
│  [Patty]     │   ┌──────────────┐    │  - Price each   │
│  [Cheese]    │   │  top bun     │    │                 │
│  [Sauce]     │   │  toppings    │    │                 │
│  [Toppings]  │   │  sauce       │    │                 │
│              │   │  cheese      │    │                 │
│  ◄ arrows ►  │   │  patty       │    │                 │
│              │   │  bottom bun  │    │                 │
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

1. BOTTOM BUN
   - If restaurant has only 1 bun type → auto-placed, user does NOT choose
   - If restaurant has multiple bun types → user picks ONE from left panel
   - Always renders at z-index: 1 (bottom of stack)
   - This is CORE — cannot be removed, can only be swapped (if multiple types exist)

2. PATTY
   - CORE ingredient — is_required = true in DB
   - User MUST add at least 1x before proceeding
   - Can increase quantity (1x, 2x, 3x) up to max_limit set by restaurant
   - z-index: 2 (sits directly on bottom bun)
   - Cannot be deleted entirely — minimum 1x enforced
   - If user tries to reduce to 0 → show alert + block (see Section 5)

3. CHEESE
   - CORE ingredient — directly follows each patty
   - Same validation rules as patty (required, quantity adjustable, cannot go to 0
     if restaurant marked it as is_required)
   - If multiple patties added, cheese layer logic follows: patty → cheese → patty → cheese

4. EVERYTHING AFTER CHEESE = FLEXIBLE
   - Toppings (jalapeno, mushroom, onion, etc.)
   - Sauces
   - These are is_flexible = true, is_required = false (unless restaurant
     specifically locks one)
   - User can skip entirely, add, remove, or adjust freely
   - User can navigate forward/backward through these freely (left/right arrows
     or swipe)

5. TOP BUN
   - ALWAYS z-index: 10 (always renders on top of everything)
   - Auto-placed by system — same logic as bottom bun (single type = auto,
     multiple types = user choice)
   - User cannot place any ingredient "above" the top bun visually
```

⚠️ Note on `is_core`/`is_required`: these flags exist at both the
`ingredients` table level and the `menu_item_ingredients` table level.
Always read from `menu_item_ingredients` at runtime — it's the source
of truth for a given menu item. The `ingredients`-level flags are only
ever used as defaults when a restaurant first assigns an ingredient to
a menu item. See ARCHITECTURE.md for the full rule.

### 4. Layer Configuration (Database-Driven)

```typescript
// Every ingredient has a fixed position defined ONCE by developer
// Stored in ingredients table (see ARCHITECTURE.md schema)

interface IngredientLayerConfig {
  zIndex: number;        // stacking order
  yPosition: string;     // CSS % from top of canvas
  widthRatio: string;    // CSS % width relative to canvas
}

// Example canonical config (developer sets these when uploading PNGs):
const LAYER_DEFAULTS = {
  bottom_bun: { zIndex: 1,  yPosition: '75%', widthRatio: '100%' },
  patty:      { zIndex: 2,  yPosition: '60%', widthRatio: '85%'  },
  cheese:     { zIndex: 3,  yPosition: '52%', widthRatio: '90%'  },
  sauce:      { zIndex: 4,  yPosition: '48%', widthRatio: '82%'  },
  topping:    { zIndex: 5,  yPosition: '44%', widthRatio: '78%'  },
  top_bun:    { zIndex: 10, yPosition: '20%', widthRatio: '100%' },
};
```

Rule: Canvas is a FIXED size container (e.g., 360x480px on mobile, scales
responsively but maintains aspect ratio). Every ingredient PNG fits within
this fixed coordinate system regardless of original image dimensions. This
guarantees the burger always looks proportionally correct no matter which
ingredient images the restaurant/developer uploads.

### 5. Validation Rules (Hard Guardrails)

```
RULE 1 — Core item cannot be zero:
  If is_core = true AND is_required = true AND quantity attempts to go to 0:
    → Block the action (button does not register the decrement below 1)
    → Show toast: "Chef's Rule: [Item name] is required for this burger."
    → NEXT/Add to Cart button remains disabled until resolved

RULE 2 — Max limit enforcement:
  If quantity reaches max_limit (set by restaurant per ingredient):
    → "+" button becomes disabled (greyed out, not clickable)
    → Limit bar (visual fill indicator) reaches 100% and does a subtle
      "shake" animation once to indicate limit reached
    → Toast: "Maximum reached — [Chef's warning message from DB]"
      e.g. "Adding more sauce will make the burger soggy!"

RULE 3 — Flexible items, zero is allowed:
  is_flexible = true items can go to 0 (effectively not added) with no
  warning or blocking. User can skip entirely.

RULE 4 — Core items: change, not delete:
  Core ingredients (bun, patty type if multiple variants) can be SWAPPED
  (e.g. switch from sesame bun to brioche bun) but the slot itself cannot
  be removed — there must always be a bun and a patty.

RULE 5 — Add to Cart button activation:
  Only enabled when ALL is_required = true ingredients have quantity >= 1
```

### 6. Topping Quantity System (3-Tier Visual)

```
For toppings that come in bulk (jalapeno, mushroom, onion, etc.):
  Do NOT let user tap "+" repeatedly for individual pieces.
  Instead: show 3 pre-set quantity option images per topping:
    [Light]   — small quantity visual
    [Regular] — medium quantity visual
    [Extra]   — large quantity visual

  User taps ONE of these three → that exact image variant is what
  gets added to the canvas. Tapping a different tier REPLACES the
  previous tier (not additive) — user can only have one quantity
  level per topping at a time.

Database fields used: png_qty_low, png_qty_medium, png_qty_high
  (see ingredients table in ARCHITECTURE.md)
```

### 7. Sauce Layering Logic (Exact Behavior)

```
SAME sauce tapped multiple times:
  - 1st tap: sauce layer renders at full opacity, normal position
  - 2nd tap (same sauce): renders the EXACT SAME image directly on top,
    ZERO gap/offset — pixel-perfect overlay
  - Effect: combined opacity makes it look slightly thicker/darker
    (use CSS opacity stacking or mix-blend-mode: multiply)
  - This simulates "more sauce" without showing duplicate separate blobs

DIFFERENT sauce added (e.g. user already has Garlic Mayo, now adds
Peri-Peri):
  - New sauce renders as a clearly distinct layer (can have slight
    offset/blend) so both flavors are visually distinguishable
  - Both tracked separately in state with separate quantities

State shape example:
  sauces: {
    'garlic-mayo-id': { qty: 2, unit: 'spoon' },
    'peri-peri-id':   { qty: 1, unit: 'spoon' }
  }
```

### 8. Kitchen Display Translation (How Sauce/Qty Reaches Chef)

```
Chef does NOT need to know exact pouring technique — chef decides that.
KDS ticket shows simply:

  SAUCE FLAVORS & QUANTITY:
    • Garlic Mayo      → 2x (Double Spoon)
    • Peri-Peri        → 1x (Standard Spoon)

The "spoon/pump/cube" unit is restaurant-defined (standard_unit field in
ingredients table) — chef applies it manually wherever makes sense
(bun, patty, or split across both). The app does NOT prescribe WHERE
on the burger the sauce physically goes during kitchen prep.
```

### 9. Price & Time Calculation (Live, Client-Side First)

```
On every +/- tap:
  1. Zustand store updates locally (instant, no API call)
  2. Price recalculates: basePrice + sum(ingredient.qty * ingredient.price)
  3. Time recalculates: basePrepTime + sum(ingredient.qty * ingredient.extraPrepTime)
  4. Both values animate with an "odometer" rolling effect (Framer Motion
     useSpring or AnimatePresence with mode="popLayout")
  5. NO server call happens during customization — only local state

On "Add to Cart" / "Next":
  1. Client sends ONLY ingredient IDs + quantities (not prices) to server
  2. Server (API route) re-fetches real prices from Supabase
  3. Server recalculates total independently
  4. If client-displayed price doesn't match server-calculated price
     within a tolerance of 0 (must be exact) → reject with error,
     log to activity_logs as suspicious activity
  5. Only server-validated price is ever stored in the orders table
```

### 10. Right Panel — Order Summary List

```
White background panel (contrast to black canvas).
Live-updating list, synced to the same Zustand store:

  [pic] Sesame Bun           (auto)
  [pic] Beef Patty    x2     Rs. 320
  [pic] Cheddar Cheese x1    Rs. 80
  [pic] Jalapeno (Extra)     Rs. 60
  [pic] Garlic Mayo   x2     Rs. 40
  ─────────────────────────────────
  Subtotal:                  Rs. 500

Every item shows: thumbnail image, name, quantity (if > 1 or applicable),
and price contribution. This list updates in perfect sync with the canvas
— same Zustand store, two different visual representations.
```

### 11. Navigation (Arrows + Touch)

```
Both side panels support:
  - Left/right arrow buttons (desktop + mobile)
  - Touch swipe gestures (mobile)
  - Tapping directly on an ingredient card

User can move forward and backward through flexible ingredient categories
freely. Core categories (bun, patty, cheese) are also revisitable to CHANGE
selection, but never to fully remove the core slot.
```

### 12. Canvas Type Switching (Future-Proof)

```
canvas_type field on menu_items determines rendering engine:
  'burger' → Vertical stack (this document's primary logic)
  'pizza'  → Top-down circular canvas, toppings scatter radially
  'roll'   → Horizontal layout, ingredients add inside an open wrap shape
             (wrap does NOT animate "rolling closed" in this version —
             it stays visually open, user only adjusts sauce/toppings
             quantity; rolling animation is a future enhancement)
  'simple' → No animated canvas — just size/flavor selector (fries, drinks)

Same Zustand store pattern and same validation rules apply across all
canvas types — only the visual rendering component differs.
```

### 13. Implode/Fade Exit Effect (Reverse, on completion or cancel)

```
When user completes customization and proceeds to meal/cart, OR cancels
out of the customizer:
  - Canvas content fades out (opacity 1 → 0, ~300ms)
  - Screen transitions back to normal app background (white/themed)
  - DO NOT reverse the implode (i.e. don't "explode" the burger back into
    the menu photo) — keep exit simple and fast
```

---

## Technology Stack — STRICT

```
Framework:       Next.js 15 (App Router only — no Pages Router)
Language:        TypeScript (strict: true in tsconfig.json — no exceptions)
Styling:         Tailwind CSS v3 + Shadcn UI components
Animation:       Framer Motion (for ALL animations — no raw CSS @keyframes
                  unless trivial, no GSAP, no Lottie in MVP, no Three.js/WebGL)
State:           Zustand (customizer, cart, active order — NOT React Context
                  for these, too much re-render overhead)
Database:        Supabase (PostgreSQL + RLS + Realtime)
Auth:             Supabase Auth (Phone OTP for users, Email+2FA for
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
React Components:   PascalCase    BurgerCanvas.tsx
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
- Customizer components (BurgerCanvas, IngredientLayer, etc.) are
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
11. Developer panel 2FA must be enrolled per-user (e.g. via Supabase
    Auth's native MFA factor enrollment), never a single shared TOTP
    secret for every developer account — see SECURITY.md for why
    `.env.example`'s `DEVELOPER_2FA_SECRET` as written is a real
    security gap once more than one person needs developer access
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
6. Database queries must use indexes (see ARCHITECTURE.md) — no
   full table scans in hot paths (KDS, menu fetch, order placement)
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
   (Muncherz) only right now. ⚠️ Note: the current schema is NOT
   actually future-proofed for multi-restaurant — see ARCHITECTURE.md's
   "Architecture Note" for why, and decide explicitly whether to add a
   restaurant_id column now or accept this as a deliberate single-tenant
   design.
❌ NOT using any paid service in MVP — everything must run on free tiers
   (but see ARCHITECTURE.md / SECURITY.md for the real limits of "free" —
   the 200-connection Realtime cap and 7-day auto-pause are not
   hypothetical and should be monitored, not ignored)
```

---

## Changes Made (Audit Pass)

- Translated the one Roman Urdu line in the file header to professional English.
- **Corrected a false claim:** "What This App Is NOT" said the architecture "is future-proofed" for multi-restaurant scale. It isn't — no table carries a tenant identifier. Rewrote this to flag the gap honestly and point to the decision the team needs to make, rather than repeating an inaccurate assurance.
- Added a precedence rule for `is_core`/`is_required` (duplicated across `ingredients` and `menu_item_ingredients` with no stated tie-breaker in the original docs) — `menu_item_ingredients` is now the documented source of truth at runtime.
- Added Security Rule #11 calling out that `DEVELOPER_2FA_SECRET` in `.env.example`, as a single global env variable, implies one shared TOTP secret for every developer account. That breaks per-user revocation and audit trails the moment a second person needs developer-panel access — recommended per-user MFA enrollment instead (Supabase Auth supports this natively).
- Added a parenthetical under "free tiers only" pointing at the real, currently-confirmed limits (200 concurrent Realtime connections, ~7-day auto-pause) so this rule doesn't read as a costless default — it has real tradeoffs that should be monitored.
