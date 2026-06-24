# ARCHITECTURE.md — Muncherz
# System design, DB schema, security layers, performance

---

## System Overview

```
User Browser / Mobile
        ↓
   Vercel CDN (Next.js 15)
        ↓
   Supabase (PostgreSQL + RLS + Realtime)
        ↓
   PayMob Gateway (JazzCash / Easypaisa / Card)
        ↓
   Supabase Storage (PNG ingredient images)
```

---

## Three Panel Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MUNCHERZ APP                         │
├─────────────────┬──────────────────┬────────────────────┤
│   USER PANEL    │ RESTAURANT PANEL │  DEVELOPER PANEL   │
│   / (root)      │ /restaurant      │  /developer        │
├─────────────────┼──────────────────┼────────────────────┤
│ Home Screen     │ Live KDS         │ App Health         │
│ Customizer      │ Menu Manager     │ Live Traffic       │
│ Cart            │ Inventory        │ Error Logs         │
│ Checkout        │ Analytics        │ Payment Rate       │
│ Order Tracker   │ Feedback Log     │ DB Status          │
│ Profile         │ Delivery Setup   │                    │
│                 │ Deals Manager    │                    │
│                 │ Orders/Finance   │                    │
│                 │ Staff Access     │                    │
└─────────────────┴──────────────────┴────────────────────┘

Kitchen LCD:  /kitchen  (PIN protected, separate URL)
```

---

## ⚠️ Architecture Note: The "Future-Proof for Multi-Restaurant" Claim Doesn't Hold

`ai-instructions.md` states this app's architecture is "future-proofed"
for multi-restaurant scale even though it's being built for one
restaurant now. **That claim isn't accurate as the schema currently
stands.** Not one table below — not `menu_items`, not `orders`, not
`ingredients`, not `staff_accounts`, not `deals`, not `riders`, not
`kitchen_screens` — carries a `restaurant_id` (or any tenant identifier)
column. Every query, every RLS policy, and every API route implicitly
assumes exactly one restaurant exists.

This isn't a stylistic nitpick — it's the difference between "add a
column and a WHERE clause later" and "rewrite every table, every RLS
policy, and every query in the app." If multi-restaurant is ever a real
possibility, there are two honest paths, and the team should pick one
deliberately rather than carrying a false assumption forward:

1. **Drop the future-proof claim.** Document this as intentionally
   single-tenant, and accept that multi-restaurant support means a full
   schema migration later. This is a perfectly reasonable MVP choice —
   just don't call it future-proofed if it isn't.
2. **Add a nullable `restaurant_id UUID` column now**, defaulted to one
   seeded restaurant row, on every table that would need to be scoped
   per-restaurant (`menu_items`, `categories`, `ingredients`, `orders`,
   `deals`, `riders`, `kitchen_screens`, `staff_accounts`,
   `restaurant_settings`). The cost today is near-zero (a column nobody
   queries against yet). The cost of doing this retroactively after
   production data exists is a real, risky migration.

This document doesn't make that call for the team — it's a product/
timeline decision, not a documentation cleanup — but it should be made
explicitly, not by default.

---

## Database Schema (Supabase PostgreSQL)

### Table: profiles
```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  phone         TEXT UNIQUE NOT NULL,
  name          TEXT,
  language      TEXT DEFAULT 'en' CHECK (language IN ('en', 'ur')),
  loyalty_stamps INTEGER DEFAULT 0,
  is_blocked    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### Table: addresses
