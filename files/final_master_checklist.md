# final_master_checklist.md — Muncherz
# Vibe coding checklist. Pick ONE section at a time.
# Before writing any prompt: read ai-instructions.md + your editor's
# quick-reference file (quick-reference-antigravity.md or quick-reference-codex.md)

---

## How To Use This Checklist

```
1. Pick one section below (e.g. "Section 3 — Customizer Canvas")
2. Write a prompt that includes:
   - Reference to ai-instructions.md (especially the customizer logic
     section if relevant)
   - Reference to your AI editor's quick-reference file
     (quick-reference-antigravity.md or quick-reference-codex.md —
     neither editor auto-loads this from disk, so paste the relevant
     content in directly)
   - The exact checklist items from that section
   - Any relevant DB schema from ARCHITECTURE.md
3. Give to AI editor
4. Check off items as they're completed and verified working
5. Run: npm run type-check && npm run lint && npm run build
6. Commit with conventional commit message
7. Move to next section

⚠️ Never start a section before its dependencies are checked off.
   Dependency order is noted at the top of each section.
```

---

## SECTION 1 — Project Setup & Foundation
**Dependencies: None — start here**

```
[ ] Initialize Next.js 15 project (App Router, TypeScript strict)
[ ] Install core dependencies: tailwindcss, framer-motion, zustand, zod
[ ] Install Shadcn UI, run init, configure components.json
[ ] Configure tsconfig.json — strict: true, no implicit any
[ ] Configure ESLint + Prettier with import order rule
[ ] Set up Husky pre-commit hooks (type-check, lint)
[ ] Create folder structure exactly as defined in README.md
[ ] Set up .env.example and .env.local (gitignored)
[ ] Configure next.config.js — security headers, image domains
[ ] Set up Tailwind config with Muncherz color tokens
      (--muncherz-red, --muncherz-yellow, --muncherz-black, --muncherz-white)
[ ] Set up next/font for primary typeface (no layout shift)
[ ] Initialize Git repo, create develop branch, push initial commit
[ ] Set up GitHub Actions CI workflow (type-check, lint, build on PR)
[ ] Verify npm run dev starts clean with zero console errors/warnings
```

---

## SECTION 2 — Supabase Setup & Database Schema
**Dependencies: Section 1**

```
[ ] Create Supabase project
[ ] Install @supabase/supabase-js and @supabase/ssr
[ ] Set up Supabase client (browser + server variants) in src/lib/supabase/
[ ] Create all tables from ARCHITECTURE.md schema:
      [ ] profiles
      [ ] addresses
      [ ] categories
      [ ] menu_items
      [ ] ingredients
      [ ] menu_item_ingredients
      [ ] orders
      [ ] order_items
      [ ] saved_creations
      [ ] feedback
      [ ] deals
      [ ] riders
      [ ] kitchen_screens
      [ ] restaurant_settings
      [ ] staff_accounts
      [ ] activity_logs
[ ] Add all indexes listed in ARCHITECTURE.md performance section
[ ] Enable RLS on every table — no exceptions
[ ] Write RLS policies:
      [ ] profiles — user can only read/update own row
      [ ] orders — user can only read own orders; restaurant role can
            read/update all
      [ ] addresses — user can only access own addresses
      [ ] saved_creations — user can only access own
      [ ] feedback — user can create own, restaurant can read all + reply
      [ ] menu_items / ingredients — public read, restaurant-role write only
      [ ] activity_logs — insert only, no update/delete for anyone
[ ] Enable Realtime on: orders, restaurant_settings (for closed overlay),
      ingredients (for stock availability sync)
[ ] Create Storage buckets:
      [ ] menu-images (public)
      [ ] ingredient-pngs (private, signed URL access)
[ ] Seed initial restaurant_settings row (Muncherz defaults)
[ ] Test connection from Next.js app — simple query succeeds
```

---

## SECTION 3 — Auth System (User + Restaurant + Developer)
**Dependencies: Section 2**

```
[ ] Configure Supabase Auth — Phone OTP provider enabled
[ ] Build OTP send API route — POST /api/auth/send-otp
      [ ] Zod validation on phone number format (Pakistan format)
      [ ] Rate limit: 3 sends per phone per 10 minutes
[ ] Build OTP verify API route — POST /api/auth/verify-otp
      [ ] Creates/updates profiles row on first verify
      [ ] Sets httpOnly JWT cookie session
[ ] Build login UI — phone input → OTP input → success redirect
[ ] Build restaurant staff login — Email + Password (Supabase Auth)
      [ ] Role check against staff_accounts table on every protected request
[ ] Build developer login — Email + Password + TOTP 2FA
      [ ] 2FA setup flow (QR code generation, TOTP verification)
[ ] Middleware: protect /restaurant/* routes — staff role required
[ ] Middleware: protect /developer/* routes — developer role + 2FA required
[ ] Build logout flow for all three panels
[ ] Test: unauthenticated access to protected routes redirects correctly
[ ] Test: wrong role accessing wrong panel is blocked
```

---

## SECTION 4 — Kitchen LCD PIN Security
**Dependencies: Section 2, Section 3**

```
[ ] Build kitchen_screens management UI in restaurant panel
      [ ] Add new kitchen screen → generates unique PIN
      [ ] PIN hashed before storing (never plain text)
      [ ] List of registered screens with last_seen timestamp
      [ ] Revoke/deactivate screen button
[ ] Build /kitchen route — standalone, no normal auth, PIN entry screen
[ ] Build PIN verify API — POST /api/kitchen/verify-pin
      [ ] 3 wrong attempts → lockout + alert to restaurant owner
      [ ] On success — device gets long-lived session token (until revoked)
[ ] Kitchen screen, once verified, auto-loads accepted orders only
      (never shows pending/rejected orders)
[ ] Test: wrong PIN 3 times locks out correctly
[ ] Test: revoking a screen from restaurant panel immediately blocks it
```

---

## SECTION 5 — Home Screen (User Panel)
**Dependencies: Section 2, Section 3**

```
[ ] Build top header — logo, location/delivery estimate, search icon
[ ] Build hero/deals banner — horizontal scroll, pulls from deals table
[ ] Build search bar — filters menu_items by name (debounced)
[ ] Build category grid — pulls from categories table, image + label cards
[ ] Build category tabs (horizontal scroll bar) — Beef Burgers, Chicken,
      Wraps, Hot Dogs, Fries, etc.
[ ] Build item listing grid per category:
      [ ] Item card: image, name, short description, price
      [ ] Discount badge (red, top-left corner) — shows when
            show_discount = true
      [ ] Crossed-out original price + discounted price display
      [ ] "Add Standard" button — direct add to cart, no customization
      [ ] "Customize" button — opens customizer
[ ] Build "Frequently Added" / starters horizontal section
      (simple list: image, name, price, quick-add button)
[ ] Build "Best Seller" / "Chef's Pick" badge display logic
[ ] Build daily special banner with live countdown timer
      (hides automatically when special_ends_at passes)
[ ] Restaurant closed overlay:
      [ ] Listens to restaurant_settings realtime channel
      [ ] If is_manually_closed = true OR outside open_time/close_time
      [ ] Full-screen overlay: logo, "We're Closed", next opening time
      [ ] Smooth dimming animation (not abrupt)
      [ ] Menu still browsable, ordering blocked
[ ] Test: all sections load correctly with empty/seed data
[ ] Test: closed overlay triggers correctly at boundary times
```

---

## SECTION 6 — Item Detail Modal (Pre-Customize)
**Dependencies: Section 5**

```
[ ] Build item detail view (tap on item card before customize) —
      similar reference layout to provided Brim screenshot but Muncherz
      themed (red/yellow/black, not generic)
[ ] Show: large image, name, description, price (with discount logic)
[ ] Show size variant selector if size_variants present (S/M/L)
[ ] Show "Add Standard" and "Customize" CTAs clearly separated
[ ] Show cooking preference selector if applicable (Well Done/Medium/etc.)
      — only for items where restaurant has enabled this option
[ ] Test: size selection updates displayed price before customize/add
```

---

## SECTION 7 — Customizer Engine: Canvas & Layer System
**Dependencies: Section 2, Section 6**
**⚠️ READ ai-instructions.md "Core Feature" section fully before this**

```
[ ] Create src/lib/layerConfig.ts — default layer position constants
[ ] Build useCustomizerStore (Zustand):
      [ ] selections: Record<ingredientId, {qty, isCore}>
      [ ] addItem(ingredientId, maxLimit)
      [ ] removeItem(ingredientId, isCore) — blocks if core + qty would be 0
      [ ] resetCustomizer()
      [ ] calculateSubtotal(basePrice, ingredientsList)
      [ ] calculatePrepTime(baseTime, ingredientsList)
[ ] Build BurgerCanvas.tsx — fixed-size container (responsive, maintains
      aspect ratio), renders layers sorted by z_index
[ ] Build IngredientLayer.tsx — single layer component, positioned via
      yPosition/widthRatio from DB, Framer Motion entry/exit animation
[ ] Implement bottom_bun auto-placement logic (single type) vs user
      choice (multiple types)
[ ] Implement top_bun — always z-index 10, always rendered last/on top
[ ] Implement patty + cheese as CORE — is_required enforcement
[ ] Implement entry animation: menu photo implode+fade → black screen →
      split layout stagger-in
[ ] Implement exit animation: simple fade out (no reverse-explode)
[ ] Test: layers always render in correct stacking order regardless of
      add sequence
[ ] Test: burger looks proportionally correct with placeholder PNG set
[ ] Test: 60fps maintained on throttled CPU (Chrome DevTools)
```

---

## SECTION 8 — Customizer Engine: Ingredient Panels & Interaction
**Dependencies: Section 7**