```sql
CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT, -- 'Home', 'Office', 'Other'
  address_text  TEXT NOT NULL,
  landmark      TEXT,
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### Table: categories
```sql
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  name_ur       TEXT,
  slug          TEXT UNIQUE NOT NULL,
  image_url     TEXT,
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### Table: menu_items
```sql
CREATE TABLE menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID REFERENCES categories(id),
  name            TEXT NOT NULL,
  name_ur         TEXT,
  description     TEXT,
  description_ur  TEXT,
  image_url       TEXT NOT NULL,
  base_price      DECIMAL(10,2) NOT NULL,
  discount_price  DECIMAL(10,2),
  show_discount   BOOLEAN DEFAULT false,
  size_variants   JSONB, -- [{label:'S', price:800}, {label:'M', price:950}]
  canvas_type     TEXT DEFAULT 'burger' CHECK (canvas_type IN ('burger','pizza','roll','simple')),
  base_prep_time  INTEGER DEFAULT 15, -- minutes
  is_available    BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  is_best_seller  BOOLEAN DEFAULT false,
  with_meal       BOOLEAN DEFAULT false,
  meal_options    JSONB,
  daily_special   BOOLEAN DEFAULT false,
  special_ends_at TIMESTAMPTZ,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### Table: ingredients
```sql
CREATE TABLE ingredients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  name_ur         TEXT,
  category        TEXT NOT NULL CHECK (category IN ('bun','patty','cheese','sauce','topping','drink','side')),
  png_image_url   TEXT NOT NULL,     -- developer uploads PNG
  -- quantity variant images
  png_qty_low     TEXT,              -- topping low-quantity image
  png_qty_medium  TEXT,              -- topping medium quantity image
  png_qty_high    TEXT,              -- topping high quantity image
  -- canvas positioning (developer defines)
  z_index         INTEGER NOT NULL,
  y_position      TEXT NOT NULL,     -- CSS percentage e.g. '60%'
  width_ratio     TEXT NOT NULL,     -- CSS percentage e.g. '85%'
  -- restaurant controls
  price_per_unit  DECIMAL(10,2) DEFAULT 0,
  standard_unit   TEXT DEFAULT 'spoon', -- spoon / pump / slice / piece
  max_limit       INTEGER DEFAULT 3,
  is_core         BOOLEAN DEFAULT false,
  is_required     BOOLEAN DEFAULT false,
  extra_prep_time INTEGER DEFAULT 0, -- minutes added per unit
  is_available    BOOLEAN DEFAULT true,
  stock_count     INTEGER,           -- null = unlimited
  low_stock_alert INTEGER DEFAULT 5,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### Table: menu_item_ingredients
```sql
CREATE TABLE menu_item_ingredients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id    UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id   UUID REFERENCES ingredients(id),
  is_core         BOOLEAN DEFAULT false,   -- restaurant sets
  is_required     BOOLEAN DEFAULT false,   -- cannot skip
  is_flexible     BOOLEAN DEFAULT true,    -- user can modify
  default_qty     INTEGER DEFAULT 1,
  max_qty         INTEGER DEFAULT 3,
  sort_order      INTEGER DEFAULT 0
);
```

⚠️ **Precedence rule (not previously stated anywhere):** `is_core`,
`is_required`, and `max_limit`-equivalent fields exist on **both** the
`ingredients` table and this `menu_item_ingredients` table. This is
ambiguous as written — nothing in the original documentation said which
one wins when they disagree. The rule going forward: **`menu_item_ingredients`
values are the source of truth at runtime for that specific menu item.**
The `ingredients`-table-level flags are only used as the default values
pre-filled when a restaurant first assigns that ingredient to a new menu
item (Section 18 of `final_master_checklist.md`); they are never read
again after that assignment is created. The customizer engine and the
server-side price/validation logic should query `menu_item_ingredients`
only, never fall back to `ingredients`-level flags at runtime.

### Table: orders
```sql
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT UNIQUE NOT NULL,  -- ORD-1042
  user_id           UUID REFERENCES profiles(id),
  user_phone        TEXT NOT NULL,
  order_type        TEXT NOT NULL CHECK (order_type IN ('delivery','dine_in','takeaway')),
  table_number      TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','preparing','ready','dispatched','delivered','cancelled')),
  rejection_reason  TEXT,
  address_id        UUID REFERENCES addresses(id),
  delivery_address  TEXT,
  landmark          TEXT,
  items             JSONB NOT NULL,        -- full snapshot of order
  subtotal          DECIMAL(10,2) NOT NULL,
  delivery_charge   DECIMAL(10,2) DEFAULT 0,
  gst_amount        DECIMAL(10,2) DEFAULT 0,
  gst_percent       DECIMAL(5,2) DEFAULT 0,
  discount_amount   DECIMAL(10,2) DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL,
  payment_method    TEXT CHECK (payment_method IN ('cod','jazzcash','easypaisa','card')),
  payment_status    TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_intent_id TEXT UNIQUE,           -- idempotency key
  prep_time         INTEGER,               -- calculated minutes
  complexity        TEXT CHECK (complexity IN ('green','yellow','red')),
  special_note      TEXT,
  rider_id          UUID,
  accepted_at       TIMESTAMPTZ,
  ready_at          TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);
```