```
[ ] Build IngredientCard.tsx (left/right panel cards) — image, name, +/-
      controls or tap-to-select depending on category
[ ] Build LimitBar.tsx — visual fill indicator per ingredient, fills
      toward max_limit, shake animation + lock at 100%
[ ] Implement core item zero-block:
      [ ] Attempt to reduce patty/cheese to 0 → blocked
      [ ] Toast message shown (restaurant-defined alert text from DB
            if available, else default message)
[ ] Implement max limit block:
      [ ] "+" disabled at max_limit
      [ ] Toast with restaurant-defined warning message
[ ] Implement topping 3-tier quantity selector:
      [ ] Light / Regular / Extra images per topping
      [ ] Selecting one replaces previous tier (not additive)
[ ] Implement sauce layering:
      [ ] Same sauce tapped again → same position, zero gap, opacity blend
      [ ] Different sauce → distinct layer, separate state tracking
[ ] Implement left/right arrow navigation + swipe gesture support
[ ] Implement core item swap (e.g. bun type change) without removing slot
[ ] Build SummaryList.tsx (right panel) — live synced list with thumbnail,
      name, qty, price contribution — same Zustand store as canvas
[ ] Build live price odometer animation (Framer Motion useSpring or
      AnimatePresence)
[ ] Build live prep time counter (same animation style)
[ ] Test: every interaction in this section reflects instantly in both
      canvas AND summary list
[ ] Test: navigating back and forth preserves all selections correctly
```

---

## SECTION 9 — Customizer: Pizza & Simple-Item Canvas Variants
**Dependencies: Section 7, Section 8**

```
[ ] Build PizzaCanvas.tsx — top-down circular layout
      [ ] Crust selection (locked/limited choice per restaurant config)
      [ ] Sauce base selection
      [ ] Toppings scatter radially using same 3-tier quantity system
[ ] Build RollCanvas.tsx — horizontal open-wrap layout
      [ ] Wrap stays visually open (no closing/rolling animation in MVP)
      [ ] Sauce/topping quantity adjustment only
[ ] Build SimpleItemSelector.tsx — for fries/drinks/sides
      [ ] Size selector, flavor selector, no animated canvas
[ ] Implement canvas_type-based routing — single customizer entry point
      dynamically renders correct canvas component
[ ] Test: same Zustand store pattern and validation rules apply
      consistently across all canvas types
```

---

## SECTION 10 — With Meal Selector
**Dependencies: Section 8**

```
[ ] Build MealSelector.tsx popup — triggers after "Add to Cart" if
      menu_items.with_meal = true for that item
[ ] Show meal_options from DB (drink, fries, sauce, etc. as configured
      by restaurant)
[ ] Allow meal items to also be lightly customized if restaurant enables
      it (e.g. drink size change, sauce swap) — reuses same +/- pattern
[ ] "Add Meal" / "No Thanks" buttons — clear skip path
[ ] If skipped, allow re-adding meal later from Cart screen
      (meal tag + edit/remove option on cart line item)
[ ] Price updates live as meal options are adjusted
[ ] Test: skipping meal does not block checkout
[ ] Test: meal price correctly added to order total server-side
```

---

## SECTION 11 — Cart
**Dependencies: Section 8, Section 10**

```
[ ] Build useCartStore (Zustand) — separate from customizer store,
      persists across navigation within session
[ ] Build Cart page — list of all added items (standard + customized)
[ ] Each line item shows: image, name, customization summary
      (e.g. "2x Patty, Extra Jalapeno, Brioche Bun"), meal tag if attached,
      price, quantity, edit button, remove button
[ ] "Edit" on a customized item re-opens customizer with same state
      pre-loaded
[ ] Meal tag — add/remove option directly from cart line
[ ] Saved creations quick-add section (if user has any saved)
[ ] Previous orders "Order Again" quick-add section
[ ] Special instructions text field (optional, free text, sent to kitchen)
[ ] Cart item quantity limit enforcement (restaurant-configurable max
      per item per order)
[ ] Subtotal calculation displayed (client-side estimate)
[ ] Minimum order amount check:
      [ ] If subtotal < restaurant_settings.min_order_amount
      [ ] Checkout button disabled
      [ ] Message: "Add Rs. X more to reach minimum order"
[ ] Empty cart state — friendly message + browse menu CTA
[ ] Test: editing a customized item and saving updates cart correctly
[ ] Test: removing core-required item from a saved customization in
      edit mode still enforces core rules
```

---

## SECTION 12 — Checkout
**Dependencies: Section 11, Section 3**

```
[ ] Build Checkout page layout
[ ] Phone number field — pre-filled from session, OTP re-verify if
      changed
[ ] Address selection:
      [ ] Saved addresses list (Home/Office/Other) with default flag
      [ ] Add new address form — text + landmark (mandatory) + map pin
      [ ] Delivery radius validation (Google Maps API or lat/long check
            against restaurant_settings.max_delivery_km)
      [ ] If outside radius — checkout blocked, clear message shown
[ ] Order type selector — Delivery / Dine-in (if QR-scanned, table
      pre-filled) / Takeaway
[ ] Itemized receipt breakdown (REQUIRED — legal/transparency):
      [ ] Subtotal
      [ ] Delivery charge (with surge pricing applied if active)
      [ ] GST (if restaurant_settings.gst_enabled)
      [ ] Total
[ ] Payment method selector — only shows methods where
      restaurant_settings.[method]_enabled = true
      [ ] COD
      [ ] JazzCash
      [ ] Easypaisa
      [ ] Card
      [ ] At least one method must always remain enabled (validated in
            restaurant settings, not here)
[ ] Terms & Privacy Policy checkbox — mandatory before order placement
[ ] Estimated delivery time display:
      [ ] Formula: dynamic prep time (from customizer + base) + rider
            travel time estimate
      [ ] Single combined number shown to user, not separate breakdown
[ ] "Place Order" button — disabled until all required fields valid
[ ] Test: order blocked correctly when outside delivery radius
[ ] Test: itemized breakdown math is correct against server calculation
```

---

## SECTION 13 — Order Placement API (Server-Side Validation)
**Dependencies: Section 12, Section 2**
**⚠️ This is a critical security section — review against ai-instructions.md**

```
[ ] Build POST /api/orders/place
      [ ] Zod schema validates entire payload shape
      [ ] Server re-fetches ALL ingredient/item prices from Supabase —
            never trusts client-sent prices
      [ ] Server recalculates subtotal, GST, delivery charge, total
            independently
      [ ] If client total != server total → reject order, log to
            activity_logs as suspicious, return generic error to client
      [ ] Validates minimum order amount server-side too
      [ ] Validates delivery radius server-side too
      [ ] Generates unique order_number (e.g. ORD-1042, sequential or
            timestamp-based)
      [ ] Generates payment_intent_id for idempotency
      [ ] Inserts into orders + order_items tables atomically (use a
            Supabase transaction/RPC function)
      [ ] Calculates complexity flag (green/yellow/red) based on
            customization count and rules in ai-instructions.md
      [ ] If COD — order status set to 'pending', awaits restaurant accept
      [ ] If online payment — redirects to payment initiation flow first,
            order created only after payment confirms (or held in a
            pending-payment state)
[ ] Build rate limiting middleware — 10 orders per user per hour
[ ] Build 60-second grace cancel window:
      [ ] Cancel only allowed while order status = 'pending'
            (before restaurant accepts)
      [ ] Once restaurant accepts → cancel button disappears immediately,
            regardless of elapsed time
[ ] Test: tampering client-side price in browser dev tools results in
      order rejection
[ ] Test: order placed twice rapidly with same payment_intent_id does
      not create duplicate orders
```

---

## SECTION 14 — Payment Integration (PayMob)
**Dependencies: Section 13**

```
[ ] Set up PayMob account + sandbox credentials
[ ] Build POST /api/payment/initiate
      [ ] Creates PayMob payment intent for the order total
      [ ] Returns redirect/iframe URL for JazzCash/Easypaisa/Card flow
[ ] Build POST /api/payment/webhook
      [ ] Verifies HMAC signature against PAYMOB_HMAC_SECRET
      [ ] Idempotent — checks payment_intent_id before processing,
            ignores duplicate webhook deliveries
      [ ] Updates order payment_status and status on success
      [ ] On failure — order status updated, user notified, retry option
            shown (up to 3 attempts before auto-cancel)
[ ] Build payment failed/retry UI screen
[ ] Build POST /api/payment/refund/:id — for cancellations after payment
[ ] Network-drop resilience:
      [ ] Pending payment state stored locally (encrypted) before
            redirect to payment gateway
      [ ] On return to app, background check confirms order status from
            server regardless of local network interruption
[ ] Test: webhook replay (same payload sent twice) does not double-create
      or double-process
[ ] Test: payment failure shows retry flow without losing cart contents
```

---

## SECTION 15 — Order Tracker & Feedback
**Dependencies: Section 13**

```
[ ] Build order tracker page — realtime subscription to specific
      order's status via Supabase Realtime
[ ] Global persistent countdown timer component — shows on main app
      shell while an active order exists, not just on tracker page
[ ] Status timeline UI: Order Received → Chef Preparing → Ready →
      Dispatched → Delivered
[ ] Micro-status text updates tied to time elapsed/remaining
[ ] On order marked 'delivered' — auto-trigger feedback modal
[ ] Build Feedback modal:
      [ ] 5-star rating (overall, plus optional separate food rating
            and rider rating)
      [ ] Text comment field
      [ ] Optional photo upload (for complaints) — stored in Supabase
            Storage, linked to feedback row
      [ ] Submits to feedback table, links order_id
[ ] Test: timer persists correctly across app navigation during active
      order
[ ] Test: feedback modal does not show twice for same order
```

---

## SECTION 16 — Profile (Saved Creations, Addresses, Stamps)
**Dependencies: Section 3, Section 11**