### Table: order_items
```sql
CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id      UUID REFERENCES menu_items(id),
  menu_item_name    TEXT NOT NULL,
  size_label        TEXT,
  base_price        DECIMAL(10,2) NOT NULL,
  customizations    JSONB,   -- [{ingredient_id, name, qty, unit, price}]
  meal_additions    JSONB,
  item_total        DECIMAL(10,2) NOT NULL,
  cooking_pref      TEXT,    -- 'well_done' / 'medium' / 'medium_rare'
  quantity          INTEGER DEFAULT 1,
  blueprint_id      UUID     -- saved custom creation reference
);
```

### Table: saved_creations
```sql
CREATE TABLE saved_creations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  menu_item_id    UUID REFERENCES menu_items(id),
  name            TEXT NOT NULL,
  customizations  JSONB NOT NULL,
  last_price      DECIMAL(10,2),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Table: feedback
```sql
CREATE TABLE feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) UNIQUE,
  user_id         UUID REFERENCES profiles(id),
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  photo_url       TEXT,
  food_rating     INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  rider_rating    INTEGER CHECK (rider_rating BETWEEN 1 AND 5),
  is_resolved     BOOLEAN DEFAULT false,
  owner_reply     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Table: restock_notifications
```sql
CREATE TABLE restock_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ingredient_id   UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  menu_item_id    UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  is_notified     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, ingredient_id, menu_item_id)
);
```

⚠️ **Gap fix (flagged in `frontend_checklist.md` notes):** The "Notify Me"
feature on out-of-stock ingredients (referenced in Section 19 of
`final_master_checklist.md`) had no backing table until this addition.
This table records which user wants to be told when which ingredient
becomes available again, scoped to the specific menu item they were
trying to order. The `UNIQUE` constraint prevents duplicate notification
requests from the same user for the same ingredient/item combination.

How it's consumed:
```
Restaurant toggles ingredient.is_available back to true
        ↓
A Supabase Database Function (trigger on ingredients UPDATE) checks
restock_notifications for matching ingredient_id WHERE is_notified = false
        ↓
For each match: send notification (push/SMS, depending on what
notification channel the team wires up later — this table only stores
the intent to notify, it does not itself send anything)
        ↓
Mark is_notified = true after sending
```