```
[ ] Build Profile page shell — name, phone, language toggle
[ ] Saved Creations section:
      [ ] List of saved custom items with thumbnail + name
      [ ] One-tap re-add to cart (price recalculated from current rates,
            user notified if price changed since saving)
      [ ] Delete saved creation option
[ ] Save flow from customizer — checkbox "Save this creation as..." with
      name input, writes to saved_creations table
[ ] Saved Addresses management — add/edit/delete, set default
[ ] Loyalty stamps display — current count, progress toward reward,
      only shown if restaurant_settings.loyalty_enabled = true
[ ] Order history list — filterable by date, with reorder button per
      past order
[ ] Language toggle (English/Urdu) — persists preference, applies RTL
      layout when Urdu selected
[ ] Account deletion option (legal requirement) — confirms intent,
      removes/anonymizes personal data per privacy policy
[ ] Test: saved creation reorder shows correct updated price with
      clear notice if changed
```

---

## SECTION 17 — Restaurant Panel: Live KDS
**Dependencies: Section 13, Section 3**

```
[ ] Build /restaurant/kds page — three columns: Pending / Preparing / Ready
[ ] Realtime subscription — new orders appear instantly, no refresh
[ ] Order card displays (per ai-instructions.md format):
      [ ] Order number, type (delivery/dine-in/takeaway), table if dine-in
      [ ] Full ingredient breakdown grouped clearly (core items, then
            sauce flavors with quantity multiplier e.g. "2x")
      [ ] Cooking preference if applicable
      [ ] Meal additions if any
      [ ] Special instructions
      [ ] Complexity flag (green/yellow/red) with corresponding color
      [ ] Live countdown timer per order
      [ ] Payment method + status indicator
[ ] Accept button — moves order to Preparing, starts timer, disables
      user-side cancel immediately
[ ] Reject button — requires reason selection (out of stock / closing
      soon / too busy / other), notifies user
[ ] Ready button — moves to Ready column, triggers rider
      notification/assignment flow
[ ] Order grouping/sorting helper — groups similar core ingredients
      across multiple simultaneous orders for kitchen efficiency display
[ ] Printer integration toggle respected — if enabled, print triggers
      on Accept (1 or 2 copies per restaurant_settings.print_copies)
[ ] Test: order accept correctly removes cancel ability on user side
      in real-time
[ ] Test: multiple simultaneous orders display correctly without
      overlap/lag
```

---

## SECTION 18 — Restaurant Panel: Menu Manager
**Dependencies: Section 2, Section 3**

```
[ ] Build /restaurant/menu page — list of all menu_items, grouped by
      category
[ ] Add/Edit menu item form:
      [ ] Name (EN + UR), description (EN + UR), category select
      [ ] Image upload (standard photo, public bucket)
      [ ] Base price, discount price toggle + value
      [ ] Size variants editor (add/remove S/M/L with individual pricing)
      [ ] Canvas type select (burger/pizza/roll/simple)
      [ ] Best Seller / Chef's Pick badge toggles
      [ ] With Meal toggle + meal options config
      [ ] Daily special toggle + countdown end time
      [ ] Publish/hide toggle
[ ] Ingredient assignment per item (menu_item_ingredients):
      [ ] Select from global ingredients list
      [ ] Mark is_core, is_required, is_flexible per assignment
      [ ] Set default_qty, max_qty per assignment
      [ ] Reorder sort_order (drag or up/down)
[ ] Global Ingredients manager (separate section):
      [ ] Add/edit ingredient — name (EN+UR), category, price_per_unit,
            standard_unit, max_limit, stock_count
      [ ] ⚠️ PNG image fields (png_image_url, qty tier images, z_index,
            yPosition, widthRatio) are DEVELOPER-CONTROLLED — restaurant
            UI does not expose these fields for editing, only viewing
[ ] Test: toggling an item's "publish" status reflects immediately on
      home screen
[ ] Test: changing is_core/is_required on an ingredient correctly
      changes customizer validation behavior on next load
```

---

## SECTION 19 — Restaurant Panel: Inventory Control
**Dependencies: Section 18**

```
[ ] Build /restaurant/inventory page
[ ] List all ingredients with current is_available toggle
[ ] Stock count input (optional — null means unlimited)
[ ] Toggling OFF an ingredient:
      [ ] Instantly reflects on user side via Realtime — ingredient
            shows grayscale + lock icon + "Currently Unavailable"
      [ ] Customize/Add button disabled for affected combos
      [ ] "Notify Me" bell option available to user for that ingredient
[ ] Auto sold-out logic:
      [ ] If stock_count reaches 0 → is_available auto-set to false
      [ ] Low stock alert (low_stock_alert threshold) — notification
            shown in restaurant panel dashboard
[ ] Whole menu item out-of-stock handling (not just ingredient level):
      [ ] Manual "Sold Out" toggle on menu item itself
      [ ] Shows "Sold Out" badge on user side, item not orderable
[ ] Test: toggling ingredient off mid-customization for another active
      user session shows correctly without breaking their existing
      customizer state for already-added items
```

---

## SECTION 20 — Restaurant Panel: Deals Manager
**Dependencies: Section 18**

```
[ ] Build /restaurant/deals page
[ ] Pre-made deal builder:
      [ ] Name (EN+UR), image, deal price, original price (for
            crossed-out display)
      [ ] Select included items (e.g. 2x Burger + 1x Fries + 2x Drink)
      [ ] Per-item customization limit config (e.g. "burger in this deal
            can have max 1 extra topping")
      [ ] Active/inactive toggle, valid date range
[ ] "Build Your Own Deal" config:
      [ ] Define slots (Main/Side/Drink), eligible items per slot,
            combined discounted price logic
[ ] Deal display on home screen — Hot Deals tab pulls from this data
[ ] Customize Deal flow — reuses same customizer engine per sub-item
      within the deal context, tracks combined price correctly
[ ] Test: customizing an item within a deal correctly adds extra cost
      on top of deal base price when limits are exceeded
```

---

## SECTION 21 — Restaurant Panel: Orders History & Financials
**Dependencies: Section 17**

```
[ ] Build /restaurant/orders page
[ ] Daily/weekly/monthly order list with filters (date range, status,
      order type)
[ ] Financial breakdown:
      [ ] COD vs JazzCash vs Easypaisa vs Card totals
      [ ] Total revenue, average order value
      [ ] Cancelled orders list with reasons
      [ ] COD pending confirmation flag (rider hasn't confirmed cash
            collected yet)
[ ] Daily sales log — line-wise record: date, total orders, total
      revenue, top-selling item, busiest area (carried forward into
      Analytics too, but raw daily log lives here)
[ ] Tax invoice/receipt view per order — matches order_number shown to
      user, includes GST breakdown if enabled
[ ] Export not required in MVP — flagged as future enhancement only
[ ] Test: financial totals match sum of individual order totals exactly
```

---

## SECTION 22 — Restaurant Panel: Analytics
**Dependencies: Section 21**

```
[ ] Build /restaurant/analytics page
[ ] Live revenue counter (today)
[ ] Order volume chart (daily/weekly trend)
[ ] Geographic heatmap — orders grouped by delivery area (from address
      lat/long data)
[ ] Peak hours chart — order volume by hour of day
[ ] Top-selling items list
[ ] Most popular customizations list (e.g. "70% of burger orders add
      extra jalapeno")
[ ] Test: charts render correctly with sparse/seed data without
      breaking layout
```

---

## SECTION 23 — Restaurant Panel: Feedback Log
**Dependencies: Section 15**

```
[ ] Build /restaurant/feedback page
[ ] List all feedback — star rating, comment, photo (if attached),
      linked order
[ ] "View Customization Blueprint" button — shows exact ingredients/
      quantities from that order's order_items
[ ] Owner reply field — writes to feedback.owner_reply, visible to user
      in their order history
[ ] 1-2 star reviews trigger a red alert/highlight in the list
[ ] Resolved/unresolved toggle for complaint tracking
[ ] Test: blueprint view accurately reflects the exact customization
      that was ordered, not the current menu defaults
```

---

## SECTION 24 — Restaurant Panel: Delivery & Settings
**Dependencies: Section 2**

```
[ ] Build /restaurant/settings page — maps to restaurant_settings table
[ ] Working hours — open_time, close_time, manual closed override toggle
[ ] Delivery settings:
      [ ] Free delivery radius (km)
      [ ] Flat/distance-based delivery charge
      [ ] Max delivery radius (orders blocked beyond this)
      [ ] Surge pricing toggle + time window + surge charge amount
[ ] Minimum order amount field
[ ] Prep time buffer field (manual rush-hour adjustment, added to all
      base prep times)
[ ] Payment methods toggles — COD/JazzCash/Easypaisa/Card
      [ ] Validation: at least one must remain enabled, block save
            otherwise with clear error
[ ] Loyalty program toggle + stamp count + reward item config
[ ] QR dine-in toggle — when enabled, generates/displays QR codes per
      table number for printing
[ ] Printer toggle + copy count (1 or 2)
[ ] Kitchen LCD toggle (master on/off for the whole feature)
[ ] GST toggle + percentage field
[ ] Urdu language toggle (master on/off for the feature across app)
[ ] Test: disabling all payment methods except one is allowed; attempting
      to disable the last one is blocked
[ ] Test: manual "closed" toggle immediately shows closed overlay on
      user side via Realtime
```

---

## SECTION 25 — Restaurant Panel: Staff Access (RBAC)
**Dependencies: Section 3**

```
[ ] Build /restaurant/staff page
[ ] Add staff account — name, email, role (owner/manager/chef)
[ ] Role permission matrix enforced at API + UI level:
      [ ] Owner — full access to everything including financials,
            settings, staff management
      [ ] Manager — everything except staff management and possibly
            financial export-level data (configurable, but financials
            view itself can remain visible per earlier decision —
            confirm with team before restricting)
      [ ] Chef — KDS access only, no other restaurant panel pages
            visible or reachable
[ ] Deactivate/remove staff account option
[ ] Test: chef-role login redirects away from any non-KDS restaurant
      panel route attempted directly via URL
```