### Table: deals
```sql
CREATE TABLE deals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  name_ur         TEXT,
  description     TEXT,
  image_url       TEXT,
  deal_price      DECIMAL(10,2) NOT NULL,
  original_price  DECIMAL(10,2),
  items           JSONB NOT NULL,    -- included items config
  customize_limit JSONB,             -- per-item customization rules
  is_active       BOOLEAN DEFAULT true,
  valid_from      TIMESTAMPTZ,
  valid_until     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Table: riders
```sql
CREATE TABLE riders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  phone           TEXT UNIQUE NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  is_available    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Table: kitchen_screens
```sql
CREATE TABLE kitchen_screens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  pin             TEXT NOT NULL,      -- hashed
  is_active       BOOLEAN DEFAULT true,
  last_seen       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Table: restaurant_settings
```sql
CREATE TABLE restaurant_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name       TEXT DEFAULT 'Muncherz',
  logo_url              TEXT,
  phone                 TEXT,
  address               TEXT,
  -- Timings
  open_time             TIME,
  close_time            TIME,
  is_manually_closed    BOOLEAN DEFAULT false,
  -- Delivery
  delivery_enabled      BOOLEAN DEFAULT true,
  free_delivery_km      DECIMAL(5,2) DEFAULT 3,
  delivery_charge       DECIMAL(10,2) DEFAULT 150,
  max_delivery_km       DECIMAL(5,2) DEFAULT 10,
  surge_enabled         BOOLEAN DEFAULT false,
  surge_charge          DECIMAL(10,2) DEFAULT 50,
  surge_start_time      TIME,
  surge_end_time        TIME,
  -- Orders
  min_order_amount      DECIMAL(10,2) DEFAULT 500,
  prep_buffer_minutes   INTEGER DEFAULT 0,
  -- Payment methods
  cod_enabled           BOOLEAN DEFAULT true,
  jazzcash_enabled      BOOLEAN DEFAULT true,
  easypaisa_enabled     BOOLEAN DEFAULT true,
  card_enabled          BOOLEAN DEFAULT true,
  -- Features
  loyalty_enabled       BOOLEAN DEFAULT true,
  loyalty_stamp_count   INTEGER DEFAULT 10,
  loyalty_reward_item   TEXT,
  qr_dine_in_enabled    BOOLEAN DEFAULT false,
  printer_enabled       BOOLEAN DEFAULT false,
  print_copies          INTEGER DEFAULT 1,
  kitchen_lcd_enabled   BOOLEAN DEFAULT true,
  -- Tax
  gst_enabled           BOOLEAN DEFAULT false,
  gst_percent           DECIMAL(5,2) DEFAULT 0,
  -- Language
  urdu_enabled          BOOLEAN DEFAULT true,
  updated_at            TIMESTAMPTZ DEFAULT now()
);
```

### Table: staff_accounts
```sql
CREATE TABLE staff_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('owner','manager','chef')),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Table: activity_logs
```sql
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID,
  actor_role      TEXT,
  action          TEXT NOT NULL,
  entity          TEXT,
  entity_id       UUID,
  old_value       JSONB,
  new_value       JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## Row Level Security (RLS) Policies

```sql
-- Users can only see their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Public read for menu (no auth needed to browse)
-- Write only for authenticated restaurant staff
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
```

---

## Realtime Subscriptions

```
Table: orders              → INSERT events feed the KDS (new order alert)
                              UPDATE events feed the user-side order tracker
Table: ingredients         → UPDATE events feed both customer-side
                              availability sync (grayed-out/sold-out items)
                              and the restaurant Inventory Control screen
Table: restaurant_settings → UPDATE events feed the "We're Closed" overlay
                              and any live working-hours change

Note: there is no separate "order_status", "inventory", or
"kitchen_display" channel/table — those were inconsistent names used
elsewhere in earlier drafts of this documentation set and have been
unified to the three table-based subscriptions above. Kitchen LCD reads
accepted orders via the same `orders` UPDATE stream rather than a
fourth dedicated channel.
```

---

## API Routes Structure

```
/api/auth/
  POST  /send-otp          Send OTP to phone
  POST  /verify-otp        Verify OTP + create session

/api/menu/
  GET   /categories        All active categories
  GET   /items             Items by category
  GET   /item/:id          Single item with ingredients
  GET   /deals             Active deals

/api/customizer/
  GET   /ingredients/:itemId    Item ingredients + config
  POST  /validate-price         Server-side price validation

/api/orders/
  POST  /place             Place new order (validate + create)
  GET   /track/:id         Order status
  POST  /cancel/:id        Cancel within grace window
  GET   /history           User order history

/api/payment/
  POST  /initiate          Start PayMob payment
  POST  /webhook           PayMob webhook (idempotent)
  POST  /refund/:id        Initiate refund

/api/restaurant/
  GET   /kds               Live orders for KDS
  POST  /orders/:id/accept Accept order
  POST  /orders/:id/reject Reject with reason
  POST  /orders/:id/ready  Mark as ready
  POST  /orders/:id/assign-rider

/api/kitchen/
  POST  /verify-pin        Verify kitchen screen PIN
  GET   /orders            Accepted orders for display

/api/analytics/
  GET   /daily             Daily sales summary
  GET   /heatmap           Location-based order data
  GET   /popular           Top items + customizations
```

---

## Customizer Engine Architecture

```
Supabase DB
    ↓
fetch ingredients for item_id
    ↓
Sort by z_index + sort_order
    ↓
BurgerCanvas renders layers:
  - bottom_bun (auto, z:1)
  - [user selects items in sequence]
  - top_bun (auto, z:10, always on top)
    ↓
useCustomizerStore (Zustand):
  selections: Record<ingredient_id, quantity>
  addItem(id, limit) → local state only
  removeItem(id, isCore) → core cannot remove
  calculatePrice(basePrice, ingredients) → client-side
    ↓