---

## SECTION 26 — Developer Panel
**Dependencies: Section 3**

```
[ ] Build /developer/dashboard page — protected by 2FA-gated auth
[ ] App health indicator — simple ping/health check status (green/red)
[ ] Live active users counter (approximate, via session/connection count)
[ ] Error log viewer — pulls from Sentry or a lightweight error table
      [ ] Filterable by severity, route, time range
[ ] Payment success rate widget — % successful vs failed over time window
[ ] Database status widget — connection health, query latency sample
[ ] Activity log viewer (from activity_logs table) — security-relevant
      events (price mismatch attempts, failed kitchen PIN attempts, role
      access denials)
[ ] Test: dashboard loads independently of restaurant/user panel state,
      accessible only with correct 2FA
```

---

## SECTION 27 — QR Code Dine-In Flow
**Dependencies: Section 24, Section 5**

```
[ ] Generate unique QR code per table number (links to app URL with
      table param, e.g. ?table=4)
[ ] On scan — app opens, table number auto-applied to order_type/
      table_number for the session
[ ] Order placed via QR flow shows "DINE-IN — Table 4" clearly on KDS
[ ] Feature fully toggle-able off in settings — when off, QR entry
      points are hidden, manual order type selection used instead
[ ] Test: scanning QR and placing order correctly tags table number
      end-to-end through to KDS
```

---

## SECTION 28 — Printer Integration (Optional Toggle)
**Dependencies: Section 17, Section 24**

```
[ ] Research/implement browser-based print trigger
      (window.print() targeting a formatted receipt template, or thermal
      printer SDK if a specific printer model is confirmed by restaurant)
[ ] Build print-friendly KOT (Kitchen Order Ticket) template — matches
      format in ai-instructions.md / ARCHITECTURE.md examples
[ ] Trigger on order Accept — only if restaurant_settings.printer_enabled
[ ] Print copy count respects print_copies setting (1 = kitchen only,
      2 = kitchen + customer copy)
[ ] Test: toggling printer off completely removes any print trigger,
      no errors thrown
```

---

## SECTION 29 — Rider Management
**Dependencies: Section 17**

```
[ ] Build riders management UI in restaurant panel (could live under
      Settings or a dedicated Delivery sub-section)
[ ] Add/edit/deactivate rider — name, phone, active/available status
[ ] Assign rider to an order from KDS "Ready" column
[ ] Lightweight rider-facing web view (no separate app):
      [ ] Shows assigned order — customer phone, delivery address/map
            link, order number
      [ ] "Mark Delivered" button
      [ ] COD confirmation checkbox ("Payment collected" — flags
            payment_status accordingly)
[ ] COD pending flag surfaces in restaurant Orders/Financials page if
      rider hasn't confirmed collection
[ ] Test: marking delivered correctly triggers feedback modal on user
      side and stops the global countdown timer
```

---

## SECTION 30 — SEO, AEO, GEO & Performance Pass
**Dependencies: All user-facing sections (5 through 16)**

```
[ ] generateMetadata() implemented on every page — title, description,
      OG image, canonical URL
[ ] JSON-LD structured data:
      [ ] LocalBusiness/Restaurant schema on home page
      [ ] Menu schema on category/item pages
      [ ] BreadcrumbList on nested pages
[ ] next-sitemap configured — sitemap.xml auto-generated and verified
[ ] robots.txt configured correctly (allow public pages, disallow
      /restaurant, /developer, /kitchen, /api)
[ ] /llm.txt created for AI crawler discoverability
[ ] hreflang tags for EN/UR versions
[ ] RTL layout verified correct across all user-facing pages in Urdu mode
[ ] Alt text present on every image, translated for Urdu mode
[ ] Lighthouse audit run — Performance/SEO/Accessibility/Best Practices
      all scored, issues addressed:
      [ ] LCP < 2.5s
      [ ] CLS < 0.1
      [ ] FID/INP < 100ms
      [ ] Bundle size reviewed, code-splitting confirmed on customizer
[ ] Image optimization audit — all images via next/image, WebP confirmed,
      ingredient PNGs under 200KB each
[ ] Test: Lighthouse score re-checked after any major feature addition,
      not just once at the end
```

---

## SECTION 31 — Security Hardening Pass
**Dependencies: All sections involving user input or money**