User clicks NEXT:
  POST /api/customizer/validate-price
  Server recalculates → if tampered → reject
    ↓
Cart → Checkout
```

### Sauce Blend Logic
```typescript
// Same sauce added twice = zero gap, opacity blend
// Different sauce = separate visible layer
// CSS: mix-blend-mode: multiply on sauce layers
// Opacity increases with each same-sauce addition
```

### Layer Sequence Enforcement
```typescript
// bottom_bun: auto-placed, z-index 1
// top_bun: always z-index 10, user cannot place below other items
// Core items: user selects but cannot delete
// Flexible items: user can skip or delete
// Required items (is_required=true): cart locked until added
```

---

## Security Architecture

### Authentication
```
User Panel:    Supabase Phone OTP → JWT cookie (httpOnly)
Restaurant:    Supabase Email/Password → JWT cookie
Developer:     Supabase Email + TOTP 2FA → JWT cookie
Kitchen LCD:   PIN-based (device registered, 3 wrong = lockout)
```

### Price Validation (Anti-Fraud)
```
Client calculates price for UX feedback only
Server ALWAYS recalculates from DB before order creation
If client price != server price → order rejected + logged
```

### Input Sanitization
```
All inputs: Zod schema validation (server-side)
SQL injection: Supabase parameterized queries (RLS)
XSS: Next.js auto-escaping + DOMPurify for user text
File uploads: Type check + size limit + Supabase Storage
```

### Rate Limiting
```
OTP send:      3 per phone per 10 min
Order place:   10 per user per hour
API general:   100 req per IP per min
Payment init:  5 per user per hour
```

### CORS + Headers
```
Strict CORS: Only app domain allowed
Security headers (next.config.js):
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin
  Permissions-Policy: camera=(), microphone=()
  Content-Security-Policy: strict
```

---

## Performance Architecture

### Frontend
```
Next.js App Router:
  - Server Components by default
  - Client Components only where needed (customizer, cart)
  - Dynamic imports for heavy components
  - next/image for all images (WebP auto-convert)
  - Font: next/font (no layout shift)

Bundle optimization:
  - Tree shaking enabled
  - Code splitting per route
  - Customizer engine: lazy loaded
  - Framer Motion: imported per component
```

### Images (Critical for Customizer)
```
All PNG ingredient images:
  - Max size: 200KB per image
  - Transparent background required
  - WebP served via next/image
  - Cached at CDN edge (Vercel)

Supabase Storage:
  - Signed URLs (private by default)
  - Public bucket for menu images only
  - Private bucket for ingredient PNGs
  - Private bucket for feedback photos (signed URL access only)
```

⚠️ **Gap fix (flagged in `frontend_checklist.md` notes):** The
`feedback.photo_url` column (used for complaint photo uploads, Section
15 of `final_master_checklist.md`) had a column defined but no Storage
bucket to actually hold the uploaded files. A dedicated private bucket
is added here rather than reusing `ingredient-pngs` or `menu-images`,
because:
- These photos are user-submitted complaint evidence, not curated
  restaurant content — they need stricter access control than the
  public `menu-images` bucket.
- Mixing them into `ingredient-pngs` would conflate two unrelated
  concerns (developer-controlled canvas assets vs. user complaint
  uploads) under one bucket's access policy.

Bucket name: `feedback-photos`. Access: restaurant staff (owner/manager
roles only — not chef) and the uploading user themselves, via signed
URL, matching the RLS pattern already used for the `feedback` table
itself.

### Database
```
Indexes:
  - orders.user_id
  - orders.status
  - orders.created_at
  - menu_items.category_id
  - menu_items.is_available
  - menu_item_ingredients.menu_item_id
  - ingredients.category
  - activity_logs.actor_id + created_at
  - restock_notifications.ingredient_id + is_notified

Connection pooling: Supabase built-in (pgBouncer)
```

---

## SEO / AEO / GEO Architecture

```
Metadata:
  - generateMetadata() per page (Next.js App Router)
  - Dynamic OG images (next/og)
  - Canonical URLs

Structured Data (JSON-LD):
  - LocalBusiness schema (home page)
  - Restaurant schema
  - Menu schema (items)
  - BreadcrumbList (category pages)

Files:
  - /sitemap.xml — next-sitemap auto-generated
  - /robots.txt — configured
  - /llm.txt — AI crawler friendly

Internationalization:
  - Urdu + English supported
  - hreflang tags
  - RTL layout for Urdu mode

Core Web Vitals:
  - Vercel Analytics (real user monitoring)
  - Lighthouse CI in GitHub Actions
  - Target: LCP < 2.5s, CLS < 0.1
```

---

## Color System (Muncherz Brand)

```css
/* Primary */
--muncherz-red:     #D62828;   /* Main brand red */
--muncherz-yellow:  #F7B731;   /* Accent yellow */
--muncherz-black:   #0A0A0A;   /* Customizer background */
--muncherz-white:   #FAFAFA;   /* Light background */

/* Status */
--success:   #22C55E;
--warning:   #F59E0B;
--error:     #EF4444;
--info:      #3B82F6;

/* Complexity Flags */
--complexity-green:  #22C55E;   /* simple order */
--complexity-yellow: #F59E0B;   /* medium order */
--complexity-red:    #EF4444;   /* heavy order */
```

---

## Accounts Required (All Free)

| Service | Account | Purpose |
|---|---|---|
| Supabase | supabase.com | DB + Auth + Storage + Realtime |
| Vercel | vercel.com | Hosting + CDN |
| PayMob | paymob.com (Pakistan-specific docs at paymob.pk) | JazzCash + Easypaisa + Card |
| Sentry | sentry.io | Error monitoring (prod) |
| GitHub | github.com | Code + CI/CD |
| Cloudflare | cloudflare.com | DNS (optional but recommended) |

⚠️ "Free" is doing a lot of work in this MVP's non-negotiable rules.
Confirmed current limits worth knowing before committing to free-tier-only
as a permanent constraint (not just for MVP): Supabase free tier caps
Realtime at 200 concurrent connections and auto-pauses a project after
roughly 7 days with no API traffic. See `ROLLBACK.md` Section 5A and
`SECURITY.md` Disaster Recovery for what this means operationally.

---

## Changes Made (Audit Pass)

- Translated the one Roman Urdu SQL comment ("kam" → "low") in the `ingredients` table.
- **Fixed the Realtime Subscriptions section** to match the unified table-based model now applied consistently across `ARCHITECTURE.md`, `DEPLOYMENT.md`, and `final_master_checklist.md` (see `DEPLOYMENT.md` Changes Made for the full explanation of the three-way inconsistency this corrects).
- **Added a prominent architecture note** that the "future-proof for multi-restaurant" claim in `ai-instructions.md` is not actually true of the current schema — zero tables carry a tenant/restaurant identifier. Flagged as a decision the team needs to make explicitly (drop the claim, or add the column now while it's cheap) rather than something this audit silently resolved on its behalf.
- **Added a precedence rule** for `is_core`/`is_required`, which existed redundantly on both `ingredients` and `menu_item_ingredients` with no stated rule for which one wins. `menu_item_ingredients` is now documented as the runtime source of truth.
- Added a caveat under "Accounts Required" that Supabase's free tier has a 200-connection Realtime cap and auto-pauses after ~7 days of inactivity — relevant given how many Realtime-dependent features this architecture stacks on top of a single free-tier project (KDS, tracker, kitchen LCD, inventory sync, closed overlay).
- PayMob's Pakistan support (JazzCash, Easypaisa, Card) was verified current — that part of the stack checks out and didn't need a fix.
- **Added the `restock_notifications` table**, closing the gap flagged in `frontend_checklist.md`'s notes section — the "Notify Me" feature on out-of-stock ingredients had no backing table until now. Includes a `UNIQUE` constraint and the consumption flow (database trigger on ingredient restock → notify matching rows).
- **Added a dedicated `feedback-photos` Storage bucket**, closing the second gap flagged in `frontend_checklist.md` — the `feedback.photo_url` column existed with nowhere defined to actually store the uploaded file. Kept separate from `ingredient-pngs` and `menu-images` since it holds user-submitted complaint evidence, not developer/restaurant-curated content, and needs its own access scope (restaurant staff + uploading user only).
- Added the corresponding index (`restock_notifications.ingredient_id + is_notified`) to the Database Indexes list so the restock trigger's lookup stays fast as notification requests accumulate.