```
[ ] Confirm RLS active and correctly scoped on every single table —
      re-audit against ARCHITECTURE.md list
[ ] Confirm every API route has Zod validation on its input
[ ] Confirm every price-affecting endpoint re-validates server-side
      (orders, deals)
[ ] Confirm rate limiting active on: OTP send, order placement, payment
      initiation, kitchen PIN attempts
[ ] Confirm security headers set in next.config.js (X-Frame-Options,
      X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP)
[ ] Confirm no secrets present anywhere in client-side bundle
      (search build output for any leaked SERVER ONLY env values)
[ ] Confirm activity_logs correctly capturing: price mismatch attempts,
      failed kitchen PIN attempts, role access denials, manual price/
      settings changes by staff
[ ] Confirm file upload validation (type + size) enforced server-side
      for menu images and feedback photos
[ ] Confirm kitchen LCD device lockout and revocation working correctly
[ ] Confirm 2FA enforced on developer panel with no bypass path
[ ] Run a basic penetration pass manually:
      [ ] Attempt to alter price via browser dev tools network tab
      [ ] Attempt to access /restaurant/* without staff session
      [ ] Attempt to access /developer/* without 2FA session
      [ ] Attempt kitchen PIN brute force (should lock after 3)
      [ ] Attempt duplicate payment webhook replay
[ ] Document any findings and fix before production deploy
```

---

## SECTION 32 — Final Polish & Edge Cases
**Dependencies: All previous sections**

```
[ ] App crash recovery — customizer progress auto-saved locally
      (Zustand persist middleware), restorable on reload with
      "Continue your customization?" prompt
[ ] Internet-lost-during-order-placement handling — clear success/
      failure status shown, never left ambiguous
[ ] Slow network mode — reduce/simplify animations gracefully, ensure
      core flows remain usable on throttled connections
[ ] Friendly error states everywhere — no raw error codes/stack traces
      ever shown to end users (English + Urdu versions)
[ ] Skeleton loading states on all major data-fetching screens (home,
      menu, cart, orders) instead of blank screens
[ ] Empty states designed for: empty cart, no saved creations, no
      order history, no feedback yet (restaurant side)
[ ] Final cross-device test pass — at minimum: one low-end Android,
      one modern Android, one iPhone, desktop Chrome/Safari
[ ] Final full end-to-end order flow test — browse → customize → meal →
      cart → checkout → payment → KDS → kitchen LCD → ready → rider →
      delivered → feedback, with every toggle (printer, QR, GST, surge,
      loyalty) tested both ON and OFF
```

---

## Quick Reference — Section Dependency Map

```
1  Project Setup          → (none)
2  Supabase Schema         → 1
3  Auth System             → 2
4  Kitchen PIN Security    → 2,3
5  Home Screen             → 2,3
6  Item Detail Modal       → 5
7  Customizer Canvas       → 2,6
8  Customizer Interaction  → 7
9  Pizza/Simple Variants   → 7,8
10 With Meal Selector      → 8
11 Cart                    → 8,10
12 Checkout                → 11,3
13 Order Placement API     → 12,2
14 Payment (PayMob)        → 13
15 Order Tracker/Feedback  → 13
16 Profile                 → 3,11
17 Restaurant KDS          → 13,3
18 Menu Manager            → 2,3
19 Inventory Control       → 18
20 Deals Manager           → 18
21 Orders & Financials     → 17
22 Analytics               → 21
23 Feedback Log            → 15
24 Delivery & Settings     → 2
25 Staff Access (RBAC)     → 3
26 Developer Panel         → 3
27 QR Dine-In              → 24,5
28 Printer Integration     → 17,24
29 Rider Management        → 17
30 SEO/AEO/GEO/Performance → 5-16
31 Security Hardening      → all input/money sections
32 Final Polish/Edge Cases → all
```

---

## Progress Tracker

```
Total Sections: 32

[ ] 1.  Project Setup & Foundation
[ ] 2.  Supabase Setup & Database Schema
[ ] 3.  Auth System
[ ] 4.  Kitchen LCD PIN Security
[ ] 5.  Home Screen
[ ] 6.  Item Detail Modal
[ ] 7.  Customizer Engine — Canvas & Layer System
[ ] 8.  Customizer Engine — Ingredient Panels & Interaction
[ ] 9.  Pizza & Simple-Item Canvas Variants
[ ] 10. With Meal Selector
[ ] 11. Cart
[ ] 12. Checkout
[ ] 13. Order Placement API
[ ] 14. Payment Integration (PayMob)
[ ] 15. Order Tracker & Feedback
[ ] 16. Profile
[ ] 17. Restaurant Panel — Live KDS
[ ] 18. Restaurant Panel — Menu Manager
[ ] 19. Restaurant Panel — Inventory Control
[ ] 20. Restaurant Panel — Deals Manager
[ ] 21. Restaurant Panel — Orders & Financials
[ ] 22. Restaurant Panel — Analytics
[ ] 23. Restaurant Panel — Feedback Log
[ ] 24. Restaurant Panel — Delivery & Settings
[ ] 25. Restaurant Panel — Staff Access (RBAC)
[ ] 26. Developer Panel
[ ] 27. QR Code Dine-In Flow
[ ] 28. Printer Integration
[ ] 29. Rider Management
[ ] 30. SEO, AEO, GEO & Performance Pass
[ ] 31. Security Hardening Pass
[ ] 32. Final Polish & Edge Cases
```

